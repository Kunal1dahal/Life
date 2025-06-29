import React from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, 
  Lightbulb, 
  BookOpen, 
  Camera, 
  Calendar,
  Check,
  X,
  Target,
  TrendingUp,
  Eye,
  ChevronRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { ideas, journalEntries, habits, clickMessages, journeyNodes, updateJourneyNode } = useData();

  // Get active journey task (first pending task)
  const activeJourneyTask = journeyNodes
    .filter(node => node.status === 'pending')
    .sort((a, b) => new Date(b.currentDate).getTime() - new Date(a.currentDate).getTime())[0];

  // Get latest click (most recent image/video)
  const latestClick = clickMessages
    .filter(msg => msg.type === 'image' || msg.type === 'video')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Get latest journal entry
  const latestJournal = journalEntries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Get latest idea
  const latestIdea = ideas
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // Calculate habit stats
  const today = new Date().toISOString().split('T')[0];
  const completedHabitsToday = habits.filter(habit => 
    habit.entries.some(entry => entry.date === today && entry.completed)
  ).length;
  const totalHabits = habits.length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;

  // Handle journey task actions
  const handleJourneyAction = (action: 'completed' | 'failed') => {
    if (!activeJourneyTask) return;

    if (action === 'completed') {
      updateJourneyNode(activeJourneyTask.id, {
        status: 'completed',
        completedAt: new Date(),
      });
    } else {
      // Shift to next day
      const nextDay = new Date(activeJourneyTask.currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      updateJourneyNode(activeJourneyTask.id, {
        currentDate: nextDay,
      });
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
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

  // Dashboard button colors - soft blue/teal in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  return (
    <div className="space-y-8">
      {/* Dashboard Title */}
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-2 ${textClasses}`}>
          Dashboard
        </h1>
        <p className={`text-lg ${secondaryTextClasses}`}>
          Your productivity hub - everything at a glance
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/projects')}
          className={`p-4 ${cardClasses} rounded-xl shadow-lg border ${borderClasses} hover:shadow-xl transition-all duration-200 hover:scale-105 group`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
              theme === 'light' 
                ? 'bg-blue-100/80 group-hover:bg-blue-200/80' 
                : 'bg-blue-900/50 group-hover:bg-blue-900/70'
            }`}>
              <Lightbulb className={`h-6 w-6 ${
                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${textClasses}`}>Add Idea</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/journal-editor')}
          className={`p-4 ${cardClasses} rounded-xl shadow-lg border ${borderClasses} hover:shadow-xl transition-all duration-200 hover:scale-105 group`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
              theme === 'light' 
                ? 'bg-green-100/80 group-hover:bg-green-200/80' 
                : 'bg-green-900/50 group-hover:bg-green-900/70'
            }`}>
              <BookOpen className={`h-6 w-6 ${
                theme === 'light' ? 'text-green-600' : 'text-green-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${textClasses}`}>Add Journal</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/clicks')}
          className={`p-4 ${cardClasses} rounded-xl shadow-lg border ${borderClasses} hover:shadow-xl transition-all duration-200 hover:scale-105 group`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
              theme === 'light' 
                ? 'bg-orange-100/80 group-hover:bg-orange-200/80' 
                : 'bg-orange-900/50 group-hover:bg-orange-900/70'
            }`}>
              <Camera className={`h-6 w-6 ${
                theme === 'light' ? 'text-orange-600' : 'text-orange-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${textClasses}`}>Add Image</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/journey')}
          className={`p-4 ${cardClasses} rounded-xl shadow-lg border ${borderClasses} hover:shadow-xl transition-all duration-200 hover:scale-105 group`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
              theme === 'light' 
                ? 'bg-purple-100/80 group-hover:bg-purple-200/80' 
                : 'bg-purple-900/50 group-hover:bg-purple-900/70'
            }`}>
              <Calendar className={`h-6 w-6 ${
                theme === 'light' ? 'text-purple-600' : 'text-purple-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${textClasses}`}>Add Journey Task</span>
          </div>
        </button>
      </div>

      {/* Active Journey */}
      {activeJourneyTask ? (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${textClasses} flex items-center space-x-2`}>
              <Calendar className={`h-5 w-5 ${
                theme === 'light' ? 'text-purple-600' : 'text-purple-400'
              }`} />
              <span>Active Journey</span>
            </h2>
            <span className={`text-sm ${secondaryTextClasses}`}>
              {formatDate(activeJourneyTask.currentDate)}
            </span>
          </div>
          
          <div className="mb-4">
            <h3 className={`text-lg font-medium ${textClasses} mb-2`}>
              {activeJourneyTask.title}
            </h3>
            <p className={`${secondaryTextClasses} leading-relaxed`}>
              {activeJourneyTask.question}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleJourneyAction('completed')}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>✅ Completed</span>
            </button>
            
            <button
              onClick={() => handleJourneyAction('failed')}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>🔄 Try Tomorrow</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6 text-center`}>
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className={`text-lg font-medium ${textClasses} mb-2`}>No Active Journey Task</h3>
          <p className={`${secondaryTextClasses} mb-4`}>Start your journey by creating your first task</p>
          <button
            onClick={() => navigate('/journey')}
            className={`px-4 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
          >
            Create Journey Task
          </button>
        </div>
      )}

      {/* Latest Click */}
      {latestClick ? (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${textClasses} flex items-center space-x-2`}>
                <Camera className={`h-5 w-5 ${
                  theme === 'light' ? 'text-orange-600' : 'text-orange-400'
                }`} />
                <span>Latest Click</span>
              </h2>
              <button
                onClick={() => navigate('/clicks')}
                className={`${
                  theme === 'light' ? 'text-orange-600 hover:text-orange-700' : 'text-orange-400 hover:text-orange-300'
                } flex items-center space-x-1 text-sm`}
              >
                <span>View All</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="relative cursor-pointer" onClick={() => navigate('/clicks')}>
            {latestClick.type === 'image' ? (
              <img 
                src={latestClick.mediaUrl} 
                alt="Latest click"
                className="w-full h-64 object-cover hover:opacity-90 transition-opacity duration-200"
              />
            ) : (
              <video 
                src={latestClick.mediaUrl} 
                className="w-full h-64 object-cover"
                poster=""
              />
            )}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              Top Click
            </div>
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
              {formatDate(latestClick.createdAt)}
            </div>
          </div>
        </div>
      ) : (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6 text-center`}>
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className={`text-lg font-medium ${textClasses} mb-2`}>No Images Yet</h3>
          <p className={`${secondaryTextClasses} mb-4`}>Start capturing your visual memories</p>
          <button
            onClick={() => navigate('/clicks')}
            className={`px-4 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
          >
            Add First Image
          </button>
        </div>
      )}

      {/* Latest Journal */}
      {latestJournal ? (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${textClasses} flex items-center space-x-2`}>
              <BookOpen className={`h-5 w-5 ${
                theme === 'light' ? 'text-green-600' : 'text-green-400'
              }`} />
              <span>Latest Journal</span>
            </h2>
            <button
              onClick={() => navigate('/journal')}
              className={`${
                theme === 'light' ? 'text-green-600 hover:text-green-700' : 'text-green-400 hover:text-green-300'
              } flex items-center space-x-1 text-sm`}
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div 
            className={`cursor-pointer rounded-lg p-4 -m-4 transition-colors duration-200 ${
              theme === 'light' ? 'hover:bg-gray-50/50' : 'hover:bg-gray-700/50'
            }`}
            onClick={() => navigate(`/journal-viewer?id=${latestJournal.id}`)}
          >
            <div className="flex items-start space-x-3 mb-3">
              {latestJournal.mood && (
                <span className="text-2xl">{latestJournal.mood}</span>
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${textClasses} mb-2`}>
                  {latestJournal.title}
                </h3>
                <div 
                  className={`${secondaryTextClasses} leading-relaxed line-clamp-3`}
                  dangerouslySetInnerHTML={{ 
                    __html: latestJournal.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                  }}
                />
              </div>
            </div>
            <div className={`flex items-center justify-between text-sm ${secondaryTextClasses}`}>
              <span>{formatDate(latestJournal.createdAt)}</span>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>Read more</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6 text-center`}>
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className={`text-lg font-medium ${textClasses} mb-2`}>No Journal Entries</h3>
          <p className={`${secondaryTextClasses} mb-4`}>Start documenting your thoughts and experiences</p>
          <button
            onClick={() => navigate('/journal-editor')}
            className={`px-4 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
          >
            Write First Entry
          </button>
        </div>
      )}

      {/* Latest Idea */}
      {latestIdea ? (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${textClasses} flex items-center space-x-2`}>
              <Lightbulb className={`h-5 w-5 ${
                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <span>Latest Idea</span>
            </h2>
            <button
              onClick={() => navigate('/projects')}
              className={`${
                theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
              } flex items-center space-x-1 text-sm`}
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div 
            className={`cursor-pointer rounded-lg p-4 -m-4 transition-colors duration-200 ${
              theme === 'light' ? 'hover:bg-gray-50/50' : 'hover:bg-gray-700/50'
            }`}
            onClick={() => navigate(`/idea-viewer?id=${latestIdea.id}`)}
          >
            <h3 className={`text-lg font-medium ${textClasses} mb-2`}>
              {latestIdea.title}
            </h3>
            <div 
              className={`${secondaryTextClasses} leading-relaxed line-clamp-3 mb-3`}
              dangerouslySetInnerHTML={{ 
                __html: latestIdea.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
              }}
            />
            <div className={`flex items-center justify-between text-sm ${secondaryTextClasses}`}>
              <span>{formatDate(latestIdea.createdAt)}</span>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>Read more</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6 text-center`}>
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className={`text-lg font-medium ${textClasses} mb-2`}>No Ideas Yet</h3>
          <p className={`${secondaryTextClasses} mb-4`}>Start capturing your creative thoughts and projects</p>
          <button
            onClick={() => navigate('/projects')}
            className={`px-4 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
          >
            Add First Idea
          </button>
        </div>
      )}

      {/* Active Habit Summary */}
      <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${textClasses} flex items-center space-x-2`}>
            <Target className={`h-5 w-5 ${
              theme === 'light' ? 'text-purple-600' : 'text-purple-400'
            }`} />
            <span>Active Habits</span>
          </h2>
          <button
            onClick={() => navigate('/habits')}
            className={`${
              theme === 'light' ? 'text-purple-600 hover:text-purple-700' : 'text-purple-400 hover:text-purple-300'
            } flex items-center space-x-1 text-sm`}
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {totalHabits > 0 ? (
          <div className="space-y-4">
            {/* Progress Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - habitCompletionRate / 100)}`}
                    className="text-purple-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${textClasses}`}>
                    {habitCompletionRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-purple-600' : 'text-purple-400'
                }`}>
                  {totalHabits}
                </div>
                <div className={`text-sm ${secondaryTextClasses}`}>Total</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-green-600' : 'text-green-400'
                }`}>
                  {completedHabitsToday}
                </div>
                <div className={`text-sm ${secondaryTextClasses}`}>Completed</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-orange-600' : 'text-orange-400'
                }`}>
                  {totalHabits - completedHabitsToday}
                </div>
                <div className={`text-sm ${secondaryTextClasses}`}>Remaining</div>
              </div>
            </div>

            {/* Summary Text */}
            <div className="text-center">
              <p className={secondaryTextClasses}>
                <span className={`font-medium ${textClasses}`}>
                  {completedHabitsToday} of {totalHabits}
                </span> habits completed today
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className={`text-lg font-medium ${textClasses} mb-2`}>No Habits Yet</h3>
            <p className={`${secondaryTextClasses} mb-4`}>Start building better habits today</p>
            <button
              onClick={() => navigate('/habits')}
              className={`px-4 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
            >
              Add First Habit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;