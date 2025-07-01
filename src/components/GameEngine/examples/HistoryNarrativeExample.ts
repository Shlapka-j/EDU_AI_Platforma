import { NarrativeActivity, DifficultyLevel, ActivityType } from '../../../types';
import { SceneBuilder } from '../SceneBuilder';

/**
 * Dějepisné dobrodružství - Středověký hrad a rytířstvo
 * Interaktivní příběh o životě ve středověku
 */

export function createMedievalCastleAdventure(): NarrativeActivity {
  return {
    id: 'history_medieval_castle_001',
    type: ActivityType.NARRATIVE_ADVENTURE,
    title: '🏰 Život ve středověkém hradě',
    description: 'Interaktivní dobrodružství o každodenním životě ve středověku, rytířských turnajích a feudálním systému',
    content: {
      theme: 'medieval_life',
      subject: 'history',
      grade: 7
    },
    points: 180,
    difficulty: DifficultyLevel.MEDIUM,
    learningObjectives: [
      'Pochopit feudální systém',
      'Poznat život různých společenských vrstev',
      'Porozumět významu hradů ve středověku',
      'Seznámit se s rytířským kodexem'
    ],
    startingSceneId: 'castle_arrival',
    availableScenes: [
      {
        id: 'castle_arrival',
        title: '🏰 Příjezd k hradu',
        location: 'Hradní brána, rok 1348',
        description: 'Začátek dobrodružství ve středověkém světě',
        text: 'Je rok 1348 a ty přijíždíš k majestátnímu hradu pána Oldřicha z Rožmberka. Vysoké kamenné zdi se tyčí před tebou a z věží vlají barevné prapory. Jsi mladý šlechtic, který má strávit rok na hradě, aby se naučil rytířským ctnostem a dvorským způsobům.',
        choices: [
          {
            id: 'meet_lord',
            text: 'Ihned se představit pánovi hradu',
            description: 'Dodržet protokol a ukázat úctu',
            nextSceneId: 'lord_audience',
            points: 20,
            educationalFeedback: 'Výborně! Ve feudálním systému byla úcta k vrchnímu pánovi nejdůležitější.',
            difficulty: DifficultyLevel.EASY,
            actions: [
              {
                type: 'add_item',
                target: 'lords_favor',
                value: true,
                message: '👑 Získal jsi přízeň pána hradu'
              }
            ]
          },
          {
            id: 'explore_castle',
            text: 'Nejdříve prozkoumat hrad',
            description: 'Seznámit se s prostředím před oficiálním představením',
            nextSceneId: 'castle_exploration',
            points: 15,
            educationalFeedback: 'Dobré pozorování! Znalost prostředí je užitečná.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'talk_to_servants',
            text: 'Zeptat se služebnictva na život na hradě',
            description: 'Získat informace od těch, kdo hrad znají nejlépe',
            nextSceneId: 'servant_wisdom',
            points: 18,
            educationalFeedback: 'Chytré! Služebnictvo často ví nejvíce o skutečném životě na hradě.',
            difficulty: DifficultyLevel.MEDIUM,
            actions: [
              {
                type: 'add_item',
                target: 'servant_knowledge',
                value: true,
                message: '💭 Získal jsi cenné informace od služebnictva'
              }
            ]
          }
        ],
        educationalContent: {
          concept: 'Feudální systém a hierarchie',
          explanation: 'Ve středověku existoval přísný společenský řád. Na vrcholu stál král, pod ním šlechtici, rytíři, a na nejnižší příčce nevolníci a služebnictvo.',
          examples: [
            'Vztah pán-vazal založený na věrnosti',
            'Léno (půda) jako odměna za službu',
            'Povinnosti jednotlivých stavů'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'lord_audience',
        title: '👑 Audience u pána',
        location: 'Hradní síň',
        description: 'Setkání s feudálním pánem',
        text: 'Vcházíš do velkolepé hradní síně. Pán Oldřich sedí na vyvýšeném křesle, oblečený v drahých šatech. Kolem něj stojí rytíři a dvorní dámy. Musíš prokázat, že znáš dvorské způsoby a zasloužíš si místo mezi šlechtou.',
        choices: [
          {
            id: 'proper_bow',
            text: 'Provést hlubokou poklonu a čekat na povolení mluvit',
            description: 'Dodržet přísný dvorský protokol',
            nextSceneId: 'lords_approval',
            points: 25,
            educationalFeedback: 'Perfektně! Dvorský protokol byl ve středověku velmi přísný.',
            difficulty: DifficultyLevel.EASY
          },
          {
            id: 'bring_gift',
            text: 'Přinést dar jako projev úcty',
            description: 'Ukázat štědrost a respekt podle rytířských zvyků',
            nextSceneId: 'gift_ceremony',
            points: 30,
            actions: [
              {
                type: 'add_points',
                target: 'honor_bonus',
                value: 15,
                message: '🎁 Bonus za správné vystupování!'
              }
            ],
            educationalFeedback: 'Skvělé! Dary byly důležitou součástí feudálních vztahů.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'recite_lineage',
            text: 'Vyrecitovat svůj rod a předky',
            description: 'Prokázat svůj šlechtický původ',
            nextSceneId: 'lineage_recognition',
            points: 22,
            educationalFeedback: 'Dobře! Šlechtický původ byl ve středověku klíčový.',
            difficulty: DifficultyLevel.HARD
          }
        ],
        conditions: [
          {
            type: 'item',
            key: 'lords_favor',
            value: true,
            operator: '=='
          }
        ],
        educationalContent: {
          concept: 'Dvorský ceremoniál a etiketa',
          explanation: 'Středověký dvůr měl složité pravidla chování. Každý gest měl svůj význam a porušení etikety mohlo vést k vyhnanství.',
          examples: [
            'Poklony podle společenského postavení',
            'Dar jako symbol loajality',
            'Význam rodového původu'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'castle_exploration',
        title: '🔍 Průzkum hradu',
        location: 'Hradní nádvoří',
        description: 'Seznámení s hradní architekturou a funkcemi',
        text: 'Procházíš hradním komplexem a obdivuješ jeho důmyslnou stavbu. Vidíš mohutné kamenné zdi, střílny, studnu uprostřed nádvoří a různé budovy s odlišnými funkcemi. Každá část hradu má svůj účel v obraně a každodenním životě.',
        choices: [
          {
            id: 'visit_armory',
            text: 'Navštívit zbrojnici',
            description: 'Prozkoumat středo věké zbraně a brnění',
            nextSceneId: 'armory_discovery',
            points: 20,
            actions: [
              {
                type: 'add_item',
                target: 'weapon_knowledge',
                value: true,
                message: '⚔️ Naučil ses o středověkých zbraních'
              }
            ],
            educationalFeedback: 'Zajímavé! Středověké zbraně byly vrcholem tehdejší technologie.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'check_defenses',
            text: 'Prozkoumat obranné systémy',
            description: 'Pochopit, jak hrad chránil své obyvatele',
            nextSceneId: 'defense_systems',
            points: 25,
            educationalFeedback: 'Výborně! Hrady byly komplexní obranné systémy.',
            difficulty: DifficultyLevel.HARD
          },
          {
            id: 'visit_chapel',
            text: 'Navštívit hradní kapli',
            description: 'Poznat roli náboženství ve středověku',
            nextSceneId: 'chapel_visit',
            points: 18,
            actions: [
              {
                type: 'set_flag',
                target: 'religious_education',
                value: true
              }
            ],
            educationalFeedback: 'Dobře! Náboženství bylo centrem středověkého života.',
            difficulty: DifficultyLevel.EASY
          }
        ],
        educationalContent: {
          concept: 'Středověká hradní architektura',
          explanation: 'Hrady byly nejen sídly šlechty, ale hlavně obrannými pevnostmi. Každý prvek měl praktický účel - od výšky zdí po umístění bran.',
          examples: [
            'Donjon (hlavní věž) jako poslední útočiště',
            'Padací most a vlčí jámy',
            'Střílny pro lukostřelce'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'knight_training',
        title: '⚔️ Rytířský výcvik',
        location: 'Cvičiště',
        description: 'Trénink budoucího rytíře',
        text: 'Mistr zbraní tě vede na cvičiště. Kolem tebe jiní mladí šlechtici trénují s meči, luky a kopími. Rytířský výcvik je náročný - musíš zvládnout nejen boj, ale i jezdecké umění a rytířský kodex.',
        choices: [
          {
            id: 'sword_training',
            text: 'Trénovat s mečem',
            description: 'Naučit se základy šermířského umění',
            nextSceneId: 'sword_mastery',
            points: 20,
            educationalFeedback: 'Meč byl symbolem rytířského stavu!',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'horse_riding',
            text: 'Procvičovat jízdu na koni',
            description: 'Rytíř bez koně není rytířem',
            nextSceneId: 'equestrian_skills',
            points: 25,
            actions: [
              {
                type: 'add_item',
                target: 'horse_mastery',
                value: true,
                message: '🐎 Stal ses zkušeným jezdcem'
              }
            ],
            educationalFeedback: 'Výborně! Koně byli základem středověké válečné taktiky.',
            difficulty: DifficultyLevel.HARD
          },
          {
            id: 'chivalry_lessons',
            text: 'Studovat rytířský kodex',
            description: 'Pochopit rytířské ctnosti a čest',
            nextSceneId: 'chivalry_understanding',
            points: 30,
            actions: [
              {
                type: 'set_flag',
                target: 'chivalry_knowledge',
                value: true
              },
              {
                type: 'add_points',
                target: 'honor_points',
                value: 20,
                message: '🛡️ Získal jsi body cti!'
              }
            ],
            educationalFeedback: 'Skvělé! Rytířský kodex formoval celou středověkou kulturu.',
            difficulty: DifficultyLevel.HARD
          }
        ],
        educationalContent: {
          concept: 'Rytířstvo a rytířský kodex',
          explanation: 'Rytíři nebyli jen vojáci, ale představovali ideál středověkého muže. Rytířský kodex zdůrazňoval čest, odvahu, ochranu slabých a věrnost.',
          examples: [
            'Chivalrie - rytířské ctnosti',
            'Ochrana církve a bezbranných',
            'Věrnost pánovi a slovu'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'tournament_day',
        title: '🏆 Den turnaje',
        location: 'Turnajové pole',
        description: 'Velký rytířský turnaj',
        text: 'Nastává den velkého turnaje! Z celého okolí se sjeli rytíři, aby prokázali svou zdatnost. Tribuny jsou plné šlechty a měšťanů. Ty máš možnost ukázat, co ses naučil, ale musíš si vybrat, ve které disciplíně budeš soutěžit.',
        choices: [
          {
            id: 'joust_competition',
            text: 'Zúčastnit se klání s kopím',
            description: 'Nejprestižnější rytířská disciplína',
            nextSceneId: 'joust_results',
            points: 35,
            educationalFeedback: 'Klání s kopím bylo vrcholem rytířského umění!',
            difficulty: DifficultyLevel.HARD,
            conditions: [
              {
                type: 'item',
                key: 'horse_mastery',
                value: true,
                operator: '=='
              }
            ]
          },
          {
            id: 'archery_contest',
            text: 'Soutěžit v lukostřelbě',
            description: 'Prokázat přesnost a soustředění',
            nextSceneId: 'archery_results',
            points: 25,
            educationalFeedback: 'Lukostřelba byla důležitá dovednost každého válečníka.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'poetry_recital',
            text: 'Recitovat dvorskou poezii',
            description: 'Ukázat vzdělání a kultivovanost',
            nextSceneId: 'poetry_success',
            points: 30,
            actions: [
              {
                type: 'add_item',
                target: 'court_poet_recognition',
                value: true,
                message: '📜 Stal ses uznávaným dvorním básníkem'
              }
            ],
            educationalFeedback: 'Krásné! Rytíři měli být nejen bojovníci, ale i vzdělanci.',
            difficulty: DifficultyLevel.MEDIUM
          }
        ],
        conditions: [
          {
            type: 'visited',
            key: 'knight_training',
            value: true,
            operator: '=='
          }
        ],
        educationalContent: {
          concept: 'Středověké turnaje a společenský život',
          explanation: 'Turnaje byly nejen zábavou, ale také způsobem, jak rytíři udržovali bojové dovednosti v míru a získávali prestiž.',
          examples: [
            'Klání s kopím jako hlavní disciplína',
            'Turnaje jako společenské události',
            'Význam cti a slávy pro rytíře'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'peasant_encounter',
        title: '👨‍🌾 Setkání s nevolníky',
        location: 'Polní cesta mimo hrad',
        description: 'Pohled na život nejnižší společenské vrstvy',
        text: 'Při cestě k sousednímu hradu potkáváš skupinu nevolníků, kteří se vracejí z pole. Jsou unavení a špinaví od práce. Jeden z nich se k tobě obrací s prosbou o pomoc - jeho dítě je nemocné a potřebuje lék z hradní lékárny.',
        choices: [
          {
            id: 'help_peasants',
            text: 'Pomoci nevolníkům získat lék',
            description: 'Ukázat soucit vůči nižším stavům',
            nextSceneId: 'noble_compassion',
            points: 35,
            actions: [
              {
                type: 'add_item',
                target: 'peoples_blessing',
                value: true,
                message: '🙏 Získal jsi požehnání lidu'
              },
              {
                type: 'add_points',
                target: 'compassion_points',
                value: 25,
                message: '❤️ Bonus za soucit!'
              }
            ],
            educationalFeedback: 'Výjimečné! Ne všichni šlechtici se starali o své poddané.',
            difficulty: DifficultyLevel.HARD
          },
          {
            id: 'ignore_peasants',
            text: 'Pokračovat v cestě bez povšimnutí',
            description: 'Chovat se podle společenských konvencí',
            nextSceneId: 'traditional_nobility',
            points: 10,
            educationalFeedback: 'Bohužel typické chování pro mnoho šlechticů té doby.',
            difficulty: DifficultyLevel.EASY
          },
          {
            id: 'question_peasants',
            text: 'Zeptat se na jejich životní podmínky',
            description: 'Projevit zájem o život nevolníků',
            nextSceneId: 'peasant_wisdom',
            points: 25,
            actions: [
              {
                type: 'set_flag',
                target: 'understands_peasant_life',
                value: true
              }
            ],
            educationalFeedback: 'Dobře! Porozumění různým vrstvám společnosti je cenné.',
            difficulty: DifficultyLevel.MEDIUM
          }
        ],
        educationalContent: {
          concept: 'Sociální nerovnost ve feudalismu',
          explanation: 'Středověká společnost byla přísně hierarchická. Nevolníci tvořili většinu obyvatelstva, ale měli velmi málo práv a žili v těžkých podmínkách.',
          examples: [
            'Nevolníci vázaní k půdě',
            'Robota - povinná práce pro pána',
            'Minimální práva a těžký život'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'monastery_visit',
        title: '⛪ Návštěva kláštera',
        location: 'Benediktinský klášter',
        description: 'Poznání role církve ve středověku',
        text: 'Přijíždíš do místního benediktinského kláštera. Mniši tě vítají s pohostinností typickou pro jejich řád. Klášter je centrem vzdělanosti - je zde knihovna, škola a také nemocnice pro chudé. Vidíš, jak důležitou roli hraje církev v každodenním životě.',
        choices: [
          {
            id: 'visit_library',
            text: 'Navštívit klášterní knihovnu',
            description: 'Poznat centrum středověké vzdělanosti',
            nextSceneId: 'medieval_knowledge',
            points: 30,
            actions: [
              {
                type: 'add_item',
                target: 'manuscript_knowledge',
                value: true,
                message: '📚 Získal jsi vzácné vědomosti z rukopisů'
              }
            ],
            educationalFeedback: 'Skvělé! Kláštery byly hlavními centry vzdělanosti.',
            difficulty: DifficultyLevel.HARD
          },
          {
            id: 'help_poor',
            text: 'Pomáhat v klášterní nemocnici',
            description: 'Vidět charitativní práci církve',
            nextSceneId: 'charitable_work',
            points: 25,
            educationalFeedback: 'Dobře! Církev hrála klíčovou roli v péči o chudé.',
            difficulty: DifficultyLevel.MEDIUM
          },
          {
            id: 'attend_service',
            text: 'Zúčastnit se bohoslužby',
            description: 'Pochopit duchovní život středověku',
            nextSceneId: 'spiritual_experience',
            points: 20,
            educationalFeedback: 'Náboženství bylo centrem středověkého světonázoru.',
            difficulty: DifficultyLevel.EASY
          }
        ],
        educationalContent: {
          concept: 'Role církve ve středověké společnosti',
          explanation: 'Církev nebyla jen duchovní institucí, ale také centrem vzdělanosti, zdravotnictví a sociální péče. Ovlivňovala všechny aspekty života.',
          examples: [
            'Kláštery jako centra vzdělanosti',
            'Církevní charita a péče o chudé',
            'Duchovní vedení společnosti'
          ],
          difficulty: DifficultyLevel.MEDIUM,
          subject: 'history'
        }
      },
      {
        id: 'year_end_ceremony',
        title: '🎓 Závěrečný obřad',
        location: 'Hradní síň',
        description: 'Dokončení ročního pobytu na hradě',
        text: 'Uplynul celý rok tvého pobytu na hradě. Pán Oldřich svolává všechny do hradní síně na slavnostní ceremoniál. Budeš odměněn podle toho, jak ses během roku osvědčil a co ses naučil o středověkém životě.',
        choices: [],
        isEnding: true,
        rewards: [
          {
            type: 'badge',
            value: 'medieval_scholar',
            message: '🏰 Stal ses znalcem středověku!'
          },
          {
            type: 'xp',
            value: 200,
            message: '⭐ Bonus 200 XP za dokončení historického dobrodružství!'
          }
        ],
        conditions: [
          {
            type: 'score',
            key: 'totalPoints',
            value: 100,
            operator: '>='
          }
        ],
        educationalContent: {
          concept: 'Komplexní pochopení středověké společnosti',
          explanation: 'Dokončil jsi cestu středověkým světem a poznal různé aspekty feudální společnosti - od šlechtických dvorů po kláštery a život prostého lidu.',
          difficulty: DifficultyLevel.HARD,
          subject: 'history'
        }
      }
    ],
    maxChoices: 15,
    educationalObjectives: [
      'Pochopit feudální systém',
      'Poznat život různých společenských vrstev',
      'Porozumět významu hradů ve středověku',
      'Seznámit se s rytířským kodexem'
    ]
  };
}

/**
 * Rychlé demo pro testování dějepisného obsahu
 */
export function createHistoryQuickDemo(): NarrativeActivity {
  const sceneBuilder = new SceneBuilder();
  
  return sceneBuilder.createNarrativeActivity(
    '👑 Korunovace Karla IV.',
    'Krátké dobrodružství o významné události českých dějin',
    {
      subject: 'history',
      grade: 8,
      difficulty: DifficultyLevel.MEDIUM,
      educationalObjectives: [
        'Poznat význam Karla IV. pro české dějiny',
        'Pochopit důležitost Svaté říše římské',
        'Seznámit se s korunovačním ceremoniálem'
      ],
      estimatedDuration: 15,
      theme: 'czech_history',
      includeMultimedia: false
    }
  );
}