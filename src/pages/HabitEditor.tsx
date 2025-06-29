import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Save, Target } from 'lucide-react';

const HabitEditor: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const { habits, addHabit, updateHabit } = useData();
  
  const habitId = searchParams.get('id');
  const existingHabit = habitId ? habits.find(habit => habit.id === habitId) : null;

  const [name, setName] = useState(existingHabit?.name || '');
  const [question, setQuestion] = useState(existingHabit?.question || '');
  const [color, setColor] = useState(existingHabit?.color || 'blue');

  const colors = [
    { name: 'Red', value: 'red', bg: 'bg-red-500' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
    { name: 'Green', value: 'green', bg: 'bg-green-500' },
    { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', bg: 'bg-pink-500' },
    { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500' },
    { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a habit name.');
      return;
    }

    if (!question.trim()) {
      alert('Please enter a question for tracking this habit.');
      return;
    }

    const habitData = {
      name: name.trim(),
      question: question.trim(),
      color,
    };

    if (existingHabit) {
      updateHabit(existingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    navigate('/habits');
  };

  const cardClasses = theme === 'light'
    ? 'bg-gradient-to-br from-gray-100/80 to-blue-50/80 backdrop-blur-md'
    : 'bg-gradient-to-br from-gray-800/80 to-red-900/80 backdrop-blur-md';

  const borderClasses = theme === 'light'
    ? 'border-gray-200'
    : 'border-gray-700';

  const textClasses = theme === 'light'
    ? 'text-black'
    : 'text-white';

  const secondaryTextClasses = theme === 'light'
    ? 'text-gray-700'
    : 'text-gray-300';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b ${borderClasses} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/habits')}
                className={`p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className={`text-xl font-semibold ${textClasses}`}>
                {existingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h1>
            </div>
            
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-lg flex items-center space-x-2 font-semibold"
            >
              <Save className="h-4 w-4" />
              <span>{existingHabit ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          <div className="p-8 space-y-6">
            {/* Habit Type Info */}
            <div className={`text-center p-6 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-lg`}>
              <Target className="h-8 w-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
              <h3 className={`font-medium ${textClasses} mb-2`}>Yes/No Habit</h3>
              <p className={`text-sm ${secondaryTextClasses}`}>
                Simple completion tracking - mark as done or not done each day
              </p>
            </div>

            {/* Name */}
            <div>
              <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="e.g., Exercise, Read, Meditate"
                required
              />
            </div>

            {/* Question */}
            <div>
              <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                Question *
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="e.g., Did you exercise today?"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className={`block text-sm font-medium ${secondaryTextClasses} mb-3`}>
                Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map(colorOption => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                      color === colorOption.value
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-900/50 backdrop-blur-sm'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${colorOption.bg}`}></div>
                    <span className={`text-sm font-medium ${textClasses}`}>
                      {colorOption.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className={`${cardClasses} rounded-lg p-4`}>
              <h4 className={`font-medium ${textClasses} mb-2`}>Preview</h4>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${colors.find(c => c.value === color)?.bg || 'bg-gray-500'}`}></div>
                <div>
                  <p className={`font-medium ${textClasses}`}>
                    {name || 'Habit Name'}
                  </p>
                  <p className={`text-sm ${secondaryTextClasses}`}>
                    {question || 'Tracking question'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitEditor;