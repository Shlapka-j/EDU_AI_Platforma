import { 
  Scene, 
  Choice, 
  NarrativeActivity,
  EducationalContent,
  DifficultyLevel,
  GameAction,
  SceneCondition,
  NarrativeTemplate
} from '../../types';

export interface SceneBuilderOptions {
  subject: string;
  grade: number;
  difficulty: DifficultyLevel;
  educationalObjectives: string[];
  estimatedDuration: number;
  theme?: string;
  includeMultimedia?: boolean;
}

export class SceneBuilder {
  private sceneCounter: number = 0;
  private choiceCounter: number = 0;

  constructor() {
    this.sceneCounter = 0;
    this.choiceCounter = 0;
  }

  createNarrativeActivity(
    title: string,
    description: string,
    options: SceneBuilderOptions
  ): NarrativeActivity {
    const scenes = this.generateScenes(options);
    
    return {
      id: `narrative_${Date.now()}`,
      type: 'narrative_adventure' as any,
      title,
      description,
      content: {
        theme: options.theme || 'general',
        subject: options.subject,
        grade: options.grade
      },
      points: this.calculateTotalPoints(scenes),
      difficulty: options.difficulty,
      learningObjectives: options.educationalObjectives,
      startingSceneId: scenes[0].id,
      availableScenes: scenes,
      maxChoices: this.calculateMaxChoices(options.estimatedDuration),
      educationalObjectives: options.educationalObjectives
    };
  }

  generateScenes(options: SceneBuilderOptions): Scene[] {
    const scenes: Scene[] = [];
    
    // Generate opening scene
    scenes.push(this.createOpeningScene(options));
    
    // Generate middle scenes based on educational objectives
    for (let i = 0; i < options.educationalObjectives.length; i++) {
      scenes.push(this.createEducationalScene(options.educationalObjectives[i], options, i + 1));
    }
    
    // Generate challenge scenes
    scenes.push(this.createChallengeScene(options));
    
    // Generate ending scenes
    scenes.push(this.createEndingScene(options, true)); // Success ending
    scenes.push(this.createEndingScene(options, false)); // Alternative ending
    
    return scenes;
  }

  private createOpeningScene(options: SceneBuilderOptions): Scene {
    const sceneId = this.getNextSceneId();
    
    const baseTemplates = {
      physics: {
        location: 'Školní fyzikální laboratoř',
        text: 'Nacházíš se v moderní fyzikální laboratoři plné zajímavých přístrojů a experimentů. Tvým úkolem je prozkoumat fyzikální jevy a aplikovat teoretické znalosti v praxi.',
        theme: '🔬'
      },
      chemistry: {
        location: 'Chemická laboratoř',
        text: 'Vstupuješ do dobře vybavené chemické laboratoře. Kolem sebe vidíš různé chemikálie, přístroje a reakční nádoby. Čeká tě výzkum chemických reakcí.',
        theme: '⚗️'
      },
      biology: {
        location: 'Biologická učebna s mikroskopy',
        text: 'Ocitáš se v biologické učebně plné mikroskopů, preparátů a modelů. Tvým úkolem je prozkoumat svět živých organismů.',
        theme: '🔬'
      },
      mathematics: {
        location: 'Matematická učebna s interaktivní tabulí',
        text: 'Vstupuješ do moderní matematické učebny s interaktivní tabulí a různými geometrickými modely. Čekají tě zajímavé matematické problémy.',
        theme: '📐'
      },
      general: {
        location: 'Interaktivní vzdělávací centrum',
        text: 'Ocitáš se v moderním vzdělávacím centru plném interaktivních expozic a vzdělávacích materiálů.',
        theme: '🏫'
      }
    };

    const template = baseTemplates[options.subject as keyof typeof baseTemplates] || baseTemplates.general;
    
    return {
      id: sceneId,
      title: `${template.theme} Začátek dobrodružství`,
      location: template.location,
      description: `Úvodní scénář pro ${options.subject}`,
      text: template.text,
      choices: [
        {
          id: this.getNextChoiceId(),
          text: 'Prozkoumat dostupné vybavení a materiály',
          description: 'Seznámit se s prostředím a dostupnými nástroji',
          nextSceneId: this.getSceneId(1),
          points: 10,
          educationalFeedback: 'Výborné! Poznání prostředí je základem každého úspěšného výzkumu.',
          difficulty: DifficultyLevel.EASY
        },
        {
          id: this.getNextChoiceId(),
          text: 'Zeptat se na instrukce a postupy',
          description: 'Získat více informací o tom, co se očekává',
          nextSceneId: this.getSceneId(1),
          points: 8,
          educationalFeedback: 'Dobře! Ptaní se na instrukce ukazuje odpovědný přístup k učení.',
          difficulty: DifficultyLevel.EASY
        },
        {
          id: this.getNextChoiceId(),
          text: 'Rovnou začít s prvním experimentem',
          description: 'Naskok rovnou do akce bez přípravy',
          nextSceneId: this.getSceneId(1),
          points: 5,
          consequence: 'Tvá horlivost je obdivuhodná, ale příprava je klíčová pro úspěch!',
          educationalFeedback: 'Nadšení je skvělé, ale systematický přístup přináší lepší výsledky.',
          difficulty: DifficultyLevel.MEDIUM
        }
      ],
      educationalContent: {
        concept: 'Vědecká metoda a příprava',
        explanation: 'Každé vědecké zkoumání začíná přípravou a poznáním prostředí. Systematický přístup vede k lepším výsledkům.',
        examples: [
          'Seznámení s bezpečnostními postupy',
          'Poznání dostupných nástrojů a materiálů',
          'Plánování postupu před začátkem experimentu'
        ],
        difficulty: options.difficulty,
        subject: options.subject
      }
    };
  }

