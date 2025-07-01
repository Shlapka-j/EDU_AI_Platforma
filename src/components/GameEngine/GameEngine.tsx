import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Activity, ActivityType, LearningPreferences } from '../../types';
import { StoryMode } from './modes/StoryMode';
import { QuizMode } from './modes/QuizMode';
import { ExplorationMode } from './modes/ExplorationMode';
import { DiscussionMode } from './modes/DiscussionMode';
import { MiniGameMode } from './modes/MiniGameMode';
import { NarrativeMode } from './modes/NarrativeMode';

interface GameEngineProps {
  studentId: string;
  currentActivity: Activity;
  gameState: GameState;
  onActivityComplete: (result: any) => void;
  onStateUpdate: (newState: Partial<GameState>) => void;
  preferences: LearningPreferences;
}

interface GameSession {
  sessionId: string;
  startTime: Date;
  interactions: any[];
  currentProgress: number;
}

export const GameEngine: React.FC<GameEngineProps> = ({
  studentId,
  currentActivity,
  gameState,
  onActivityComplete,
  onStateUpdate,
  preferences
}) => {
  const [session, setSession] = useState<GameSession>({
    sessionId: `session_${Date.now()}`,
    startTime: new Date(),
    interactions: [],
    currentProgress: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    difficulty: currentActivity.difficulty || 'medium',
    pace: preferences.sessionLength || 30,
    hints: true,
    autoSave: true
  });

  // Adaptive difficulty adjustment based on student performance
  const adjustDifficulty = useCallback((performance: number) => {
    if (performance > 0.8 && adaptiveSettings.difficulty === 'easy') {
      setAdaptiveSettings(prev => ({ ...prev, difficulty: 'medium' }));
    } else if (performance < 0.5 && adaptiveSettings.difficulty === 'hard') {
      setAdaptiveSettings(prev => ({ ...prev, difficulty: 'medium' }));
    } else if (performance < 0.3 && adaptiveSettings.difficulty === 'medium') {
      setAdaptiveSettings(prev => ({ ...prev, difficulty: 'easy' }));
    }
  }, [adaptiveSettings.difficulty]);

  // Track user interactions for learning analytics
  const trackInteraction = useCallback((interaction: any) => {
    const newInteraction = {
      ...interaction,
      timestamp: new Date(),
      sessionId: session.sessionId,
      studentId,
      activityId: currentActivity.id
    };

    setSession(prev => ({
      ...prev,
      interactions: [...prev.interactions, newInteraction]
    }));

    // Send to analytics service
    fetch('/api/analytics/track-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(newInteraction)
    }).catch(error => console.warn('Analytics tracking failed:', error));
  }, [session.sessionId, studentId, currentActivity.id]);

  // Auto-save game state periodically
  useEffect(() => {
    if (!adaptiveSettings.autoSave) return;

    const interval = setInterval(() => {
      onStateUpdate({
        progress: { ...gameState.progress, [currentActivity.id]: session.currentProgress },
        stats: {
          ...gameState.stats,
          totalTimeSpent: gameState.stats.totalTimeSpent + 60 // Add 1 minute
        }
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [currentActivity.id, session.currentProgress, gameState, onStateUpdate, adaptiveSettings.autoSave]);

  // Handle activity completion
  const handleActivityComplete = useCallback((result: any) => {
    const completionData = {
      ...result,
      sessionData: session,
      timeSpent: Date.now() - session.startTime.getTime(),
      interactions: session.interactions,
      adaptiveSettings
    };

    // Update game stats
    const newStats = {
      ...gameState.stats,
      completedActivities: gameState.stats.completedActivities + 1,
      totalXP: gameState.stats.totalXP + (result.points || 0),
      totalTimeSpent: gameState.stats.totalTimeSpent + Math.floor((Date.now() - session.startTime.getTime()) / 1000)
    };

    // Calculate new level
    const newLevel = Math.floor(newStats.totalXP / 1000) + 1;
    if (newLevel > newStats.level) {
      newStats.level = newLevel;
      // Show level up notification
      trackInteraction({
        type: 'level_up',
        newLevel,
        previousLevel: gameState.stats.level
      });
    }

    onStateUpdate({ stats: newStats });
    onActivityComplete(completionData);

    // Adjust difficulty based on performance
    if (result.score !== undefined) {
      adjustDifficulty(result.score);
    }
  }, [session, gameState.stats, onStateUpdate, onActivityComplete, trackInteraction, adjustDifficulty, adaptiveSettings]);

  // Update progress
  const handleProgressUpdate = useCallback((progress: number) => {
    setSession(prev => ({ ...prev, currentProgress: progress }));
    
    trackInteraction({
      type: 'progress_update',
      progress,
      activityType: currentActivity.type
    });
  }, [currentActivity.type, trackInteraction]);

  // Render appropriate mode based on activity type
  const renderActivityMode = () => {
    const commonProps = {
      activity: currentActivity,
      gameState,
      preferences,
      adaptiveSettings,
      onComplete: handleActivityComplete,
      onProgressUpdate: handleProgressUpdate,
      onInteraction: trackInteraction
    };

    switch (currentActivity.type) {
      case ActivityType.STORY:
        return <StoryMode {...commonProps} />;
      
      case ActivityType.QUIZ:
        return <QuizMode {...commonProps} />;
      
      case ActivityType.EXPLORATION:
        return <ExplorationMode {...commonProps} />;
      
      case ActivityType.DISCUSSION:
        return <DiscussionMode {...commonProps} />;
      
      case ActivityType.MINI_GAME:
        return <MiniGameMode {...commonProps} />;
      
      case ActivityType.NARRATIVE_ADVENTURE:
        return <NarrativeMode {...commonProps} activity={currentActivity as any} />;
      
      default:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nepodporovaný typ aktivity
            </h3>
            <p className="text-gray-600">
              Typ aktivity "{currentActivity.type}" není podporován.
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="game-engine min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Game Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                {currentActivity.title}
              </h1>
              <span className="text-sm text-gray-500">
                Session: {Math.floor((Date.now() - session.startTime.getTime()) / 60000)}m
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* XP Display */}
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{gameState.stats.totalXP} XP</span>
              </div>
              
              {/* Level Display */}
              <div className="flex items-center space-x-2">
                <span className="text-purple-500">🎯</span>
                <span className="font-medium">Level {gameState.stats.level}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${session.currentProgress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {Math.round(session.currentProgress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActivityMode()}
      </div>

      {/* Adaptive Settings Panel (Hidden by default) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <h4 className="font-medium text-gray-900 mb-2">Nastavení</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Obtížnost:</span>
              <span className="capitalize">{adaptiveSettings.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span>Tempo:</span>
              <span>{adaptiveSettings.pace}m</span>
            </div>
            <div className="flex justify-between">
              <span>Nápovědy:</span>
              <span>{adaptiveSettings.hints ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};