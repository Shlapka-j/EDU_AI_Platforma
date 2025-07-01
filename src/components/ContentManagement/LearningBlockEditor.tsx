import React, { useState, useEffect } from 'react';
import { LearningBlock, Activity, DifficultyLevel, ActivityType } from '../../types';

interface LearningBlockEditorProps {
  block?: LearningBlock;
  subjectId: string;
  onSave: (block: LearningBlock) => void;
  onCancel: () => void;
}

const LearningBlockEditor: React.FC<LearningBlockEditorProps> = ({
  block,
  subjectId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: block?.title || '',
    description: block?.description || '',
    estimatedDuration: block?.estimatedDuration || 60,
    difficulty: block?.difficulty || DifficultyLevel.MEDIUM,
    learningObjectives: block?.learningObjectives || [''],
    activities: block?.activities || []
  });

  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

  const addLearningObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }));
  };

  const generateAIScenario = async () => {
    setIsGeneratingScenario(true);
    try {
      const response = await fetch('/api/ai/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          subjectId,
          title: formData.title,
          description: formData.description,
          objectives: formData.learningObjectives.filter(obj => obj.trim())
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiSuggestions(result.data);
        setShowAIAnalysis(true);
      }
    } catch (error) {
      console.error('Chyba při generování AI scénáře:', error);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const applyAISuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        activities: aiSuggestions.activities || [],
        estimatedDuration: aiSuggestions.estimatedDuration || prev.estimatedDuration,
        difficulty: aiSuggestions.difficulty || prev.difficulty
      }));
      setShowAIAnalysis(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const blockData: LearningBlock = {
      id: block?.id || '',
      subjectId,
      title: formData.title,
      description: formData.description,
      estimatedDuration: formData.estimatedDuration,
      difficulty: formData.difficulty,
      learningObjectives: formData.learningObjectives.filter(obj => obj.trim()),
      materials: block?.materials || [],
      activities: formData.activities,
      order: block?.order || 0
    };

    onSave(blockData);
  };

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY: return 'text-green-600 bg-green-100';
      case DifficultyLevel.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case DifficultyLevel.HARD: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {block ? 'Upravit učební blok' : 'Vytvořit nový učební blok'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Základní informace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Název bloku *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="např. Gravitace a padání těles"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odhadovaná doba (minuty) *
              </label>
              <input
                type="number"
                required
                min="15"
                max="180"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Popis bloku
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Podrobný popis toho, co se žáci naučí..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obtížnost
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
            >
              <option value={DifficultyLevel.EASY}>Lehká</option>
              <option value={DifficultyLevel.MEDIUM}>Střední</option>
              <option value={DifficultyLevel.HARD}>Těžká</option>
            </select>
          </div>

          {/* Učební cíle */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Učební cíle
              </label>
              <button
                type="button"
                onClick={addLearningObjective}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Přidat cíl
              </button>
            </div>
            <div className="space-y-2">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={objective}
                    onChange={(e) => updateLearningObjective(index, e.target.value)}
                    placeholder="např. Pochopit princip gravitace"
                  />
                  {formData.learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearningObjective(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Generování scénáře */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">🤖 AI Asistent</h3>
              <button
                type="button"
                onClick={generateAIScenario}
                disabled={isGeneratingScenario || !formData.title}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isGeneratingScenario ? 'Generuji...' : 'Generovat herní scénář'}
              </button>
            </div>

            {showAIAnalysis && aiSuggestions && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-purple-900 mb-3">AI návrh herního scénáře</h4>
                <div className="space-y-2 text-sm text-purple-800">
                  <p><strong>Doporučená obtížnost:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getDifficultyColor(aiSuggestions.difficulty)}`}>
                      {aiSuggestions.difficulty}
                    </span>
                  </p>
                  <p><strong>Odhadovaná doba:</strong> {aiSuggestions.estimatedDuration} minut</p>
                  <p><strong>Navržené aktivity:</strong> {aiSuggestions.activities?.length || 0}</p>
                  <div className="mt-3">
                    <p><strong>Herní scénář:</strong></p>
                    <p className="italic">{aiSuggestions.scenario}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    type="button"
                    onClick={applyAISuggestions}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Použít návrh
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAIAnalysis(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Zavřít
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Aktivity preview */}
          {formData.activities.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Navržené aktivity ({formData.activities.length})
              </h3>
              <div className="space-y-2">
                {formData.activities.map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex space-x-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {activity.type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {activity.points} bodů
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Akční tlačítka */}
          <div className="flex space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              {block ? 'Uložit změny' : 'Vytvořit blok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearningBlockEditor;