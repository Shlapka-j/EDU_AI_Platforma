import { 
  NarrativeActivity, 
  Scene, 
  Choice, 
  NarrativeGameState, 
  StoryProgress, 
  NarrativeResult,
  SceneCondition,
  GameAction,
  EducationalContent,
  Character,
  DifficultyLevel
} from '../../types';

export class NarrativeEngine {
  private gameState: NarrativeGameState;
  private activity: NarrativeActivity;
  private scenes: Map<string, Scene>;
  private characters: Map<string, Character>;
  private progressHistory: StoryProgress[];

  constructor(activity: NarrativeActivity, initialState?: Partial<NarrativeGameState>) {
    this.activity = activity;
    this.scenes = new Map(activity.availableScenes.map(scene => [scene.id, scene]));
    this.characters = new Map();
    this.progressHistory = [];
    
    this.gameState = {
      currentSceneId: activity.startingSceneId,
      inventory: new Map(),
      storyFlags: new Map(),
      characterRelationships: new Map(),
      visitedScenes: new Set(),
      totalChoices: 0,
      totalPoints: 0,
      startTime: new Date(),
      lastSaveTime: new Date(),
      completedObjectives: [],
      ...initialState
    };
  }

  getCurrentScene(): Scene | null {
    const scene = this.scenes.get(this.gameState.currentSceneId);
    if (scene) {
      this.gameState.visitedScenes.add(scene.id);
    }
    return scene || null;
  }

  getAvailableChoices(): Choice[] {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return [];

    return currentScene.choices.filter(choice => 
      this.evaluateConditions(choice.conditions || [])
    );
  }

  async processChoice(choiceId: string): Promise<{
    success: boolean;
    nextScene: Scene | null;
    result?: NarrativeResult;
    actions: GameAction[];
    educationalFeedback?: string;
  }> {
    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      return { success: false, nextScene: null, actions: [] };
    }

    const choice = currentScene.choices.find(c => c.id === choiceId);
    if (!choice) {
      return { success: false, nextScene: null, actions: [] };
    }

    const startTime = Date.now();
    
    // Record progress
    const progress: StoryProgress = {
      sceneId: currentScene.id,
      choiceId: choice.id,
      timestamp: new Date(),
      timeSpent: 0,
      educationalValue: this.calculateEducationalValue(choice, currentScene)
    };

    // Execute choice actions
    const actions = choice.actions || [];
    this.executeActions(actions);

    // Add choice points
    if (choice.points) {
      this.gameState.totalPoints += choice.points;
    }

    // Update game state
    this.gameState.totalChoices++;
    this.gameState.currentSceneId = choice.nextSceneId;
    this.gameState.lastSaveTime = new Date();

    // Calculate time spent on choice
    progress.timeSpent = Date.now() - startTime;
    this.progressHistory.push(progress);

    const nextScene = this.scenes.get(choice.nextSceneId);
    
    // Check if story is complete
    if (nextScene?.isEnding || this.isStoryComplete()) {
      const result = this.generateResult();
      return {
        success: true,
        nextScene: nextScene || null,
        result,
        actions,
        educationalFeedback: choice.educationalFeedback
      };
    }

