import React, { useState, useEffect } from 'react';
import { Activity, GameState, LearningPreferences } from '../../../types';

interface QuizModeProps {
  activity: Activity;
  gameState: GameState;
  preferences: LearningPreferences;
  adaptiveSettings: any;
  onComplete: (result: any) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: (interaction: any) => void;
}

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'drag_drop';
  options?: string[];
  correct: any;
  explanation: string;
  points: number;
  timeLimit?: number;
  hint?: string;
}

interface Answer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  activity,
  gameState,
  preferences,
  adaptiveSettings,
  onComplete,
  onProgressUpdate,
  onInteraction
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Generate personalized quiz questions
  useEffect(() => {
    generateQuizQuestions();
  }, [activity]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showExplanation) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showExplanation]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !showExplanation) {
      handleSubmitAnswer();
    }
  }, [timeLeft, showExplanation]);

  const generateQuizQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/local-ai/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          blockId: activity.id,
          studentId: gameState.studentId,
          options: {
            difficulty: adaptiveSettings.difficulty,
            questionCount: 5,
            studentProfile: {
              learningStyle: preferences.visualLearning > 0.5 ? 'visual' : 'text',
              preferredTypes: preferences.readingWritingLearning > 0.5 ? ['short_answer'] : ['multiple_choice'],
              averageScore: gameState.stats.physicsUnderstandingLevel || 50
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedQuestions = data.data.questions.map((q: any, index: number) => ({
          id: `q_${index}`,
          question: q.question,
          type: q.type,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          points: q.points || 20,
          timeLimit: q.timeLimit || (adaptiveSettings.difficulty === 'easy' ? 90 : 60),
          hint: generateHint(q)
        }));
        
        setQuestions(generatedQuestions);
        if (generatedQuestions.length > 0) {
          setTimeLeft(generatedQuestions[0].timeLimit || 60);
          setQuestionStartTime(Date.now());
        }
      } else {
        loadFallbackQuestions();
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      loadFallbackQuestions();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHint = (question: any): string => {
    const hints: { [key: string]: string } = {
      gravitace: 'Vzpomeň si na to, jak rychle padají různé předměty na Zemi.',
      síla: 'Síla se měří v Newtonech a působí na předměty.',
      energie: 'Energie se zachovává - nemůže vzniknout ani zaniknout.',
      rychlost: 'Rychlost je dráha dělená časem.',
      hmotnost: 'Hmotnost zůstává stejná kdekoli ve vesmíru.'
    };

    const questionLower = question.question.toLowerCase();
    for (const [key, hint] of Object.entries(hints)) {
      if (questionLower.includes(key)) {
        return hint;
      }
    }
    
    return 'Přemýšlej o tom, co víš o fyzice z předchozích lekcí.';
  };

  const loadFallbackQuestions = () => {
    const fallbackQuestions: Question[] = [
      {
        id: 'q_1',
        question: 'Jaká je přibližná hodnota gravitačního zrychlení na Zemi?',
        type: 'multiple_choice',
        options: ['9,8 m/s²', '10 m/s²', '8,9 m/s²', '11,2 m/s²'],
        correct: 0,
        explanation: 'Gravitační zrychlení na Zemi je přibližně 9,8 m/s². Tato hodnota znamená, že každou sekundu se rychlost padajícího předmětu zvýší o 9,8 m/s.',
        points: 20,
        timeLimit: 60,
        hint: 'Je to hodnota, kterou používáme při výpočtech pádu předmětů.'
      },
      {
        id: 'q_2',
        question: 'Dva předměty různé hmotnosti pustíme současně ze stejné výšky. Který dopadne dříve?',
        type: 'multiple_choice',
        options: ['Těžší předmět', 'Lehčí předmět', 'Oba současně (při zanedbání odporu vzduchu)', 'Závisí na materiálu'],
        correct: 2,
        explanation: 'Při zanedbání odporu vzduchu dopadnou oba předměty současně. Gravitační zrychlení je pro všechny předměty stejné, bez ohledu na jejich hmotnost.',
        points: 25,
        timeLimit: 90,
        hint: 'Vzpomeň si na Galileův experiment s Šikmou věží v Pise.'
      }
    ];
    
    setQuestions(fallbackQuestions);
    setTimeLeft(fallbackQuestions[0].timeLimit || 60);
    setQuestionStartTime(Date.now());
  };

  const handleAnswerChange = (answer: any) => {
    setCurrentAnswer(answer);
    
    onInteraction({
      type: 'answer_select',
      questionId: getCurrentQuestion()?.id,
      answer,
      timestamp: Date.now()
    });
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = checkAnswer(currentAnswer, currentQuestion.correct, currentQuestion.type);
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: currentAnswer,
      isCorrect,
      timeSpent,
      hintsUsed
    };

    setAnswers(prev => [...prev, answer]);
    setShowExplanation(true);

    onInteraction({
      type: 'answer_submit',
      questionId: currentQuestion.id,
      userAnswer: currentAnswer,
      correct: currentQuestion.correct,
      isCorrect,
      timeSpent,
      hintsUsed
    });

    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    onProgressUpdate(progress);
  };

  const checkAnswer = (userAnswer: any, correctAnswer: any, type: string): boolean => {
    switch (type) {
      case 'multiple_choice':
        return userAnswer === correctAnswer;
      case 'true_false':
        return userAnswer === correctAnswer;
      case 'short_answer':
        return userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
      default:
        return false;
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setCurrentAnswer(null);
    setShowHint(false);
    setHintsUsed(0);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      const nextQuestion = questions[currentQuestionIndex + 1];
      setTimeLeft(nextQuestion.timeLimit || 60);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    
    const totalPoints = answers.reduce((sum, answer, index) => {
      return sum + (answer.isCorrect ? questions[index].points : 0);
    }, 0);
    
    const maxPoints = questions.reduce((sum, question) => sum + question.points, 0);
    const score = totalPoints / maxPoints;
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    
    const result = {
      type: 'quiz_complete',
      score,
      points: totalPoints,
      maxPoints,
      correctAnswers,
      totalQuestions: questions.length,
      answers,
      averageTimePerQuestion: answers.reduce((sum, answer) => sum + answer.timeSpent, 0) / answers.length,
      totalHintsUsed: answers.reduce((sum, answer) => sum + answer.hintsUsed, 0),
      feedback: generateFeedback(score, correctAnswers, questions.length)
    };

    onComplete(result);
  };

  const generateFeedback = (score: number, correct: number, total: number): string => {
    const percentage = (correct / total) * 100;
    
    if (percentage === 100) {
      return `🎉 Perfektní! Odpověděl jsi správně na všech ${total} otázek. Tvé chápání fyziky je výborné!`;
    } else if (percentage >= 80) {
      return `👏 Skvělá práce! ${correct} z ${total} správných odpovědí. Jen drobné chyby, pokračuj v učení!`;
    } else if (percentage >= 60) {
      return `👍 Dobrý výkon! ${correct} z ${total} správných odpovědí. S trochou procvičování budeš ještě lepší!`;
    } else if (percentage >= 40) {
      return `💪 Děláš pokroky! ${correct} z ${total} správných odpovědí. Zkus si zopakovat látku a zkus to znovu.`;
    } else {
      return `🤔 Potřebuješ více procvičování. ${correct} z ${total} správných odpovědí. Neboj se ptát učitele na pomoc!`;
    }
  };

  const getCurrentQuestion = (): Question | null => {
    return questions[currentQuestionIndex] || null;
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
    
    onInteraction({
      type: 'hint_used',
      questionId: getCurrentQuestion()?.id,
      hintsUsed: hintsUsed + 1
    });
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
        <p className="text-gray-600">Připravuji personalizované otázky...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Nepodařilo se načíst otázky.</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kvíz dokončen!</h2>
        <p className="text-gray-600 mb-6">Výsledky se zpracovávají...</p>
        <div className="animate-pulse bg-gray-200 h-4 rounded mb-4"></div>
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Otázka {currentQuestionIndex + 1} z {questions.length}
            </span>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          {timeLeft !== null && (
            <div className={`flex items-center space-x-2 ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
              <span>⏰</span>
              <span className="font-mono font-medium">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            {currentQuestion.question}
          </h2>
          
          {/* Question Type Indicator */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {currentQuestion.type === 'multiple_choice' ? 'Výběr z možností' : 
               currentQuestion.type === 'true_false' ? 'Pravda/Nepravda' : 'Krátká odpověď'}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
              {currentQuestion.points} bodů
            </span>
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(index)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    currentAnswer === index 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${showExplanation ? 'cursor-not-allowed opacity-75' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div className="space-y-3">
              {['Pravda', 'Nepravda'].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(index === 0)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    currentAnswer === (index === 0)
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${showExplanation ? 'cursor-not-allowed opacity-75' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-medium ${
                      index === 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index === 0 ? '✓' : '✗'}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'short_answer' && (
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={showExplanation}
              placeholder="Napiš svou odpověď..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
              rows={3}
            />
          )}
        </div>

        {/* Hint */}
        {!showExplanation && (
          <div className="mb-6">
            {!showHint ? (
              <button
                onClick={handleShowHint}
                className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center space-x-1"
              >
                <span>💡</span>
                <span>Zobrazit nápovědu</span>
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-500">💡</span>
                  <p className="text-sm text-yellow-800">{currentQuestion.hint}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mb-6">
            <div className={`border rounded-lg p-4 ${
              answers[answers.length - 1]?.isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-2 mb-3">
                <span className="text-lg">
                  {answers[answers.length - 1]?.isCorrect ? '✅' : '❌'}
                </span>
                <div>
                  <p className={`font-medium ${
                    answers[answers.length - 1]?.isCorrect 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    {answers[answers.length - 1]?.isCorrect ? 'Správně!' : 'Nesprávně'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={currentAnswer === null || currentAnswer === undefined}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Potvrdit odpověď
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Další otázka' : 'Dokončit kvíz'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      {answers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Průběžné výsledky</h3>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>
              ✅ Správné: {answers.filter(a => a.isCorrect).length}
            </span>
            <span>
              ❌ Nesprávné: {answers.filter(a => !a.isCorrect).length}
            </span>
            <span>
              💡 Nápovědy: {answers.reduce((sum, a) => sum + a.hintsUsed, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};