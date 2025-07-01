import React, { useState, useEffect } from 'react';
import { LearningPreferences, DifficultyLevel } from '../../types';

interface LearningStyleDetectorProps {
  studentId: string;
  onStyleDetected: (preferences: LearningPreferences) => void;
  initialData?: any[];
}

interface InteractionData {
  activityType: string;
  timeSpent: number;
  success: boolean;
  clickPattern: string;
  preferredMode: string;
  timestamp: Date;
}

interface StyleAnalysis {
  visual: number;
  auditory: number;
  kinesthetic: number;
  readingWriting: number;
  confidence: number;
  recommendations: string[];
}

export const LearningStyleDetector: React.FC<LearningStyleDetectorProps> = ({
  studentId,
  onStyleDetected,
  initialData = []
}) => {
  const [interactions, setInteractions] = useState<InteractionData[]>(initialData);
  const [currentAnalysis, setCurrentAnalysis] = useState<StyleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionPhase, setDetectionPhase] = useState<'collecting' | 'analyzing' | 'complete'>('collecting');

  // Collect interaction data
  useEffect(() => {
    const handleInteraction = (event: CustomEvent) => {
      const newInteraction: InteractionData = {
        activityType: event.detail.type,
        timeSpent: event.detail.timeSpent || 0,
        success: event.detail.success || false,
        clickPattern: event.detail.clickPattern || 'single',
        preferredMode: event.detail.mode || 'unknown',
        timestamp: new Date()
      };

      setInteractions(prev => [...prev, newInteraction]);
    };

    // Listen for learning interactions
    window.addEventListener('learningInteraction', handleInteraction as EventListener);
    
    return () => {
      window.removeEventListener('learningInteraction', handleInteraction as EventListener);
    };
  }, []);

  // Analyze learning style when enough data is collected
  useEffect(() => {
    if (interactions.length >= 5 && detectionPhase === 'collecting') {
      analyzePartialData();
    } else if (interactions.length >= 15 && detectionPhase === 'analyzing') {
      performFullAnalysis();
    }
  }, [interactions, detectionPhase]);

  const analyzePartialData = async () => {
    setDetectionPhase('analyzing');
    
    const basicAnalysis = performBasicAnalysis(interactions);
    setCurrentAnalysis(basicAnalysis);
    
    // Update preferences with basic analysis
    const preferences = convertToPreferences(basicAnalysis);
    onStyleDetected(preferences);
  };

  const performFullAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Send data to local AI for comprehensive analysis
      const response = await fetch('/api/local-ai/analyze-learning-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          interactions: interactions.slice(-20), // Last 20 interactions
          currentAnalysis
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiAnalysis = data.data;
        
        const enhancedAnalysis = combineAnalyses(currentAnalysis, aiAnalysis);
        setCurrentAnalysis(enhancedAnalysis);
        
        const finalPreferences = convertToPreferences(enhancedAnalysis);
        onStyleDetected(finalPreferences);
        
        setDetectionPhase('complete');
      } else {
        // Fallback to local analysis
        const localAnalysis = performAdvancedLocalAnalysis(interactions);
        setCurrentAnalysis(localAnalysis);
        
        const preferences = convertToPreferences(localAnalysis);
        onStyleDetected(preferences);
        
        setDetectionPhase('complete');
      }
    } catch (error) {
      console.error('Error in AI learning style analysis:', error);
      
      // Use enhanced local analysis as fallback
      const localAnalysis = performAdvancedLocalAnalysis(interactions);
      setCurrentAnalysis(localAnalysis);
      
      const preferences = convertToPreferences(localAnalysis);
      onStyleDetected(preferences);
      
      setDetectionPhase('complete');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performBasicAnalysis = (data: InteractionData[]): StyleAnalysis => {
    const visualActivities = ['visual_experiment', 'diagram_study', 'image_analysis', 'graph_interaction'];
    const auditoryActivities = ['audio_lesson', 'discussion', 'explanation_listening', 'sound_analysis'];
    const kinestheticActivities = ['hands_on_experiment', 'drag_drop', 'physical_simulation', 'building_activity'];
    const readingWritingActivities = ['text_reading', 'note_taking', 'text_analysis', 'written_explanation'];

    let visualScore = 0;
    let auditoryScore = 0;
    let kinestheticScore = 0;
    let readingWritingScore = 0;

    data.forEach(interaction => {
      const timeWeight = Math.min(interaction.timeSpent / 300, 2); // Normalize time to max 2x weight
      const successWeight = interaction.success ? 1.5 : 0.8;
      const totalWeight = timeWeight * successWeight;

      if (visualActivities.some(activity => interaction.activityType.includes(activity))) {
        visualScore += totalWeight;
      }
      if (auditoryActivities.some(activity => interaction.activityType.includes(activity))) {
        auditoryScore += totalWeight;
      }
      if (kinestheticActivities.some(activity => interaction.activityType.includes(activity))) {
        kinestheticScore += totalWeight;
      }
      if (readingWritingActivities.some(activity => interaction.activityType.includes(activity))) {
        readingWritingScore += totalWeight;
      }
    });

    const total = visualScore + auditoryScore + kinestheticScore + readingWritingScore;
    
    if (total === 0) {
      return {
        visual: 0.25,
        auditory: 0.25,
        kinesthetic: 0.25,
        readingWriting: 0.25,
        confidence: 0.1,
        recommendations: ['Potřebujeme více dat pro přesnější analýzu']
      };
    }

    return {
      visual: visualScore / total,
      auditory: auditoryScore / total,
      kinesthetic: kinestheticScore / total,
      readingWriting: readingWritingScore / total,
      confidence: Math.min(data.length / 15, 0.7), // Max 70% confidence for basic analysis
      recommendations: generateRecommendations(visualScore / total, auditoryScore / total, kinestheticScore / total, readingWritingScore / total)
    };
  };

  const performAdvancedLocalAnalysis = (data: InteractionData[]): StyleAnalysis => {
    const basicAnalysis = performBasicAnalysis(data);
    
    // Advanced pattern analysis
    const patterns = analyzePatterns(data);
    const timePatterns = analyzeTimePatterns(data);
    const successPatterns = analyzeSuccessPatterns(data);
    
    // Adjust scores based on patterns
    let adjustedVisual = basicAnalysis.visual;
    let adjustedAuditory = basicAnalysis.auditory;
    let adjustedKinesthetic = basicAnalysis.kinesthetic;
    let adjustedReadingWriting = basicAnalysis.readingWriting;

    // Quick interaction pattern suggests kinesthetic preference
    if (patterns.averageClickSpeed > 2) {
      adjustedKinesthetic += 0.1;
    }

    // Long reading times suggest reading/writing preference
    if (timePatterns.averageTextTime > 180) {
      adjustedReadingWriting += 0.1;
    }

    // High success with visual elements
    if (successPatterns.visualSuccessRate > 0.8) {
      adjustedVisual += 0.1;
    }

    // Normalize adjusted scores
    const adjustedTotal = adjustedVisual + adjustedAuditory + adjustedKinesthetic + adjustedReadingWriting;
    
    return {
      visual: adjustedVisual / adjustedTotal,
      auditory: adjustedAuditory / adjustedTotal,
      kinesthetic: adjustedKinesthetic / adjustedTotal,
      readingWriting: adjustedReadingWriting / adjustedTotal,
      confidence: Math.min(data.length / 10, 0.9),
      recommendations: generateAdvancedRecommendations(adjustedVisual / adjustedTotal, adjustedAuditory / adjustedTotal, adjustedKinesthetic / adjustedTotal, adjustedReadingWriting / adjustedTotal, patterns)
    };
  };

  const analyzePatterns = (data: InteractionData[]) => {
    const clickSpeeds = data.filter(d => d.clickPattern).map(d => d.clickPattern === 'fast' ? 3 : d.clickPattern === 'medium' ? 2 : 1);
    const averageClickSpeed = clickSpeeds.reduce((sum, speed) => sum + speed, 0) / clickSpeeds.length || 1;

    return {
      averageClickSpeed,
      preferredModes: data.map(d => d.preferredMode).filter(mode => mode !== 'unknown'),
      totalInteractions: data.length
    };
  };

  const analyzeTimePatterns = (data: InteractionData[]) => {
    const textActivities = data.filter(d => d.activityType.includes('text') || d.activityType.includes('reading'));
    const visualActivities = data.filter(d => d.activityType.includes('visual') || d.activityType.includes('image'));
    
    return {
      averageTextTime: textActivities.reduce((sum, act) => sum + act.timeSpent, 0) / textActivities.length || 0,
      averageVisualTime: visualActivities.reduce((sum, act) => sum + act.timeSpent, 0) / visualActivities.length || 0
    };
  };

  const analyzeSuccessPatterns = (data: InteractionData[]) => {
    const visualActivities = data.filter(d => d.activityType.includes('visual'));
    const auditoryActivities = data.filter(d => d.activityType.includes('audio'));
    
    return {
      visualSuccessRate: visualActivities.filter(d => d.success).length / visualActivities.length || 0,
      auditorySuccessRate: auditoryActivities.filter(d => d.success).length / auditoryActivities.length || 0
    };
  };

  const combineAnalyses = (local: StyleAnalysis | null, ai: any): StyleAnalysis => {
    if (!local) return ai;
    
    // Weighted combination: 60% AI, 40% local
    return {
      visual: (ai.styleDistribution?.visual || 0) * 0.6 + local.visual * 0.4,
      auditory: (ai.styleDistribution?.auditory || 0) * 0.6 + local.auditory * 0.4,
      kinesthetic: (ai.styleDistribution?.kinesthetic || 0) * 0.6 + local.kinesthetic * 0.4,
      readingWriting: (ai.styleDistribution?.reading_writing || 0) * 0.6 + local.readingWriting * 0.4,
      confidence: Math.max(ai.confidence || 0, local.confidence),
      recommendations: [...(local.recommendations || []), ...(ai.recommendations || [])]
    };
  };

  const generateRecommendations = (visual: number, auditory: number, kinesthetic: number, readingWriting: number): string[] => {
    const recommendations: string[] = [];
    const dominant = Math.max(visual, auditory, kinesthetic, readingWriting);

    if (visual === dominant) {
      recommendations.push('Využívej diagramy, grafy a vizuální pomůcky');
      recommendations.push('Zvýrazňuj si důležité informace barvami');
      recommendations.push('Sleduj video výukové materiály');
    }
    
    if (auditory === dominant) {
      recommendations.push('Poslouchej zvukové nahrávky a podcasty');
      recommendations.push('Diskutuj o látce s ostatními');
      recommendations.push('Čti si nahlas při učení');
    }
    
    if (kinesthetic === dominant) {
      recommendations.push('Prováděj praktické experimenty');
      recommendations.push('Používej manipulativní objekty při učení');
      recommendations.push('Dělej si přestávky a pohybuj se');
    }
    
    if (readingWriting === dominant) {
      recommendations.push('Veď si podrobné poznámky');
      recommendations.push('Čti doplňkové texty a knihy');
      recommendations.push('Piš si shrnutí a myšlenkové mapy');
    }

    return recommendations;
  };

  const generateAdvancedRecommendations = (visual: number, auditory: number, kinesthetic: number, readingWriting: number, patterns: any): string[] => {
    const basic = generateRecommendations(visual, auditory, kinesthetic, readingWriting);
    const advanced: string[] = [];

    if (patterns.averageClickSpeed > 2.5) {
      advanced.push('Rychle zpracováváš informace - zkus interaktivní aktivity');
    }

    if (visual > 0.4 && kinesthetic > 0.3) {
      advanced.push('Kombinuj vizuální a praktické prvky pro nejlepší výsledky');
    }

    return [...basic, ...advanced];
  };

  const convertToPreferences = (analysis: StyleAnalysis): LearningPreferences => {
    return {
      visualLearning: analysis.visual,
      auditoryLearning: analysis.auditory,
      kinestheticLearning: analysis.kinesthetic,
      readingWritingLearning: analysis.readingWriting,
      preferredDifficulty: analysis.kinesthetic > 0.4 ? DifficultyLevel.MEDIUM : DifficultyLevel.EASY,
      sessionLength: analysis.kinesthetic > 0.4 ? 45 : 30
    };
  };

  const getDominantStyle = (): string => {
    if (!currentAnalysis) return 'Neznámý';
    
    const { visual, auditory, kinesthetic, readingWriting } = currentAnalysis;
    const max = Math.max(visual, auditory, kinesthetic, readingWriting);
    
    if (visual === max) return 'Vizuální';
    if (auditory === max) return 'Sluchový';
    if (kinesthetic === max) return 'Kinestetický';
    return 'Čtení/Psaní';
  };

  const getConfidenceColor = (): string => {
    if (!currentAnalysis) return 'gray';
    
    if (currentAnalysis.confidence >= 0.8) return 'green';
    if (currentAnalysis.confidence >= 0.6) return 'yellow';
    if (currentAnalysis.confidence >= 0.4) return 'orange';
    return 'red';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          🧠 Detekce stylu učení
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          detectionPhase === 'complete' ? 'bg-green-100 text-green-800' :
          detectionPhase === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {detectionPhase === 'complete' ? '✅ Dokončeno' :
           detectionPhase === 'analyzing' ? '🔄 Analyzuje se' :
           '📊 Sbírá se data'}
        </div>
      </div>

      {/* Data Collection Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Sebraná data: {interactions.length}/15
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((interactions.length / 15) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((interactions.length / 15) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Current Analysis */}
      {currentAnalysis && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Aktuální analýza stylu učení</h4>
            
            {/* Style Distribution */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">👁️ Vizuální</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${currentAnalysis.visual * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {Math.round(currentAnalysis.visual * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">👂 Sluchový</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${currentAnalysis.auditory * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {Math.round(currentAnalysis.auditory * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">🤏 Kinestetický</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${currentAnalysis.kinesthetic * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {Math.round(currentAnalysis.kinesthetic * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">📝 Čtení/Psaní</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${currentAnalysis.readingWriting * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">
                    {Math.round(currentAnalysis.readingWriting * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                Dominantní styl: {getDominantStyle()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                getConfidenceColor() === 'green' ? 'bg-green-100 text-green-800' :
                getConfidenceColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                getConfidenceColor() === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                Spolehlivost: {Math.round(currentAnalysis.confidence * 100)}%
              </span>
            </div>
            
            {/* Recommendations */}
            {currentAnalysis.recommendations.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Doporučení:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm text-blue-700">
                Provádím pokročilou analýzu pomocí AI...
              </span>
            </div>
          )}
        </div>
      )}

      {/* No data yet */}
      {interactions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤔</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Zatím žádná data
          </h4>
          <p className="text-gray-600">
            Začni používat aktivity a my automaticky detekujeme tvůj styl učení
          </p>
        </div>
      )}
    </div>
  );
};