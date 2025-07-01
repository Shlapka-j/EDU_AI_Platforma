import { NarrativeActivity, DifficultyLevel, ActivityType } from '../../../types';
import { SceneBuilder } from '../SceneBuilder';

/**
 * Příklad použití Narrative Engine pro vytvoření fyzikálního dobrodružství
 * Téma: Gravitace a volný pád
 */

export function createPhysicsGravityAdventure(): NarrativeActivity {
  const sceneBuilder = new SceneBuilder();
  
  return sceneBuilder.createNarrativeActivity(
    '🌍 Gravitační dobrodružství',
    'Interaktivní příběh o gravitaci a volném pádu s praktickými experimenty',
    {
      subject: 'physics',
      grade: 8,
      difficulty: DifficultyLevel.MEDIUM,
      educationalObjectives: [
        'Pochopit gravitační zrychlení',
        'Aplikovat zákony volného pádu',
        'Experimentovat s různými hmotnostmi',
        'Měřit čas a vzdálenost při pádu'
      ],
      estimatedDuration: 25, // minutes
      theme: 'gravity_exploration',
      includeMultimedia: true
    }
  );
}

/**
 * Příklad manuálního vytvoření komplexního narrativního dobrodružství
 */
export function createAdvancedPhysicsNarrative(): NarrativeActivity {
  return {
    id: 'physics_advanced_gravity_001',
    type: ActivityType.NARRATIVE_ADVENTURE,
    title: '🏗️ Stavba věže a gravitace',
    description: 'Komplexní fyzikální dobrodružství kombinující stavbu, měření a experimenty s gravitací',
    content: {
      theme: 'engineering_physics',
      subject: 'physics',
      grade: 9
    },
    points: 200,
    difficulty: DifficultyLevel.HARD,
    learningObjectives: [
      'Aplikovat gravitační zákony při stavbě',
      'Optimalizovat konstrukce s ohledem na gravitaci',
      'Porozumět vztahu mezi výškou a potenciální energií',
      'Experimentovat s různými materiály a jejich pádem'
    ],
    startingSceneId: 'tower_intro',
    availableScenes: [
      {
        id: 'tower_intro',
        title: '🏗️ Úvod do stavebního projektu',
        location: 'Stavební plac školní věže',
        description: 'Začátek ambiciózního stavebního projektu',
        text: 'Stojíš před základy nové školní věže. Jako hlavní inženýr máš za úkol navrhnout a postavit věž, která bude bezpečná a účelná. Musíš přitom brát v úvahu působení gravitace na všechny části konstrukce.',
        choices: [
          {
            id: 'analyze_foundation',
            text: 'Analyzovat zatížení základů',
            description: 'Spočítat, jak gravitace působí na celou konstrukci',
            nextSceneId: 'foundation_analysis',
            points: 25,
            educationalFeedback: 'Výborně! Analýza základů je klíčová pro bezpečnou stavbu.',
            difficulty: DifficultyLevel.HARD,
            actions: [
              {
                type: 'add_item',
                target: 'foundation_plans',
                value: true,
                message: '📐 Získal jsi plány základů'
              }
            ]
          },
          {
            id: 'choose_materials',
            text: 'Vybrat stavební materiály',
            description: 'Rozhodnout o materiálech s ohledem na jejich hmotnost',
            nextSceneId: 'material_selection',
            points: 20,
            educationalFeedback: 'Dobrá volba! Hmotnost materiálů ovlivňuje gravitační zatížení.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'start_building',
            text: 'Rovnou začít stavět',
            description: 'Pustit se do stavby bez detailní přípravy',
            nextSceneId: 'hasty_building',
            points: 5,
            consequence: 'Tvá horlivost je chvályhodná, ale inženýrské projekty vyžadují pečlivé plánování!',
            educationalFeedback: 'Plánování je v inženýrství stejně důležité jako samotná stavba.',
            difficulty: DifficultyLevel.EASY
          }
        ],
        educationalContent: {
          concept: 'Gravitační síla v konstrukcích',
          explanation: 'Gravitace působí na všechny hmotné objekty směrem dolů. Ve stavebnictví musíme počítat s gravitačním zatížením, které ovlivňuje stabilitu a bezpečnost konstrukcí.',
          examples: [
            'Výpočet zatížení základů budovy',
            'Volba vhodných materiálů podle jejich hustoty',
            'Navrhování podporových konstrukcí'
          ],
          difficulty: DifficultyLevel.HARD,
          subject: 'physics'
        }
      },
      {
        id: 'foundation_analysis',
        title: '📐 Analýza základů',
        location: 'Inženýrská kancelář',
        description: 'Detailní výpočty gravitačního zatížení',
        text: 'Sedíš u výpočetního stolu se složitými rovnicemi. Před tebou jsou plány věže a kalkulačka. Musíš spočítat, jakou silou bude gravitace působit na základy věže v závislosti na výšce a použitých materiálech.',
        choices: [
          {
            id: 'calculate_steel',
            text: 'Spočítat zatížení pro ocelovou konstrukci',
            description: 'Použít hustotu oceli (7850 kg/m³) pro výpočty',
            nextSceneId: 'steel_calculations',
            points: 30,
            actions: [
              {
                type: 'add_item',
                target: 'steel_calculations',
                value: true,
                message: '🔧 Dokončil jsi výpočty pro ocel'
              },
              {
                type: 'set_flag',
                target: 'material_choice',
                value: 'steel'
              }
            ],
            educationalFeedback: 'Výborně! Ocel má vysokou pevnost, ale je také těžká - gravitační zatížení bude značné.',
            difficulty: DifficultyLevel.HARD
          },
          {
            id: 'calculate_concrete',
            text: 'Spočítat zatížení pro betonovou konstrukci',
            description: 'Použít hustotu betonu (2400 kg/m³) pro výpočty',
            nextSceneId: 'concrete_calculations',
            points: 25,
            actions: [
              {
                type: 'add_item',
                target: 'concrete_calculations',
                value: true,
                message: '🏗️ Dokončil jsi výpočty pro beton'
              },
              {
                type: 'set_flag',
                target: 'material_choice',
                value: 'concrete'
              }
            ],
            educationalFeedback: 'Dobrá volba! Beton je středně těžký a má dobrou pevnost v tlaku.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'use_formula',
            text: 'Použít obecný vzorec F = m × g',
            description: 'Aplikovat základní gravitační vzorec',
            nextSceneId: 'formula_application',
            points: 20,
            educationalFeedback: 'Správně! F = m × g je základní vzorec pro výpočet gravitační síly.',
            difficulty: DifficultyLevel.EASY
          }
        ],
        conditions: [
          {
            type: 'item',
            key: 'foundation_plans',
            value: true,
            operator: '=='
          }
        ],
        educationalContent: {
          concept: 'Výpočet gravitačního zatížení',
          explanation: 'Gravitační síla F = m × g, kde m je hmotnost objektu a g je gravitační zrychlení (9,81 m/s²). Pro stavby musíme počítat s celkovou hmotností všech materiálů.',
          examples: [
            'Výpočet hmotnosti betonové desky: V × ρ × g',
            'Zatížení ocelové konstrukce: délka × průřez × hustota × g',
            'Bezpečnostní koeficienty pro různé materiály'
          ],
          difficulty: DifficultyLevel.HARD,
          subject: 'physics'
        }
      },
      {
        id: 'material_selection',
        title: '🧱 Výběr materiálů',
        location: 'Stavební sklad',
        description: 'Volba vhodných stavebních materiálů',
        text: 'Procházíš skladem plným různých stavebních materiálů. Každý má jiné vlastnosti - hmotnost, pevnost, cenu. Tvé rozhodnutí ovlivní, jak bude gravitace působit na věž a jaká bude její stabilita.',
        choices: [
          {
            id: 'lightweight_materials',
            text: 'Vybrat lehké materiály (hliník, kompozity)',
            description: 'Minimalizovat gravitační zatížení',
            nextSceneId: 'lightweight_construction',
            points: 25,
            actions: [
              {
                type: 'set_flag',
                target: 'construction_weight',
                value: 'light'
              },
              {
                type: 'add_item',
                target: 'aluminum_beams',
                value: true,
                message: '✨ Získal jsi hliníkové nosníky'
              }
            ],
            educationalFeedback: 'Chytrá volba! Lehké materiály snižují gravitační zatížení základů.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'balanced_materials',
            text: 'Zvolit vyváženou kombinaci materiálů',
            description: 'Optimální poměr váhy, pevnosti a ceny',
            nextSceneId: 'balanced_construction',
            points: 30,
            actions: [
              {
                type: 'set_flag',
                target: 'construction_weight',
                value: 'balanced'
              },
              {
                type: 'add_points',
                target: 'engineering_bonus',
                value: 15,
                message: '⚖️ Bonus za vyváženost!'
              }
            ],
            educationalFeedback: 'Výborně! Inženýrské řešení často spočívá v nalezení optimální rovnováhy.',
            difficulty: DifficultyLevel.HARD
          },
          {
            id: 'heavy_materials',
            text: 'Použít těžké, pevné materiály (ocel, beton)',
            description: 'Maximální pevnost za cenu vysoké hmotnosti',
            nextSceneId: 'heavy_construction',
            points: 20,
            actions: [
              {
                type: 'set_flag',
                target: 'construction_weight',
                value: 'heavy'
              }
            ],
            educationalFeedback: 'Pevné materiály jsou dobré, ale vyžadují silnější základy kvůli gravitaci.',
            difficulty: DifficultyLevel.MEDIUM
          }
        ],
        educationalContent: {
          concept: 'Materiálové vlastnosti a gravitace',
          explanation: 'Každý stavební materiál má svou hustotu, která určuje, jak silně na něj působí gravitace. Hustota × objem × g = gravitační síla.',
          examples: [
            'Hliník: 2700 kg/m³ - lehký, ale drahý',
            'Ocel: 7850 kg/m³ - pevná, ale těžká',
            'Beton: 2400 kg/m³ - dostupný, střední vlastnosti'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'physics'
        }
      },
      {
        id: 'tower_testing',
        title: '🧪 Testování věže',
        location: 'Hotová věž - testovací plošina',
        description: 'Experimenty s dokončenou věží',
        text: 'Věž je hotová! Nyní je čas otestovat, jak dobře funguje. Máš k dispozici různé předměty, které můžeš spustit z různých výšek věže a pozorovat, jak gravitace ovlivňuje jejich pád.',
        choices: [
          {
            id: 'drop_test_light',
            text: 'Spustit lehké předměty (pero, papír)',
            description: 'Test s objekty malé hmotnosti',
            nextSceneId: 'light_object_results',
            points: 15,
            educationalFeedback: 'Zajímavé! Lehké předměty jsou více ovlivněny odporem vzduchu.',
            difficulty: DifficultyLevel.EASY
          },
          {
            id: 'drop_test_heavy',
            text: 'Spustit těžké předměty (kámen, kov)',
            description: 'Test s objekty velké hmotnosti',
            nextSceneId: 'heavy_object_results',
            points: 20,
            educationalFeedback: 'Výborně! Těžké předměty lépe demonstruují čistou gravitaci.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'measure_time',
            text: 'Přesně měřit časy pádu stopkami',
            description: 'Vědecký přístup s přesnými měřeními',
            nextSceneId: 'precise_measurements',
            points: 35,
            actions: [
              {
                type: 'add_item',
                target: 'measurement_data',
                value: true,
                message: '📊 Získal jsi přesná data o pádu'
              }
            ],
            educationalFeedback: 'Skvělé! Přesná měření jsou základem vědeckého zkoumání.',
            difficulty: DifficultyLevel.HARD
          }
        ],
        conditions: [
          {
            type: 'visited',
            key: 'foundation_analysis',
            value: true,
            operator: '=='
          }
        ],
        educationalContent: {
          concept: 'Experimentální ověření gravitačních zákonů',
          explanation: 'Experimentování nám umožňuje ověřit teoretické poznatky o gravitaci. Vzorec h = ½gt² popisuje dráhu volného pádu.',
          examples: [
            'Měření času pádu z různých výšek',
            'Porovnání pádu různě těžkých objektů',
            'Vliv odporu vzduchu na pád'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'physics'
        }
      },
      {
        id: 'project_completion',
        title: '🎯 Dokončení projektu',
        location: 'Slavnostní předání věže',
        description: 'Úspěšné zakončení stavebního projektu',
        text: 'Gratulujeme! Úspěšně jsi dokončil stavbu věže a provedl všechny potřebné testy. Tvé pochopení gravitace a jejího vlivu na stavby je nyní mnohem hlubší. Věž stojí pevně a bezpečně díky tvým správným výpočtům.',
        choices: [],
        isEnding: true,
        rewards: [
          {
            type: 'badge',
            value: 'master_engineer',
            message: '🏗️ Získal jsi odznak Mistr inženýr!'
          },
          {
            type: 'xp',
            value: 150,
            message: '⭐ Bonus 150 XP za dokončení složitého projektu!'
          }
        ],
        educationalContent: {
          concept: 'Aplikace fyziky v inženýrství',
          explanation: 'Dokončil jsi komplexní projekt, který kombinoval teoretické znalosti gravitace s praktickou aplikací v stavebnictví.',
          difficulty: DifficultyLevel.HARD,
          subject: 'physics'
        }
      }
    ],
    maxChoices: 12,
    educationalObjectives: [
      'Aplikovat gravitační zákony při stavbě',
      'Optimalizovat konstrukce s ohledem na gravitaci',
      'Porozumět vztahu mezi výškou a potenciální energií',
      'Experimentovat s různými materiály a jejich pádem'
    ]
  };
}

/**
 * Helper funkce pro vytvoření rychlého demo narrative
 */
export function createQuickPhysicsDemo(): NarrativeActivity {
  const sceneBuilder = new SceneBuilder();
  
  const quickScene1 = sceneBuilder.createQuickScene(
    '🎈 Padající balónek',
    'Držíš v ruce balónek naplněný heliem. Co se stane, když ho pustíš?',
    [
      { text: 'Balónek poletí nahoru', nextSceneId: 'balloon_up', points: 20 },
      { text: 'Balónek spadne dolů', nextSceneId: 'balloon_down', points: 5 },
      { text: 'Balónek zůstane na místě', nextSceneId: 'balloon_static', points: 10 }
    ]
  );

  const quickScene2 = sceneBuilder.createQuickScene(
    '✨ Výsledek experimentu',
    'Balónek skutečně letí nahoru! Helium je lehčí než vzduch, takže vztlaková síla vzduchu je větší než gravitační síla působící na balónek.',
    [
      { text: 'Zkusit další experiment', nextSceneId: 'scene_1', points: 10 }
    ]
  );

  quickScene2.id = 'balloon_up';
  quickScene2.isEnding = true;

  return {
    id: 'quick_physics_demo',
    type: ActivityType.NARRATIVE_ADVENTURE,
    title: '🧪 Rychlé fyzikální demo',
    description: 'Krátké demo narrative engine s fyzikálním obsahem',
    content: { subject: 'physics', grade: 6 },
    points: 50,
    difficulty: DifficultyLevel.EASY,
    learningObjectives: ['Pochopit vztlakovou sílu', 'Porovnat různé síly'],
    startingSceneId: quickScene1.id,
    availableScenes: [quickScene1, quickScene2],
    maxChoices: 3,
    educationalObjectives: ['Pochopit vztlakovou sílu', 'Porovnat různé síly']
  };
}