  private createEducationalScene(objective: string, options: SceneBuilderOptions, index: number): Scene {
    const sceneId = this.getSceneId(index);
    
    // Generate scene based on educational objective
    const scene: Scene = {
      id: sceneId,
      title: `📚 Vzdělávací výzva ${index}`,
      location: this.generateLocationForObjective(objective, options.subject),
      description: `Scénář zaměřený na: ${objective}`,
      text: this.generateSceneText(objective, options),
      choices: this.generateEducationalChoices(objective, options, index),
      educationalContent: {
        concept: objective,
        explanation: this.generateExplanation(objective, options.subject),
        examples: this.generateExamples(objective, options.subject),
        difficulty: options.difficulty,
        subject: options.subject
      }
    };

    // Add conditions for advanced scenes
    if (index > 1) {
      scene.conditions = [
        {
          type: 'visited',
          key: this.getSceneId(index - 1),
          value: true,
          operator: '=='
        }
      ];
    }

    return scene;
  }

  private createChallengeScene(options: SceneBuilderOptions): Scene {
    const sceneId = this.getNextSceneId();
    
    return {
      id: sceneId,
      title: '🎯 Finální výzva',
      location: 'Zkušební místnost',
      description: 'Závěrečná výzva kombinující všechny naučené koncepty',
      text: 'Přišel čas ukázat vše, co jsi se naučil! Před tebou je komplexní úkol, který vyžaduje aplikaci všech poznatků, které jsi během dobrodružství získal.',
      choices: [
        {
          id: this.getNextChoiceId(),
          text: 'Systematicky aplikovat všechny naučené principy',
          description: 'Použít strukturovaný přístup založený na získaných znalostech',
          nextSceneId: this.getNextSceneId(),
          points: 50,
          actions: [
            {
              type: 'add_points',
              target: 'bonus',
              value: 25,
              message: '🏆 Bonus za systematický přístup!'
            }
          ],
          educationalFeedback: 'Vynikající! Systematické aplikování znalostí je znak skutečného odborníka.',
          difficulty: DifficultyLevel.HARD
        },
        {
          id: this.getNextChoiceId(),
          text: 'Pokusit se o kreativní řešení',
          description: 'Najít inovativní přístup k problému',
          nextSceneId: this.getNextSceneId(),
          points: 40,
          actions: [
            {
              type: 'add_points',
              target: 'creativity',
              value: 20,
              message: '🎨 Bonus za kreativitu!'
            }
          ],
          educationalFeedback: 'Skvělé! Kreativita a inovace jsou důležité pro vědecký pokrok.',
          difficulty: DifficultyLevel.MEDIUM
        }
      ],
      conditions: [
        {
          type: 'score',
          key: 'totalPoints',
          value: 30,
          operator: '>='
        }
      ],
      educationalContent: {
        concept: 'Aplikace a syntéza znalostí',
        explanation: 'Skutečné porozumění se projeví schopností aplikovat a kombinovat různé koncepty v nových situacích.',
        examples: [
          'Kombinace teoretických znalostí s praktickými dovednostmi',
          'Kreativní řešení komplexních problémů',
          'Systematická aplikace naučených principů'
        ],
        difficulty: options.difficulty,
        subject: options.subject
      }
    };
  }

