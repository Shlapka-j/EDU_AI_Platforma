import React from 'react';
import { GameStats, Achievement } from '../../types';

interface StudentDashboardProps {
  stats: GameStats;
  recentAchievements: Achievement[];
  currentActivity?: {
    title: string;
    progress: number;
    timeRemaining?: number;
  };
  onContinueLearning: () => void;
  onViewProgress: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  stats,
  recentAchievements,
  currentActivity,
  onContinueLearning,
  onViewProgress
}) => {
  const progressToNextLevel = ((stats.totalXP % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Vítej zpět! 👋
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Level</p>
                <p className="text-2xl font-bold text-primary-900">{stats.level}</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
            <div className="mt-2">
              <div className="bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p className="text-xs text-primary-600 mt-1">
                {Math.round(progressToNextLevel)}% do dalšího levelu
              </p>
            </div>
          </div>

          <div className="bg-gamification-gold/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">XP Body</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.totalXP}</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Série</p>
                <p className="text-2xl font-bold text-green-900">{stats.streak} dní</p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>
        </div>
      </div>

      {currentActivity && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aktuální aktivita
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900">{currentActivity.title}</p>
              {currentActivity.timeRemaining && (
                <p className="text-sm text-gray-500">
                  Zbývá: {Math.round(currentActivity.timeRemaining / 60)} minut
                </p>
              )}
            </div>
            <button
              onClick={onContinueLearning}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Pokračovat
            </button>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${currentActivity.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {Math.round(currentActivity.progress)}% dokončeno
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nedávné úspěchy 🏆
          </h3>
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gamification-gold/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">🏅</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{achievement.name}</p>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Zatím žádné úspěchy. Začni se učit!</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistiky učení 📊
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Dokončené aktivity:</span>
              <span className="font-semibold">{stats.completedActivities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Celkový čas:</span>
              <span className="font-semibold">
                {Math.round(stats.totalTimeSpent / 3600)} hodin
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Porozumění fyzice:</span>
              <span className="font-semibold">
                {Math.round(stats.physicsUnderstandingLevel)}%
              </span>
            </div>
            <button
              onClick={onViewProgress}
              className="w-full mt-4 px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Zobrazit detailní pokrok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;