    return {
      success: true,
      nextScene: nextScene || null,
      actions,
      educationalFeedback: choice.educationalFeedback
    };
  }

  private evaluateConditions(conditions: SceneCondition[]): boolean {
    return conditions.every(condition => {
      const value = this.getStateValue(condition.type, condition.key);
      return this.compareValues(value, condition.value, condition.operator);
    });
  }

  private getStateValue(type: string, key: string): any {
    switch (type) {
      case 'item':
        return this.gameState.inventory.get(key) || false;
      case 'flag':
        return this.gameState.storyFlags.get(key);
      case 'relationship':
        return this.gameState.characterRelationships.get(key) || 0;
      case 'visited':
        return this.gameState.visitedScenes.has(key);
      case 'score':
        return this.gameState.totalPoints;
      default:
        return null;
    }
  }

  private compareValues(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      case '>': return actual > expected;
      case '<': return actual < expected;
      case '>=': return actual >= expected;
      case '<=': return actual <= expected;
      default: return false;
    }
  }

  private executeActions(actions: GameAction[]): void {
    actions.forEach(action => {
      switch (action.type) {
        case 'add_item':
          this.gameState.inventory.set(action.target, true);
          break;
        case 'remove_item':
          this.gameState.inventory.delete(action.target);
          break;
        case 'set_flag':
          this.gameState.storyFlags.set(action.target, action.value);
          break;
        case 'modify_relationship':
          const currentRel = this.gameState.characterRelationships.get(action.target) || 0;
          this.gameState.characterRelationships.set(action.target, currentRel + action.value);
          break;
        case 'add_points':
          this.gameState.totalPoints += action.value;
          break;
        case 'unlock_scene':
          // Scene unlocking logic can be added here
          break;
      }
    });
  }

  private calculateEducationalValue(choice: Choice, scene: Scene): number {
    let value = 0;
    
    // Base educational value from choice difficulty
    switch (choice.difficulty) {
      case DifficultyLevel.EASY: value += 1; break;
      case DifficultyLevel.MEDIUM: value += 2; break;
      case DifficultyLevel.HARD: value += 3; break;
      default: value += 1;
    }

    // Additional value for educational feedback
    if (choice.educationalFeedback) value += 2;
    
    // Value from scene educational content
    if (scene.educationalContent) value += 3;

    return value;
  }

  private isStoryComplete(): boolean {
    // Check if all educational objectives are completed
    const completedObjectives = this.gameState.completedObjectives.length;
    const totalObjectives = this.activity.educationalObjectives.length;
    
    // Story is complete if all objectives are met or max choices reached
    return completedObjectives >= totalObjectives || 
           (!!this.activity.maxChoices && this.gameState.totalChoices >= this.activity.maxChoices);
  }

  private generateResult(): NarrativeResult {
    const totalTime = Date.now() - this.gameState.startTime.getTime();
    const averageEducationalValue = this.progressHistory.reduce((sum, p) => sum + p.educationalValue, 0) / this.progressHistory.length;
    
    // Calculate final score based on multiple factors
    const baseScore = this.gameState.totalPoints;
    const timeBonus = Math.max(0, 100 - (totalTime / 60000)); // Bonus for completing quickly
    const educationalBonus = averageEducationalValue * 10;
    const objectiveBonus = (this.gameState.completedObjectives.length / this.activity.educationalObjectives.length) * 50;
    
    const finalScore = Math.round(baseScore + timeBonus + educationalBonus + objectiveBonus);

    return {
      type: 'narrative_complete',
      finalScore,
      totalPoints: this.gameState.totalPoints,
      choicesMade: this.progressHistory,
      objectivesCompleted: this.gameState.completedObjectives,
      educationalAchievements: this.generateAchievements(),
      timeSpent: totalTime,
      feedback: this.generateFeedback(finalScore),
      nextRecommendations: this.generateRecommendations()
    };
  }

  private generateAchievements(): string[] {
    const achievements: string[] = [];
    
    if (this.gameState.totalPoints > 100) achievements.push('high_scorer');
    if (this.progressHistory.length > 10) achievements.push('thorough_explorer');
    if (this.gameState.visitedScenes.size === this.scenes.size) achievements.push('scene_master');
    if (this.gameState.totalChoices < 8) achievements.push('efficient_learner');
    
    return achievements;
  }

  private generateFeedback(finalScore: number): string {
    if (finalScore >= 200) {
      return 'Výjimečná práce! Prokázal jsi hluboké porozumění problematice a schopnost aplikovat znalosti v praxi.';
    } else if (finalScore >= 150) {
      return 'Velmi dobrá práce! Tvá rozhodnutí ukazují solidní pochopení naučených konceptů.';
    } else if (finalScore >= 100) {
      return 'Dobrá práce! Některá tvá rozhodnutí byla velmi promyšlená. Zkus více experimentovat s různými možnostmi.';
    } else {
      return 'Pokračuj v učení! Každé rozhodnutí je příležitostí se něco nového naučit. Zkus příběh projít znovu s jinými volbami.';
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze player's choices and suggest improvements
    const averageTime = this.progressHistory.reduce((sum, p) => sum + p.timeSpent, 0) / this.progressHistory.length;
    
    if (averageTime < 5000) {
      recommendations.push('Zkus si více času na rozmyšlení jednotlivých rozhodnutí.');
    }
    
    if (this.gameState.completedObjectives.length < this.activity.educationalObjectives.length) {
      recommendations.push('Zaměř se na splnění všech vzdělávacích cílů.');
    }
    
    if (this.gameState.visitedScenes.size < this.scenes.size * 0.7) {
      recommendations.push('Prozkumej více různých cest a možností v příběhu.');
    }
    
    return recommendations;
  }

  // Public methods for external access
  getGameState(): NarrativeGameState {
    return { ...this.gameState };
  }

  getProgressHistory(): StoryProgress[] {
    return [...this.progressHistory];
  }

  hasItem(itemId: string): boolean {
    return this.gameState.inventory.get(itemId) || false;
  }

  getFlag(flagId: string): any {
    return this.gameState.storyFlags.get(flagId);
  }

  getRelationship(characterId: string): number {
    return this.gameState.characterRelationships.get(characterId) || 0;
  }

  // Save/Load functionality
  saveState(): string {
    return JSON.stringify({
      gameState: {
        ...this.gameState,
        inventory: Array.from(this.gameState.inventory.entries()),
        storyFlags: Array.from(this.gameState.storyFlags.entries()),
        characterRelationships: Array.from(this.gameState.characterRelationships.entries()),
        visitedScenes: Array.from(this.gameState.visitedScenes)
      },
      progressHistory: this.progressHistory
    });
  }

  loadState(saveData: string): void {
    const data = JSON.parse(saveData);
    
    this.gameState = {
      ...data.gameState,
      inventory: new Map(data.gameState.inventory),
      storyFlags: new Map(data.gameState.storyFlags),
      characterRelationships: new Map(data.gameState.characterRelationships),
      visitedScenes: new Set(data.gameState.visitedScenes),
      startTime: new Date(data.gameState.startTime),
      lastSaveTime: new Date(data.gameState.lastSaveTime)
    };
    
    this.progressHistory = data.progressHistory.map((p: any) => ({
      ...p,
      timestamp: new Date(p.timestamp)
    }));
  }
}