  private createEndingScene(options: SceneBuilderOptions, isSuccess: boolean): Scene {
    const sceneId = this.getNextSceneId();
    
    if (isSuccess) {
      return {
        id: sceneId,
        title: '🎉 Úspěšné dokončení',
        location: 'Slavnostní aula',
        description: 'Úspěšné završení vzdělávacího dobrodružství',
        text: 'Gratulujeme! Úspěšně jsi dokončil všechny výzvy a prokázal výborné porozumění všem konceptům. Tvé systematické přístupy a kreativní řešení jsou příkladem pro ostatní.',
        choices: [],
        isEnding: true,
        rewards: [
          {
            type: 'badge',
            value: 'narrative_master',
            message: '🏅 Získal jsi odznak Mistr příběhů!'
          },
          {
            type: 'xp',
            value: 100,
            message: '⭐ Bonus 100 XP za dokončení!'
          }
        ],
        educationalContent: {
          concept: 'Úspěšné dokončení vzdělávacího procesu',
          explanation: 'Dokončil jsi komplexní vzdělávací cestu a prokázal schopnost aplikovat získané znalosti.',
          difficulty: options.difficulty,
          subject: options.subject
        }
      };
    } else {
      return {
        id: sceneId + '_alt',
        title: '🌟 Alternativní zakončení',
        location: 'Studijní místnost',
        description: 'Alternativní cesta k dokončení dobrodružství',
        text: 'I když jsi nešel tradiční cestou, naučil ses mnoho cenných věcí! Každá cesta má svou hodnotu a tvé jedinečné řešení problémů ukazuje, že existuje více způsobů, jak dosáhnout cíle.',
        choices: [],
        isEnding: true,
        rewards: [
          {
            type: 'badge',
            value: 'creative_thinker',
            message: '🎨 Získal jsi odznak Kreativní myslitel!'
          },
          {
            type: 'xp',
            value: 75,
            message: '⭐ Bonus 75 XP za alternativní přístup!'
          }
        ],
        educationalContent: {
          concept: 'Alternativní přístupy k učení',
          explanation: 'Každý student má svůj jedinečný způsob učení a myšlení. Diverzita přístupů obohacuje vzdělávací proces.',
          difficulty: options.difficulty,
          subject: options.subject
        }
      };
    }
  }

  private generateLocationForObjective(objective: string, subject: string): string {
    const locations = {
      physics: ['Laboratoř mechaniky', 'Elektrotechnická dílna', 'Optická laboratoř', 'Astronomická observatoř'],
      chemistry: ['Anorganická laboratoř', 'Organická laboratoř', 'Analytická laboratoř', 'Průmyslová hala'],
      biology: ['Botanická zahrada', 'Zoologická laboratoř', 'Mikrobiologická laboratoř', 'Terénní stanice'],
      mathematics: ['Geometrická dílna', 'Počítačová učebna', 'Statistické centrum', 'Aplikační laboratoř'],
      general: ['Výzkumné centrum', 'Interaktivní laboratoř', 'Experimentální prostory', 'Studijní centrum']
    };

    const subjectLocations = locations[subject as keyof typeof locations] || locations.general;
    return subjectLocations[Math.floor(Math.random() * subjectLocations.length)];
  }

