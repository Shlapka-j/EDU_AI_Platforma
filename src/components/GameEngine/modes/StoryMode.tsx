import React, { useState, useEffect } from 'react';
import { Activity, GameState, LearningPreferences } from '../../../types';

interface StoryModeProps {
  activity: Activity;
  gameState: GameState;
  preferences: LearningPreferences;
  adaptiveSettings: any;
  onComplete: (result: any) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: (interaction: any) => void;
}

interface StoryStep {
  id: string;
  text: string;
  choices?: Array<{
    id: string;
    text: string;
    consequence?: string;
    points?: number;
    nextStep?: string;
  }>;
  isEnding?: boolean;
  imageUrl?: string;
  audioUrl?: string;
}

export const StoryMode: React.FC<StoryModeProps> = ({
  activity,
  gameState,
  preferences,
  adaptiveSettings,
  onComplete,
  onProgressUpdate,
  onInteraction
}) => {
  const [currentStep, setCurrentStep] = useState<StoryStep | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [playerChoices, setPlayerChoices] = useState<Array<{ stepId: string; choiceId: string; timestamp: Date }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [collectedPoints, setCollectedPoints] = useState(0);

  // Initialize story with AI-generated content
  useEffect(() => {
    generateInitialStory();
  }, [activity]);

  const generateInitialStory = async () => {
    setIsGenerating(true);
    try {
      // Generate story using local AI
      const response = await fetch('/api/local-ai/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          title: activity.title,
          description: activity.description,
          objectives: ['Prakticky aplikovat fyzikální principy'],
          difficulty: adaptiveSettings.difficulty,
          studentProfile: {
            learningStyle: preferences.visualLearning > 0.5 ? 'visual' : 'text',
            grade: 6
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const storyContent = data.data;
        
        // Convert AI response to story steps
        const initialStep = convertToStoryStep(storyContent, 0);
        setCurrentStep(initialStep);
        onProgressUpdate(10);
      } else {
        // Fallback to predefined story
        loadFallbackStory();
      }
    } catch (error) {
      console.error('Error generating story:', error);
      loadFallbackStory();
    } finally {
      setIsGenerating(false);
    }
  };

  const convertToStoryStep = (aiContent: any, stepIndex: number): StoryStep => {
    const scenarios = aiContent.scenario.split('.').filter((s: string) => s.trim());
    const currentScenario = scenarios[stepIndex] || scenarios[0];
    
    return {
      id: `step_${stepIndex}`,
      text: currentScenario.trim() + '.',
      choices: [
        {
          id: 'choice_1',
          text: 'Prozkoumej gravitační sílu pomocí různých předmětů',
          consequence: 'Rozhodl ses experimentovat s různými předměty a jejich pádem.',
          points: 15,
          nextStep: `step_${stepIndex + 1}`
        },
        {
          id: 'choice_2', 
          text: 'Změř čas pádu různých objektů',
          consequence: 'Vzal sis stopky a začal měřit přesný čas pádu.',
          points: 20,
          nextStep: `step_${stepIndex + 1}`
        },
        {
          id: 'choice_3',
          text: 'Předpověz, který předmět dopadne dříve',
          consequence: 'Rozhodl ses nejdříve teoreticky přemýšlet o problému.',
          points: 10,
          nextStep: `step_${stepIndex + 1}`
        }
      ]
    };
  };

  const loadFallbackStory = () => {
    const fallbackStep: StoryStep = {
      id: 'step_0',
      text: 'Stojíš na vrcholu školní věže a držíš v rukou pero a kámen. Tvým úkolem je prozkoumat, jak gravitace působí na různé předměty. Co uděláš jako první?',
      choices: [
        {
          id: 'choice_1',
          text: 'Pustím obě předměty současně',
          consequence: 'Zajímavé! Oba předměty dopadly prakticky současně. Proč myslíš, že tomu tak je?',
          points: 15,
          nextStep: 'step_1'
        },
        {
          id: 'choice_2',
          text: 'Nejdříve pustím pero, pak kámen',
          consequence: 'Dobrá stratégie! Pozorováním jednotlivých pádů můžeš lépe porovnat rozdíly.',
          points: 10,
          nextStep: 'step_1'
        },
        {
          id: 'choice_3',
          text: 'Změřím si nejdříve výšku věže',
          consequence: 'Výborně! Přesné měření je základ každého fyzikálního experimentu.',
          points: 20,
          nextStep: 'step_1'
        }
      ]
    };
    setCurrentStep(fallbackStep);
    onProgressUpdate(10);
  };

  const handleChoice = async (choice: any) => {
    if (!currentStep) return;

    const choiceRecord = {
      stepId: currentStep.id,
      choiceId: choice.id,
      timestamp: new Date()
    };

    setPlayerChoices(prev => [...prev, choiceRecord]);
    setCollectedPoints(prev => prev + (choice.points || 0));

    // Track interaction
    onInteraction({
      type: 'story_choice',
      stepId: currentStep.id,
      choiceId: choice.id,
      choiceText: choice.text,
      points: choice.points
    });

    // Show consequence if exists
    if (choice.consequence) {
      // Add a brief delay to show the consequence
      setTimeout(() => {
        generateNextStep(choice);
      }, 2000);
    } else {
      generateNextStep(choice);
    }
  };

  const generateNextStep = async (previousChoice: any) => {
    const newProgress = Math.min(storyProgress + 20, 100);
    setStoryProgress(newProgress);
    onProgressUpdate(newProgress);

    if (newProgress >= 100) {
      // Story complete
      const finalResult = {
        type: 'story_complete',
        score: collectedPoints / (playerChoices.length * 20), // Normalize score
        points: collectedPoints,
        choices: playerChoices,
        totalSteps: playerChoices.length + 1,
        learningObjectives: activity.learningObjectives || [],
        feedback: generateFeedback()
      };

      onComplete(finalResult);
      return;
    }

    // Generate next step based on previous choice
    setIsGenerating(true);
    try {
      // Use local AI to generate next step
      const response = await fetch('/api/local-ai/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          title: `Pokračování příběhu - ${activity.title}`,
          description: `Předchozí volba: ${previousChoice.text}. Následek: ${previousChoice.consequence}`,
          objectives: activity.learningObjectives || [],
          context: {
            previousChoices: playerChoices,
            currentProgress: newProgress,
            learningStyle: preferences.visualLearning > 0.5 ? 'visual' : 'text'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const nextStep = convertToStoryStep(data.data, playerChoices.length);
        setCurrentStep(nextStep);
      } else {
        // Fallback to predefined next step
        generateFallbackNextStep(previousChoice);
      }
    } catch (error) {
      console.error('Error generating next step:', error);
      generateFallbackNextStep(previousChoice);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackNextStep = (previousChoice: any) => {
    const fallbackSteps: { [key: string]: StoryStep } = {
      'step_1': {
        id: 'step_1',
        text: 'Tvoje pozorování je fascinující! Nyní máš před sebou další výzvu. Chceš zjistit, jak rychlost pádu závisí na hmotnosti předmětu. Co bys udělal pro další experiment?',
        choices: [
          {
            id: 'choice_4',
            text: 'Vezmu těžší předměty a porovnám je s lehčími',
            consequence: 'Skvělý nápad! Porovnání různých hmotností ti pomůže pochopit gravitační zrychlení.',
            points: 25,
            nextStep: 'step_2'
          },
          {
            id: 'choice_5',
            text: 'Zkusím změnit výšku, ze které předměty pouštím',
            consequence: 'Výborná myšlenka! Různé výšky ti ukážou, jak se mění rychlost během pádu.',
            points: 20,
            nextStep: 'step_2'
          }
        ]
      }
    };

    setCurrentStep(fallbackSteps['step_1']);
  };

  const generateFeedback = (): string => {
    const totalPossiblePoints = playerChoices.length * 20;
    const scorePercentage = (collectedPoints / totalPossiblePoints) * 100;

    if (scorePercentage >= 80) {
      return 'Fantastické! Tvé volby ukazují výborné chápání fyzikálních principů. Pokračuj v experimentování!';
    } else if (scorePercentage >= 60) {
      return 'Dobrá práce! Některé tvé úvahy byly velmi zajímavé. Zkus příště více experimentovat.';
    } else {
      return 'Děláš pokroky! Fyzika je o pozorování a experimentování. Zkus být více zvědavý!';
    }
  };

  if (isGenerating && !currentStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
        <p className="text-gray-600">Připravuji příběh speciálně pro tebe...</p>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Nepodařilo se načíst příběh.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Story Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Pokrok příběhu:</span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${storyProgress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{storyProgress}%</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-yellow-600">
              📊 Body: {collectedPoints}
            </span>
            <span className="text-sm text-blue-600">
              🎯 Kroky: {playerChoices.length + 1}
            </span>
          </div>
        </div>

        {/* Story Text */}
        <div className="mb-8">
          <div className="text-lg leading-relaxed text-gray-800 mb-4">
            {currentStep.text}
          </div>
          
          {/* Visual elements for visual learners */}
          {preferences.visualLearning > 0.5 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-6xl text-center mb-2">🏗️</div>
              <p className="text-sm text-blue-700 text-center">
                Představ si scénář vizuálně
              </p>
            </div>
          )}
        </div>

        {/* Choices */}
        {currentStep.choices && currentStep.choices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Co uděláš? 🤔
            </h3>
            {currentStep.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                disabled={isGenerating}
                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{choice.text}</p>
                    {choice.points && (
                      <p className="text-sm text-green-600 mt-1">
                        +{choice.points} bodů
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading next step */}
        {isGenerating && currentStep.choices && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              <span className="text-gray-600">Připravuji další část příběhu...</span>
            </div>
          </div>
        )}
      </div>

      {/* Choice History */}
      {playerChoices.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tvá cesta příběhem 📚
          </h3>
          <div className="space-y-2">
            {playerChoices.map((choice, index) => (
              <div key={`${choice.stepId}-${choice.choiceId}`} className="flex items-center space-x-3 text-sm">
                <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-600">
                  Krok {index + 1}: Vybral sis možnost {choice.choiceId.split('_')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};