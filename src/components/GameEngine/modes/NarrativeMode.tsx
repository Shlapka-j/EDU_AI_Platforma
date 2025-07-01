import React, { useState, useEffect, useCallback } from 'react';
import { 
  NarrativeActivity, 
  Scene, 
  Choice, 
  GameState, 
  LearningPreferences,
  NarrativeResult,
  StoryProgress,
  GameAction 
} from '../../../types';
import { NarrativeEngine } from '../NarrativeEngine';

interface NarrativeModeProps {
  activity: NarrativeActivity;
  gameState: GameState;
  preferences: LearningPreferences;
  adaptiveSettings: any;
  onComplete: (result: any) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: (interaction: any) => void;
}

interface NarrativeUIState {
  isLoading: boolean;
  currentScene: Scene | null;
  availableChoices: Choice[];
  selectedChoice: string | null;
  showConsequence: boolean;
  consequenceText: string;
  actionMessages: string[];
  progress: number;
}

export const NarrativeMode: React.FC<NarrativeModeProps> = ({
  activity,
  gameState,
  preferences,
  adaptiveSettings,
  onComplete,
  onProgressUpdate,
  onInteraction
}) => {
  const [narrativeEngine, setNarrativeEngine] = useState<NarrativeEngine | null>(null);
  const [uiState, setUIState] = useState<NarrativeUIState>({
    isLoading: true,
    currentScene: null,
    availableChoices: [],
    selectedChoice: null,
    showConsequence: false,
    consequenceText: '',
    actionMessages: [],
    progress: 0
  });

  // Initialize narrative engine
  useEffect(() => {
    const engine = new NarrativeEngine(activity);
    setNarrativeEngine(engine);
    
    const currentScene = engine.getCurrentScene();
    const availableChoices = engine.getAvailableChoices();
    
    setUIState(prev => ({
      ...prev,
      isLoading: false,
      currentScene,
      availableChoices,
      progress: 10
    }));
    
    onProgressUpdate(10);
  }, [activity, onProgressUpdate]);

  const handleChoiceSelect = useCallback(async (choiceId: string) => {
    if (!narrativeEngine || uiState.isLoading) return;

    const choice = uiState.availableChoices.find(c => c.id === choiceId);
    if (!choice) return;

    setUIState(prev => ({
      ...prev,
      selectedChoice: choiceId,
      isLoading: true
    }));

    // Track interaction
    onInteraction({
      type: 'narrative_choice',
      sceneId: uiState.currentScene?.id,
      choiceId,
      choiceText: choice.text,
      timestamp: new Date(),
      educationalValue: choice.educationalFeedback ? 3 : 1
    });

    // Show consequence if exists
    if (choice.consequence) {
      setUIState(prev => ({
        ...prev,
        showConsequence: true,
        consequenceText: choice.consequence || ''
      }));

      // Wait for user to read consequence
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    // Process choice through engine
    const result = await narrativeEngine.processChoice(choiceId);
    
    if (result.success) {
      // Generate action messages
      const actionMessages = result.actions.map(action => 
        generateActionMessage(action)
      ).filter(msg => msg !== null) as string[];

      if (result.result) {
        // Story complete
        onComplete({
          ...result.result,
          type: 'narrative_complete',
          activityId: activity.id
        });
        return;
      }

      // Update UI with new scene
      const newProgress = Math.min(uiState.progress + 15, 90);
      setUIState({
        isLoading: false,
        currentScene: result.nextScene,
        availableChoices: narrativeEngine.getAvailableChoices(),
        selectedChoice: null,
        showConsequence: false,
        consequenceText: '',
        actionMessages,
        progress: newProgress
      });

      onProgressUpdate(newProgress);
    } else {
      // Handle error
      setUIState(prev => ({
        ...prev,
        isLoading: false,
        selectedChoice: null,
        showConsequence: false
      }));
    }
  }, [narrativeEngine, uiState, activity.id, onComplete, onProgressUpdate, onInteraction]);

  const generateActionMessage = (action: GameAction): string | null => {
    switch (action.type) {
      case 'add_item':
        return `🎒 Získal jsi: ${action.target}`;
      case 'remove_item':
        return `❌ Ztratil jsi: ${action.target}`;
      case 'add_points':
        return `⭐ +${action.value} bodů`;
      case 'set_flag':
        return action.message || null;
      case 'modify_relationship':
        const change = action.value > 0 ? 'zlepšil' : 'zhoršil';
        return `💭 ${change} jsi vztah s ${action.target}`;
      default:
        return action.message || null;
    }
  };

  const renderInventory = () => {
    if (!narrativeEngine) return null;
    
    const inventory = Array.from(narrativeEngine.getGameState().inventory.entries())
      .filter(([_, hasItem]) => hasItem)
      .map(([item, _]) => item);

    if (inventory.length === 0) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">🎒 Inventář:</h4>
        <div className="flex flex-wrap gap-2">
          {inventory.map(item => (
            <span key={item} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderEducationalContent = (scene: Scene) => {
    if (!scene.educationalContent) return null;

    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-green-400 text-xl">💡</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800">
              Vzdělávací obsah: {scene.educationalContent.concept}
            </h4>
            <p className="mt-1 text-sm text-green-700">
              {scene.educationalContent.explanation}
            </p>
            {scene.educationalContent.examples && scene.educationalContent.examples.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-green-800">Příklady:</p>
                <ul className="text-xs text-green-700 list-disc list-inside">
                  {scene.educationalContent.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActionMessages = () => {
    if (uiState.actionMessages.length === 0) return null;

    return (
      <div className="mb-4 space-y-2">
        {uiState.actionMessages.map((message, index) => (
          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-sm text-yellow-800">{message}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderVisualElements = () => {
    if (preferences.visualLearning < 0.5) return null;

    const scene = uiState.currentScene;
    if (!scene) return null;

    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-4 text-center">
        <div className="text-4xl mb-2">
          {scene.location.includes('škola') ? '🏫' : 
           scene.location.includes('laboratoř') ? '🔬' : 
           scene.location.includes('knihovna') ? '📚' : '🌟'}
        </div>
        <p className="text-sm text-blue-700">
          📍 {scene.location}
        </p>
        {scene.description && (
          <p className="text-xs text-blue-600 mt-1">
            {scene.description}
          </p>
        )}
      </div>
    );
  };

  if (uiState.isLoading && !uiState.currentScene) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
        <p className="text-gray-600">Připravuji narrativní dobrodružství...</p>
      </div>
    );
  }

  if (!uiState.currentScene) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Nepodařilo se načíst příběh.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress and Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Pokrok příběhu:</span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uiState.progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{uiState.progress}%</span>
          </div>
          
          {narrativeEngine && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-yellow-600">
                ⭐ Body: {narrativeEngine.getGameState().totalPoints}
              </span>
              <span className="text-sm text-blue-600">
                🎯 Volby: {narrativeEngine.getGameState().totalChoices}
              </span>
              <span className="text-sm text-green-600">
                📍 Místa: {narrativeEngine.getGameState().visitedScenes.size}
              </span>
            </div>
          )}
        </div>

        {/* Scene Title and Location */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {uiState.currentScene.title}
          </h2>
          <p className="text-sm text-gray-500">
            📍 {uiState.currentScene.location}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        {/* Visual Elements */}
        {renderVisualElements()}

        {/* Inventory */}
        {renderInventory()}

        {/* Action Messages */}
        {renderActionMessages()}

        {/* Educational Content */}
        {renderEducationalContent(uiState.currentScene)}

        {/* Story Text */}
        <div className="mb-8">
          <div className="text-lg leading-relaxed text-gray-800 mb-4">
            {uiState.currentScene.text}
          </div>
        </div>

        {/* Consequence Display */}
        {uiState.showConsequence && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">💭</span>
              </div>
              <div className="ml-3">
                <p className="text-blue-800 font-medium">Následek tvé volby:</p>
                <p className="text-blue-700 mt-1">{uiState.consequenceText}</p>
              </div>
            </div>
          </div>
        )}

        {/* Choices */}
        {uiState.availableChoices.length > 0 && !uiState.showConsequence && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Co uděláš? 🤔
            </h3>
            {uiState.availableChoices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelect(choice.id)}
                disabled={uiState.isLoading || uiState.selectedChoice === choice.id}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  uiState.selectedChoice === choice.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{choice.text}</p>
                    {choice.description && (
                      <p className="text-sm text-gray-600 mt-1">{choice.description}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      {choice.points && (
                        <span className="text-sm text-green-600">
                          ⭐ +{choice.points} bodů
                        </span>
                      )}
                      {choice.difficulty && (
                        <span className={`text-sm px-2 py-1 rounded ${
                          choice.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                          choice.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {choice.difficulty === 'easy' ? '🟢 Snadné' :
                           choice.difficulty === 'medium' ? '🟡 Střední' : '🔴 Těžké'}
                        </span>
                      )}
                      {choice.educationalFeedback && (
                        <span className="text-sm text-blue-600">
                          💡 Vzdělávací obsah
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading next scene */}
        {uiState.isLoading && uiState.currentScene && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              <span className="text-gray-600">
                {uiState.showConsequence ? 'Zpracovávám následky...' : 'Připravuji další část příběhu...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress History */}
      {narrativeEngine && narrativeEngine.getProgressHistory().length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📚 Tvá cesta příběhem
          </h3>
          <div className="space-y-2">
            {narrativeEngine.getProgressHistory().map((progress, index) => (
              <div key={`${progress.sceneId}-${progress.choiceId}`} className="flex items-center space-x-3 text-sm">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-600">
                  Krok {index + 1}: Vzdělávací hodnota {progress.educationalValue}/5
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round(progress.timeSpent / 1000)}s)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};