  private generateSceneText(objective: string, options: SceneBuilderOptions): string {
    const templates = [
      `Stojíš před novou výzvou spojenou s konceptem "${objective}". Kolem sebe vidíš různé nástroje a materiály, které ti mohou pomoci pochopit tento důležitý princip.`,
      `Ocitáš se v situaci, která vyžaduje praktickou aplikaci znalostí o "${objective}". Jak se rozhodneš postupovat?`,
      `Před tebou je zajímavý problém týkající se "${objective}". Tvé rozhodnutí ovlivní, jak hluboko do této problematiky proniknš.`,
      `Nastala chvíle prozkoumat "${objective}" z praktického hlediska. Které možnosti zvolíš pro své zkoumání?`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateEducationalChoices(objective: string, options: SceneBuilderOptions, index: number): Choice[] {
    const nextSceneId = index < options.educationalObjectives.length 
      ? this.getSceneId(index + 1) 
      : this.getNextSceneId(); // Challenge scene

    return [
      {
        id: this.getNextChoiceId(),
        text: `Prozkoumat teoretické základy "${objective}"`,
        description: 'Zaměřit se na pochopení základních principů',
        nextSceneId,
        points: 15,
        educationalFeedback: `Výborně! Pochopení teorie je základem pro praktickou aplikaci "${objective}".`,
        difficulty: DifficultyLevel.EASY
      },
      {
        id: this.getNextChoiceId(),
        text: `Prakticky experimentovat s "${objective}"`,
        description: 'Učit se prostřednictvím hands-on zkušeností',
        nextSceneId,
        points: 20,
        actions: [
          {
            type: 'add_item',
            target: `experiment_${index}`,
            value: true,
            message: `🧪 Provedl jsi experiment s "${objective}"`
          }
        ],
        educationalFeedback: `Skvělé! Praktické experimentování prohlubuje porozumění konceptu "${objective}".`,
        difficulty: DifficultyLevel.MEDIUM
      },
      {
        id: this.getNextChoiceId(),
        text: `Aplikovat "${objective}" na reálný problém`,
        description: 'Najít praktické využití v každodenním životě',
        nextSceneId,
        points: 25,
        actions: [
          {
            type: 'set_flag',
            target: `applied_${index}`,
            value: true,
            message: `💡 Aplikoval jsi "${objective}" na reálný problém`
          }
        ],
        educationalFeedback: `Vynikající! Aplikace na reálné problémy ukazuje skutečné porozumění "${objective}".`,
        difficulty: DifficultyLevel.HARD
      }
    ];
  }

  private generateExplanation(objective: string, subject: string): string {
    return `Koncept "${objective}" je základním stavebním kamenem v oblasti ${subject}. Pochopení tohoto principu ti umožní lépe rozumět složitějším souvislostem a aplikovat znalosti v praktických situacích.`;
  }

  private generateExamples(objective: string, subject: string): string[] {
    return [
      `Praktická aplikace "${objective}" v každodenním životě`,
      `Experimentální ověření principů "${objective}"`,
      `Souvislosti "${objective}" s dalšími koncepty v ${subject}`
    ];
  }

  private calculateTotalPoints(scenes: Scene[]): number {
    return scenes.reduce((total, scene) => {
      const scenePoints = scene.choices.reduce((choiceTotal, choice) => {
        return choiceTotal + (choice.points || 0);
      }, 0);
      return total + scenePoints;
    }, 0);
  }

  private calculateMaxChoices(estimatedDuration: number): number {
    // Estimate based on 2-3 minutes per choice
    return Math.ceil(estimatedDuration / 2.5);
  }

  private getNextSceneId(): string {
    return `scene_${++this.sceneCounter}`;
  }

  private getSceneId(index: number): string {
    return `scene_${index}`;
  }

  private getNextChoiceId(): string {
    return `choice_${++this.choiceCounter}`;
  }

  // Template-based scene generation
  createFromTemplate(template: NarrativeTemplate): NarrativeActivity {
    return {
      id: `narrative_${Date.now()}`,
      type: 'narrative_adventure' as any,
      title: template.name,
      description: template.description,
      content: {
        templateId: template.id,
        subject: template.subject,
        grade: template.grade
      },
      points: this.calculateTotalPoints(template.scenes),
      difficulty: DifficultyLevel.MEDIUM,
      learningObjectives: template.educationalGoals,
      startingSceneId: template.scenes[0].id,
      availableScenes: template.scenes,
      maxChoices: this.calculateMaxChoices(template.estimatedDuration),
      educationalObjectives: template.educationalGoals
    };
  }

  // Quick scene creation helpers
  createQuickScene(
    title: string,
    text: string,
    choices: Array<{ text: string; nextSceneId: string; points?: number }>
  ): Scene {
    return {
      id: this.getNextSceneId(),
      title,
      location: 'Obecné prostředí',
      description: '',
      text,
      choices: choices.map(choice => ({
        id: this.getNextChoiceId(),
        text: choice.text,
        nextSceneId: choice.nextSceneId,
        points: choice.points || 10,
        difficulty: DifficultyLevel.MEDIUM
      }))
    };
  }
}