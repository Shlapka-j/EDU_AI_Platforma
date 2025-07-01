export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  PSYCHOLOGIST = 'psychologist',
  ADMIN = 'admin'
}

export interface Subject {
  id: string;
  name: string;
  grade: number;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningBlock {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  estimatedDuration: number;
  difficulty: DifficultyLevel;
  learningObjectives: string[];
  materials: Material[];
  activities: Activity[];
  order: number;
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  url: string;
  metadata: Record<string, any>;
}

export enum MaterialType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  INTERACTIVE = 'interactive'
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  content: Record<string, any>;
  points: number;
  timeLimit?: number;
  difficulty?: DifficultyLevel;
  learningObjectives?: string[];
}

export enum ActivityType {
  QUIZ = 'quiz',
  DISCUSSION = 'discussion',
  STORY = 'story',
  EXPLORATION = 'exploration',
  MINI_GAME = 'mini_game',
  NARRATIVE_ADVENTURE = 'narrative_adventure'
}

export interface GameState {
  studentId: string;
  currentBlockId: string;
  currentActivityId: string;
  progress: Record<string, any>;
  inventory: GameInventory;
  stats: GameStats;
  preferences: LearningPreferences;
}

export interface GameInventory {
  tools: string[];
  achievements: Achievement[];
  physicsFragments: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: Date;
  category: AchievementCategory;
}

export enum AchievementCategory {
  LEARNING = 'learning',
  EXPLORATION = 'exploration',
  PERSISTENCE = 'persistence',
  COLLABORATION = 'collaboration'
}

export interface GameStats {
  totalXP: number;
  level: number;
  streak: number;
  completedActivities: number;
  totalTimeSpent: number;
  physicsUnderstandingLevel: number;
}

export interface LearningPreferences {
  visualLearning: number;
  auditoryLearning: number;
  kinestheticLearning: number;
  readingWritingLearning: number;
  preferredDifficulty: DifficultyLevel;
  sessionLength: number;
}

export interface TestResult {
  id: string;
  studentId: string;
  blockId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  answers: TestAnswer[];
  feedback: string;
  completedAt: Date;
}

export interface TestAnswer {
  questionId: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  timeSpent: number;
}

export interface AIAnalysis {
  learningStyleAnalysis: LearningStyleAnalysis;
  performancePrediction: PerformancePrediction;
  recommendedActivities: Activity[];
  personalizedFeedback: string;
  riskFlags: RiskFlag[];
}

export interface LearningStyleAnalysis {
  dominantStyle: string;
  styleDistribution: Record<string, number>;
  confidence: number;
  lastUpdated: Date;
}

export interface PerformancePrediction {
  expectedScore: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface RiskFlag {
  type: RiskType;
  severity: RiskSeverity;
  description: string;
  recommendations: string[];
  detectedAt: Date;
}

export enum RiskType {
  LEARNING_DIFFICULTY = 'learning_difficulty',
  ENGAGEMENT_DROP = 'engagement_drop',
  BEHAVIORAL_CONCERN = 'behavioral_concern'
}

export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Narrative Adventure Engine Types
export interface NarrativeActivity extends Activity {
  type: ActivityType.NARRATIVE_ADVENTURE;
  startingSceneId: string;
  availableScenes: Scene[];
  requiredItems?: string[];
  maxChoices?: number;
  educationalObjectives: string[];
}

export interface Scene {
  id: string;
  title: string;
  location: string;
  description: string;
  text: string;
  choices: Choice[];
  conditions?: SceneCondition[];
  rewards?: SceneReward[];
  imageUrl?: string;
  audioUrl?: string;
  isEnding?: boolean;
  educationalContent?: EducationalContent;
}

export interface Choice {
  id: string;
  text: string;
  description?: string;
  nextSceneId: string;
  conditions?: ChoiceCondition[];
  actions?: GameAction[];
  points?: number;
  consequence?: string;
  educationalFeedback?: string;
  difficulty?: DifficultyLevel;
}

export interface SceneCondition {
  type: 'item' | 'flag' | 'relationship' | 'visited' | 'score';
  key: string;
  value: any;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
}

export interface ChoiceCondition extends SceneCondition {}

export interface GameAction {
  type: 'add_item' | 'remove_item' | 'set_flag' | 'modify_relationship' | 'add_points' | 'unlock_scene';
  target: string;
  value: any;
  message?: string;
}

export interface SceneReward {
  type: 'xp' | 'item' | 'badge' | 'achievement';
  value: number | string;
  message?: string;
}

export interface EducationalContent {
  concept: string;
  explanation: string;
  examples?: string[];
  relatedConcepts?: string[];
  difficulty: DifficultyLevel;
  subject: string;
}

export interface NarrativeGameState {
  currentSceneId: string;
  inventory: Map<string, boolean>;
  storyFlags: Map<string, any>;
  characterRelationships: Map<string, number>;
  visitedScenes: Set<string>;
  totalChoices: number;
  totalPoints: number;
  startTime: Date;
  lastSaveTime: Date;
  completedObjectives: string[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  relationship: number;
  dialogues: Map<string, Dialogue>;
  imageUrl?: string;
  personality: string[];
}

export interface Dialogue {
  id: string;
  text: string;
  responses: DialogueResponse[];
  conditions?: SceneCondition[];
  educationalValue?: string;
}

export interface DialogueResponse {
  id: string;
  text: string;
  nextDialogueId?: string;
  relationshipChange?: number;
  actions?: GameAction[];
  educationalFeedback?: string;
}

export interface NarrativeTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: number;
  estimatedDuration: number;
  scenes: Scene[];
  characters: Character[];
  educationalGoals: string[];
  requiredKnowledge?: string[];
}

export interface StoryProgress {
  sceneId: string;
  choiceId: string;
  timestamp: Date;
  timeSpent: number;
  educationalValue: number;
}

export interface NarrativeResult {
  type: 'narrative_complete' | 'narrative_progress';
  finalScore: number;
  totalPoints: number;
  choicesMade: StoryProgress[];
  objectivesCompleted: string[];
  educationalAchievements: string[];
  timeSpent: number;
  feedback: string;
  nextRecommendations?: string[];
}