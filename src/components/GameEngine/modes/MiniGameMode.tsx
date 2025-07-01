import React, { useState, useEffect } from 'react';
import { Activity, GameState, LearningPreferences } from '../../../types';

interface MiniGameModeProps {
  activity: Activity;
  gameState: GameState;
  preferences: LearningPreferences;
  adaptiveSettings: any;
  onComplete: (result: any) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: (interaction: any) => void;
}

interface GameConfig {
  type: 'physics_simulator' | 'matching_game' | 'drag_drop' | 'timing_challenge' | 'puzzle';
  title: string;
  description: string;
  instructions: string[];
  timeLimit?: number;
  maxAttempts?: number;
  targetScore: number;
}

interface GameObject {
  id: string;
  type: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  mass?: number;
  radius?: number;
  color?: string;
  label?: string;
  isDroppable?: boolean;
  isCorrect?: boolean;
}

interface GameState_Mini {
  score: number;
  lives: number;
  level: number;
  objects: GameObject[];
  timeLeft: number;
  attempts: number;
  isPlaying: boolean;
  isCompleted: boolean;
}

export const MiniGameMode: React.FC<MiniGameModeProps> = ({
  activity,
  gameState,
  preferences,
  adaptiveSettings,
  onComplete,
  onProgressUpdate,
  onInteraction
}) => {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [miniGameState, setMiniGameState] = useState<GameState_Mini>({
    score: 0,
    lives: 3,
    level: 1,
    objects: [],
    timeLeft: 60,
    attempts: 0,
    isPlaying: false,
    isCompleted: false
  });
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  // Initialize mini-game
  useEffect(() => {
    initializeMiniGame();
  }, [activity]);

  // Game timer
  useEffect(() => {
    if (miniGameState.isPlaying && miniGameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setMiniGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (miniGameState.timeLeft === 0 && miniGameState.isPlaying) {
      handleTimeUp();
    }
  }, [miniGameState.isPlaying, miniGameState.timeLeft]);

  const initializeMiniGame = () => {
    // Determine game type based on activity and preferences
    const gameType = determineGameType();
    const config = createGameConfig(gameType);
    setGameConfig(config);
    
    // Initialize game objects based on type
    const objects = createInitialObjects(gameType);
    setMiniGameState(prev => ({
      ...prev,
      objects,
      timeLeft: config.timeLimit || 60
    }));
  };

  const determineGameType = (): GameConfig['type'] => {
    // Visual learners prefer drag & drop or matching
    if (preferences.visualLearning > 0.6) {
      return Math.random() > 0.5 ? 'drag_drop' : 'matching_game';
    }
    
    // Kinesthetic learners prefer simulators
    if (preferences.kinestheticLearning > 0.6) {
      return 'physics_simulator';
    }
    
    // Default to puzzle for reading/writing learners
    return 'puzzle';
  };

  const createGameConfig = (type: GameConfig['type']): GameConfig => {
    const configs: Record<GameConfig['type'], GameConfig> = {
      physics_simulator: {
        type: 'physics_simulator',
        title: 'Gravitační simulátor',
        description: 'Prozkoumej gravitační síly pomocí interaktivní simulace',
        instructions: [
          'Klikni a táhni objekty pro změnu jejich pozice',
          'Pozoruj, jak se objekty pohybují pod vlivem gravitace',
          'Zkus předpovědět trajektorii před spuštěním'
        ],
        timeLimit: 120,
        maxAttempts: 5,
        targetScore: 80
      },
      matching_game: {
        type: 'matching_game',
        title: 'Párovací hra - Fyzikální pojmy',
        description: 'Spáruj fyzikální pojmy s jejich definicemi',
        instructions: [
          'Klikni na pojem a pak na správnou definici',
          'Správné páry zmizí z hrací plochy',
          'Spáruj všechny pojmy co nejrychleji'
        ],
        timeLimit: 90,
        maxAttempts: 10,
        targetScore: 70
      },
      drag_drop: {
        type: 'drag_drop',
        title: 'Přetahování - Síly v akci',
        description: 'Přetahuj objekty na správná místa podle působících sil',
        instructions: [
          'Přetáhni objekty na správná místa',
          'Zvaž působící síly a jejich směr',
          'Umísti všechny objekty správně'
        ],
        timeLimit: 100,
        maxAttempts: 8,
        targetScore: 75
      },
      timing_challenge: {
        type: 'timing_challenge',
        title: 'Časová výzva - Měření času',
        description: 'Změř přesný čas pádu objektů',
        instructions: [
          'Klikni START když objekt začne padat',
          'Klikni STOP když objekt dopadne',
          'Buď co nejpřesnější v měření'
        ],
        timeLimit: 60,
        maxAttempts: 6,
        targetScore: 85
      },
      puzzle: {
        type: 'puzzle',
        title: 'Fyzikální puzzle',
        description: 'Vyřeš puzzle s fyzikálními principy',
        instructions: [
          'Přesuň dílky na správná místa',
          'Vytvoř logickou sekvenci jevů',
          'Dokončí celý obrázek'
        ],
        timeLimit: 150,
        maxAttempts: 12,
        targetScore: 65
      }
    };

    return configs[type];
  };

  const createInitialObjects = (type: GameConfig['type']): GameObject[] => {
    switch (type) {
      case 'physics_simulator':
        return [
          {
            id: 'ball1',
            type: 'ball',
            x: 100,
            y: 50,
            vx: 0,
            vy: 0,
            mass: 1,
            radius: 20,
            color: '#ff6b6b',
            label: 'Míček'
          },
          {
            id: 'ball2',
            type: 'ball',
            x: 200,
            y: 50,
            vx: 0,
            vy: 0,
            mass: 2,
            radius: 30,
            color: '#4ecdc4',
            label: 'Těžký míček'
          },
          {
            id: 'ground',
            type: 'ground',
            x: 0,
            y: 350,
            color: '#8b4513',
            label: 'Země'
          }
        ];

      case 'matching_game':
        return [
          { id: 'term1', type: 'term', x: 50, y: 100, label: 'Gravitace', isDroppable: false },
          { id: 'def1', type: 'definition', x: 300, y: 150, label: 'Síla přitahování mezi tělesy', isDroppable: true },
          { id: 'term2', type: 'term', x: 50, y: 150, label: 'Hmotnost', isDroppable: false },
          { id: 'def2', type: 'definition', x: 300, y: 200, label: 'Množství látky v tělese', isDroppable: true },
          { id: 'term3', type: 'term', x: 50, y: 200, label: 'Zrychlení', isDroppable: false },
          { id: 'def3', type: 'definition', x: 300, y: 100, label: 'Změna rychlosti za čas', isDroppable: true }
        ];

      case 'drag_drop':
        return [
          { id: 'object1', type: 'moveable', x: 100, y: 100, label: 'Lehký předmět', isDroppable: false },
          { id: 'object2', type: 'moveable', x: 150, y: 100, label: 'Těžký předmět', isDroppable: false },
          { id: 'zone1', type: 'dropzone', x: 300, y: 200, label: 'Rychlejší pád', isDroppable: true, isCorrect: false },
          { id: 'zone2', type: 'dropzone', x: 400, y: 200, label: 'Stejný čas pádu', isDroppable: true, isCorrect: true }
        ];

      default:
        return [];
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setMiniGameState(prev => ({
      ...prev,
      isPlaying: true
    }));

    onInteraction({
      type: 'minigame_started',
      gameType: gameConfig?.type,
      difficulty: adaptiveSettings.difficulty
    });
  };

  const handleObjectClick = (object: GameObject) => {
    if (!miniGameState.isPlaying) return;

    setSelectedObject(object);
    
    onInteraction({
      type: 'object_selected',
      objectId: object.id,
      objectType: object.type
    });

    // Handle different game mechanics
    if (gameConfig?.type === 'matching_game') {
      handleMatching(object);
    } else if (gameConfig?.type === 'physics_simulator') {
      handlePhysicsInteraction(object);
    }
  };

  const handleMatching = (object: GameObject) => {
    if (!selectedObject) {
      setSelectedObject(object);
      return;
    }

    // Check if it's a valid match
    const isMatch = checkMatch(selectedObject, object);
    
    if (isMatch) {
      // Remove matched objects
      setMiniGameState(prev => ({
        ...prev,
        objects: prev.objects.filter(obj => 
          obj.id !== selectedObject.id && obj.id !== object.id
        ),
        score: prev.score + 20
      }));
      
      setFeedback('Správně! 🎉');
      
      onInteraction({
        type: 'correct_match',
        object1: selectedObject.id,
        object2: object.id,
        points: 20
      });
      
      // Check if game is completed
      const remainingTerms = miniGameState.objects.filter(obj => obj.type === 'term').length - 1;
      if (remainingTerms === 1) { // This match will remove the last term
        completeGame();
      }
    } else {
      setMiniGameState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        attempts: prev.attempts + 1
      }));
      
      setFeedback('Zkus to znovu! 🤔');
      
      onInteraction({
        type: 'incorrect_match',
        object1: selectedObject.id,
        object2: object.id
      });
    }

    setSelectedObject(null);
    setTimeout(() => setFeedback(''), 2000);
  };

  const checkMatch = (obj1: GameObject, obj2: GameObject): boolean => {
    const matches: Record<string, string> = {
      'term1': 'def1', // Gravitace - Síla přitahování
      'term2': 'def2', // Hmotnost - Množství látky
      'term3': 'def3'  // Zrychlení - Změna rychlosti
    };

    return (matches[obj1.id] === obj2.id) || (matches[obj2.id] === obj1.id);
  };

  const handlePhysicsInteraction = (object: GameObject) => {
    if (object.type === 'ball') {
      // Start physics simulation
      simulatePhysics(object);
    }
  };

  const simulatePhysics = (ball: GameObject) => {
    const gravity = 9.8; // m/s²
    const timeStep = 0.1;
    let currentY = ball.y;
    let velocity = 0;

    const animate = () => {
      velocity += gravity * timeStep;
      currentY += velocity * timeStep;

      // Update object position
      setMiniGameState(prev => ({
        ...prev,
        objects: prev.objects.map(obj =>
          obj.id === ball.id ? { ...obj, y: currentY, vy: velocity } : obj
        ),
        score: prev.score + 5
      }));

      // Check if ball hit ground
      if (currentY >= 350 - (ball.radius || 20)) {
        setFeedback('Míček dopadl! Pozoruj gravitační zrychlení. 🌍');
        setTimeout(() => setFeedback(''), 3000);
        return;
      }

      // Continue animation
      requestAnimationFrame(animate);
    };

    animate();
  };

  const handleDrop = (droppedObject: GameObject, targetObject: GameObject) => {
    if (gameConfig?.type !== 'drag_drop') return;

    const isCorrectDrop = targetObject.isCorrect;
    
    if (isCorrectDrop) {
      setMiniGameState(prev => ({
        ...prev,
        score: prev.score + 25,
        objects: prev.objects.filter(obj => obj.id !== droppedObject.id)
      }));
      
      setFeedback('Perfektní! Oba objekty dopadnou současně! ⚖️');
      
      // Check completion
      const remainingMoveables = miniGameState.objects.filter(obj => obj.type === 'moveable').length - 1;
      if (remainingMoveables === 0) {
        completeGame();
      }
    } else {
      setMiniGameState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        attempts: prev.attempts + 1
      }));
      
      setFeedback('Ne úplně... Zkus přemýšlet o gravitaci! 🤔');
    }

    setTimeout(() => setFeedback(''), 3000);
  };

  const handleTimeUp = () => {
    setMiniGameState(prev => ({ ...prev, isPlaying: false }));
    
    const success = miniGameState.score >= (gameConfig?.targetScore || 50);
    
    if (success) {
      completeGame();
    } else {
      setFeedback('Čas vypršel! Zkus to znovu! ⏰');
    }
  };

  const completeGame = () => {
    setMiniGameState(prev => ({ ...prev, isCompleted: true, isPlaying: false }));
    
    const finalScore = miniGameState.score;
    const targetScore = gameConfig?.targetScore || 100;
    const successRate = Math.min(finalScore / targetScore, 1.0);
    
    const result = {
      type: 'minigame_complete',
      gameType: gameConfig?.type,
      score: successRate,
      points: finalScore,
      attempts: miniGameState.attempts,
      timeUsed: (gameConfig?.timeLimit || 60) - miniGameState.timeLeft,
      livesRemaining: miniGameState.lives,
      feedback: generateGameFeedback(successRate)
    };

    onComplete(result);
    onProgressUpdate(100);
  };

  const generateGameFeedback = (successRate: number): string => {
    if (successRate >= 0.9) {
      return '🏆 Úžasné! Perfektně jsi zvládl mini-hru a pochopil fyzikální principy!';
    } else if (successRate >= 0.7) {
      return '🎯 Skvělá práce! Tvé chápání fyziky se zlepšuje!';
    } else if (successRate >= 0.5) {
      return '👍 Dobrý pokus! S trochou cvičení budeš ještě lepší!';
    } else {
      return '🤔 Zkus to znovu! Každý pokus tě posune blíž k cíli!';
    }
  };

  if (!gameConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🎮 {gameConfig.title}
            </h2>
            <p className="text-gray-600 mt-1">{gameConfig.description}</p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-sm text-blue-600">Skóre: {miniGameState.score}</div>
            <div className="text-sm text-red-600">Životy: {'❤️'.repeat(miniGameState.lives)}</div>
            <div className="text-sm text-gray-600">
              Čas: {Math.floor(miniGameState.timeLeft / 60)}:{(miniGameState.timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!gameStarted && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Instrukce:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              {gameConfig.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Button */}
        {!gameStarted && (
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
            >
              🎮 Začít hru
            </button>
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameStarted && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg overflow-hidden border">
            {/* Game Objects */}
            {miniGameState.objects.map((object) => (
              <div
                key={object.id}
                onClick={() => handleObjectClick(object)}
                className={`absolute cursor-pointer transition-all duration-200 ${
                  selectedObject?.id === object.id ? 'ring-4 ring-yellow-400' : ''
                }`}
                style={{
                  left: object.x,
                  top: object.y,
                  width: object.radius ? object.radius * 2 : 'auto',
                  height: object.radius ? object.radius * 2 : 'auto'
                }}
              >
                {object.type === 'ball' && (
                  <div
                    className="rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{
                      backgroundColor: object.color,
                      width: (object.radius || 20) * 2,
                      height: (object.radius || 20) * 2
                    }}
                  >
                    {object.mass}kg
                  </div>
                )}

                {object.type === 'ground' && (
                  <div
                    className="bg-amber-800"
                    style={{
                      width: '100%',
                      height: 50,
                      backgroundColor: object.color
                    }}
                  />
                )}

                {(object.type === 'term' || object.type === 'definition') && (
                  <div className={`p-3 rounded-lg border-2 ${
                    object.type === 'term' 
                      ? 'bg-blue-100 border-blue-300 text-blue-900' 
                      : 'bg-green-100 border-green-300 text-green-900'
                  }`}>
                    <div className="text-sm font-medium">{object.label}</div>
                  </div>
                )}

                {(object.type === 'moveable' || object.type === 'dropzone') && (
                  <div className={`p-4 rounded-lg border-2 min-w-[120px] text-center ${
                    object.type === 'moveable'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-900 cursor-move'
                      : 'bg-purple-100 border-purple-300 text-purple-900 border-dashed'
                  }`}>
                    <div className="text-sm font-medium">{object.label}</div>
                  </div>
                )}
              </div>
            ))}

            {/* Feedback Overlay */}
            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900">{feedback}</div>
                </div>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Cíl: {gameConfig.targetScore} bodů
            </div>
            
            <div className="flex space-x-2">
              {miniGameState.isPlaying && (
                <button
                  onClick={() => setMiniGameState(prev => ({ ...prev, isPlaying: false }))}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  ⏸️ Pauza
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                🔄 Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {miniGameState.isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">
              {miniGameState.score >= (gameConfig.targetScore || 50) ? '🎉' : '😅'}
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {miniGameState.score >= (gameConfig.targetScore || 50) ? 'Gratulujeme!' : 'Zkus to znovu!'}
            </h3>
            <div className="space-y-2 text-gray-600 mb-6">
              <p>Finální skóre: <strong>{miniGameState.score}</strong></p>
              <p>Cílové skóre: <strong>{gameConfig.targetScore}</strong></p>
              <p>Počet pokusů: <strong>{miniGameState.attempts}</strong></p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Hrát znovu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};