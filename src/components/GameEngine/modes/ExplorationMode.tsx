import React, { useState, useEffect } from 'react';
import { Activity, GameState, LearningPreferences } from '../../../types';

interface ExplorationModeProps {
  activity: Activity;
  gameState: GameState;
  preferences: LearningPreferences;
  adaptiveSettings: any;
  onComplete: (result: any) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: (interaction: any) => void;
}

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  isUnlocked: boolean;
  usageCount: number;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  requiredTools: string[];
  steps: ExperimentStep[];
  expectedResult: string;
  isCompleted: boolean;
}

interface ExperimentStep {
  id: string;
  instruction: string;
  action: 'select_tool' | 'set_parameter' | 'observe' | 'record' | 'analyze';
  expectedValue?: any;
  tolerance?: number;
}

interface Observation {
  experimentId: string;
  stepId: string;
  value: any;
  timestamp: Date;
  tool: string;
}

export const ExplorationMode: React.FC<ExplorationModeProps> = ({
  activity,
  gameState,
  preferences,
  adaptiveSettings,
  onComplete,
  onProgressUpdate,
  onInteraction
}) => {
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isExperimenting, setIsExperimenting] = useState(false);
  const [discoveredConcepts, setDiscoveredConcepts] = useState<string[]>([]);
  const [explorationPoints, setExplorationPoints] = useState(0);

  // Initialize exploration environment
  useEffect(() => {
    initializeExplorationEnvironment();
  }, [activity]);

  const initializeExplorationEnvironment = async () => {
    // Set up tools based on activity content and student preferences
    const tools: Tool[] = [
      {
        id: 'ruler',
        name: 'Pravítko',
        icon: '📏',
        description: 'Měření vzdáleností a výšek',
        isUnlocked: true,
        usageCount: 0
      },
      {
        id: 'stopwatch',
        name: 'Stopky',
        icon: '⏱️',
        description: 'Měření času',
        isUnlocked: true,
        usageCount: 0
      },
      {
        id: 'scale',
        name: 'Váha',
        icon: '⚖️',
        description: 'Měření hmotnosti předmětů',
        isUnlocked: gameState.stats.completedActivities > 1,
        usageCount: 0
      },
      {
        id: 'thermometer',
        name: 'Teploměr',
        icon: '🌡️',
        description: 'Měření teploty',
        isUnlocked: gameState.stats.level > 2,
        usageCount: 0
      },
      {
        id: 'magnifying_glass',
        name: 'Lupa',
        icon: '🔍',
        description: 'Pozorování detailů',
        isUnlocked: true,
        usageCount: 0
      },
      {
        id: 'calculator',
        name: 'Kalkulačka',
        icon: '🧮',
        description: 'Výpočty a analýza dat',
        isUnlocked: gameState.stats.physicsUnderstandingLevel > 30,
        usageCount: 0
      }
    ];

    setAvailableTools(tools);

    // Generate experiments based on AI
    await generateExperiments();
  };

  const generateExperiments = async () => {
    try {
      const response = await fetch('/api/local-ai/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          title: `Experimentální úkoly - ${activity.title}`,
          description: activity.description,
          objectives: [],
          type: 'exploration',
          difficulty: adaptiveSettings.difficulty,
          studentProfile: {
            learningStyle: preferences.kinestheticLearning > 0.5 ? 'hands-on' : 'theoretical',
            level: gameState.stats.level
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedExperiments = convertToExperiments(data.data);
        setExperiments(generatedExperiments);
      } else {
        loadFallbackExperiments();
      }
    } catch (error) {
      console.error('Error generating experiments:', error);
      loadFallbackExperiments();
    }
  };

  const convertToExperiments = (aiData: any): Experiment[] => {
    return [
      {
        id: 'gravity_experiment',
        name: 'Zkoumání gravitace',
        description: 'Prozkoumej, jak gravitace působí na různé předměty',
        requiredTools: ['ruler', 'stopwatch'],
        steps: [
          {
            id: 'step1',
            instruction: 'Vyber si dva různé předměty k experimentu',
            action: 'select_tool',
          },
          {
            id: 'step2',
            instruction: 'Změř výšku, ze které budeš předměty pouštět',
            action: 'set_parameter',
            expectedValue: 2.0,
            tolerance: 0.5
          },
          {
            id: 'step3',
            instruction: 'Pusť oba předměty současně a změř čas pádu',
            action: 'observe'
          },
          {
            id: 'step4',
            instruction: 'Zaznamenej své pozorování',
            action: 'record'
          },
          {
            id: 'step5',
            instruction: 'Analyzuj výsledky a udělej závěr',
            action: 'analyze'
          }
        ],
        expectedResult: 'Oba předměty dopadnou přibližně současně',
        isCompleted: false
      }
    ];
  };

  const loadFallbackExperiments = () => {
    const fallbackExperiments: Experiment[] = [
      {
        id: 'gravity_experiment',
        name: 'Gravitační experiment',
        description: 'Zkoumej gravitační sílu pomocí různých předmětů',
        requiredTools: ['ruler', 'stopwatch'],
        steps: [
          {
            id: 'step1',
            instruction: 'Vyber si pravítko pro měření výšky',
            action: 'select_tool'
          },
          {
            id: 'step2',
            instruction: 'Změř výšku 2 metry',
            action: 'set_parameter',
            expectedValue: 2.0,
            tolerance: 0.3
          },
          {
            id: 'step3',
            instruction: 'Pozoruj pád předmětů',
            action: 'observe'
          }
        ],
        expectedResult: 'Všechny předměty padají se stejným zrychlením',
        isCompleted: false
      }
    ];
    
    setExperiments(fallbackExperiments);
  };

  const handleToolSelect = (tool: Tool) => {
    if (!tool.isUnlocked) {
      onInteraction({
        type: 'tool_locked_attempt',
        toolId: tool.id,
        message: `${tool.name} není ještě odemčen`
      });
      return;
    }

    setSelectedTool(tool);
    
    // Update tool usage
    setAvailableTools(prev => prev.map(t => 
      t.id === tool.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));

    onInteraction({
      type: 'tool_selected',
      toolId: tool.id,
      toolName: tool.name,
      usageCount: tool.usageCount + 1
    });

    // Award points for using new tools
    if (tool.usageCount === 0) {
      setExplorationPoints(prev => prev + 10);
      onInteraction({
        type: 'first_tool_use',
        toolId: tool.id,
        points: 10
      });
    }
  };

  const handleStartExperiment = (experiment: Experiment) => {
    // Check if required tools are available
    const missingTools = experiment.requiredTools.filter(toolId => 
      !availableTools.find(tool => tool.id === toolId && tool.isUnlocked)
    );

    if (missingTools.length > 0) {
      onInteraction({
        type: 'experiment_blocked',
        experimentId: experiment.id,
        missingTools,
        message: 'Pro tento experiment potřebuješ další nástroje'
      });
      return;
    }

    setCurrentExperiment(experiment);
    setCurrentStep(0);
    setIsExperimenting(true);

    onInteraction({
      type: 'experiment_started',
      experimentId: experiment.id,
      experimentName: experiment.name
    });
  };

  const handleStepAction = (action: string, value?: any) => {
    if (!currentExperiment) return;

    const step = currentExperiment.steps[currentStep];
    
    const observation: Observation = {
      experimentId: currentExperiment.id,
      stepId: step.id,
      value,
      timestamp: new Date(),
      tool: selectedTool?.id || 'none'
    };

    setObservations(prev => [...prev, observation]);

    onInteraction({
      type: 'experiment_step',
      experimentId: currentExperiment.id,
      stepId: step.id,
      action: step.action,
      value,
      tool: selectedTool?.id
    });

    // Check if step is completed correctly
    let stepCorrect = true;
    let stepPoints = 15;

    if (step.expectedValue !== undefined && step.tolerance !== undefined) {
      const numericValue = parseFloat(value);
      const expectedValue = parseFloat(step.expectedValue);
      stepCorrect = Math.abs(numericValue - expectedValue) <= step.tolerance;
      stepPoints = stepCorrect ? 20 : 10;
    }

    setExplorationPoints(prev => prev + stepPoints);

    // Move to next step or complete experiment
    if (currentStep < currentExperiment.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      onProgressUpdate(((currentStep + 1) / currentExperiment.steps.length) * 100);
    } else {
      completeExperiment();
    }
  };

  const completeExperiment = () => {
    if (!currentExperiment) return;

    const completedExperiment = { ...currentExperiment, isCompleted: true };
    setExperiments(prev => prev.map(exp => 
      exp.id === currentExperiment.id ? completedExperiment : exp
    ));

    // Discover new concepts
    const newConcepts = extractConcepts(observations);
    setDiscoveredConcepts(prev => Array.from(new Set([...prev, ...newConcepts])));

    // Award completion bonus
    const completionBonus = 50;
    setExplorationPoints(prev => prev + completionBonus);

    onInteraction({
      type: 'experiment_completed',
      experimentId: currentExperiment.id,
      totalSteps: currentExperiment.steps.length,
      observations: observations.filter(obs => obs.experimentId === currentExperiment.id),
      discoveredConcepts: newConcepts,
      points: completionBonus
    });

    setIsExperimenting(false);
    setCurrentExperiment(null);
    setCurrentStep(0);

    // Check if all experiments are completed
    const allCompleted = experiments.every(exp => 
      exp.id === currentExperiment.id || exp.isCompleted
    );

    if (allCompleted) {
      completeExploration();
    }
  };

  const extractConcepts = (observations: Observation[]): string[] => {
    const concepts: string[] = [];
    
    // Simple concept extraction based on observations
    const hasGravityMeasurement = observations.some(obs => 
      obs.tool === 'stopwatch' || obs.tool === 'ruler'
    );
    
    if (hasGravityMeasurement) {
      concepts.push('Gravitační zrychlení');
    }

    const hasTemperatureMeasurement = observations.some(obs => 
      obs.tool === 'thermometer'
    );
    
    if (hasTemperatureMeasurement) {
      concepts.push('Tepelná energie');
    }

    return concepts;
  };

  const completeExploration = () => {
    const totalPossiblePoints = experiments.length * 100; // Estimate
    const score = explorationPoints / totalPossiblePoints;

    const result = {
      type: 'exploration_complete',
      score: Math.min(score, 1.0),
      points: explorationPoints,
      experimentsCompleted: experiments.filter(exp => exp.isCompleted).length,
      totalExperiments: experiments.length,
      toolsUsed: availableTools.filter(tool => tool.usageCount > 0).length,
      discoveredConcepts,
      observations,
      feedback: generateExplorationFeedback()
    };

    onComplete(result);
  };

  const generateExplorationFeedback = (): string => {
    const completedCount = experiments.filter(exp => exp.isCompleted).length;
    const toolsUsedCount = availableTools.filter(tool => tool.usageCount > 0).length;

    if (completedCount === experiments.length && toolsUsedCount >= 4) {
      return '🔬 Fantastické! Jsi skutečný vědec! Dokončil jsi všechny experimenty a použil různé nástroje.';
    } else if (completedCount >= experiments.length * 0.7) {
      return '👍 Skvělá práce! Tvé experimentování ukazuje dobré chápání fyzikálních principů.';
    } else {
      return '🤔 Pokračuj v experimentování! Každý pokus tě přiblíží k lepšímu porozumění fyzice.';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Exploration Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            🔬 Virtuální laboratoř
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600">
              🧪 Experimenty: {experiments.filter(exp => exp.isCompleted).length}/{experiments.length}
            </span>
            <span className="text-sm text-green-600">
              ⭐ Body: {explorationPoints}
            </span>
            <span className="text-sm text-purple-600">
              💡 Objevy: {discoveredConcepts.length}
            </span>
          </div>
        </div>

        {/* Available Tools */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Dostupné nástroje</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {availableTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                disabled={!tool.isUnlocked}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  tool.isUnlocked
                    ? selectedTool?.id === tool.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
                title={tool.description}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <div className="text-xs font-medium text-gray-900">{tool.name}</div>
                  {tool.usageCount > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      Použito: {tool.usageCount}x
                    </div>
                  )}
                  {!tool.isUnlocked && (
                    <div className="text-xs text-red-600 mt-1">🔒</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tool Info */}
        {selectedTool && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedTool.icon}</span>
              <div>
                <h4 className="font-medium text-blue-900">{selectedTool.name}</h4>
                <p className="text-sm text-blue-700">{selectedTool.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Experiments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Experiments */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Experimenty k provedení
          </h3>
          <div className="space-y-4">
            {experiments.map(experiment => (
              <div
                key={experiment.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  experiment.isCompleted
                    ? 'border-green-200 bg-green-50'
                    : currentExperiment?.id === experiment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{experiment.name}</span>
                      {experiment.isCompleted && <span className="text-green-500">✅</span>}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{experiment.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Nástroje:</span>
                    {experiment.requiredTools.map(toolId => {
                      const tool = availableTools.find(t => t.id === toolId);
                      return (
                        <span key={toolId} className={`px-2 py-1 rounded ${
                          tool?.isUnlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tool?.icon} {tool?.name}
                        </span>
                      );
                    })}
                  </div>

                  {!experiment.isCompleted && currentExperiment?.id !== experiment.id && (
                    <button
                      onClick={() => handleStartExperiment(experiment)}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                    >
                      Začít
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Experiment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentExperiment ? (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Aktuální experiment: {currentExperiment.name}
              </h3>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Krok {currentStep + 1} z {currentExperiment.steps.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(((currentStep + 1) / currentExperiment.steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / currentExperiment.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Step */}
              {currentExperiment.steps[currentStep] && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-900 mb-3">
                    {currentExperiment.steps[currentStep].instruction}
                  </p>
                  
                  {/* Step Actions */}
                  {currentExperiment.steps[currentStep].action === 'set_parameter' && (
                    <div className="space-y-3">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Zadej hodnotu..."
                        className="w-full p-2 border border-gray-300 rounded"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            handleStepAction('set_parameter', target.value);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleStepAction('set_parameter', input.value);
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Potvrdit
                      </button>
                    </div>
                  )}

                  {currentExperiment.steps[currentStep].action === 'observe' && (
                    <button
                      onClick={() => handleStepAction('observe', 'observed')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Pozorovat 👀
                    </button>
                  )}

                  {currentExperiment.steps[currentStep].action === 'record' && (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Zapiš svoje pozorování..."
                        className="w-full p-2 border border-gray-300 rounded"
                        rows={3}
                      />
                      <button
                        onClick={(e) => {
                          const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                          handleStepAction('record', textarea.value);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Zaznamenat 📝
                      </button>
                    </div>
                  )}

                  {currentExperiment.steps[currentStep].action === 'analyze' && (
                    <button
                      onClick={() => handleStepAction('analyze', 'analyzed')}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Analyzovat 🧠
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vyber experiment k provedení
              </h3>
              <p className="text-gray-600">
                Klikni na "Začít" u některého z experimentů vlevo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Discovered Concepts */}
      {discoveredConcepts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🧠 Objevené koncepty
          </h3>
          <div className="flex flex-wrap gap-2">
            {discoveredConcepts.map((concept, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                💡 {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};