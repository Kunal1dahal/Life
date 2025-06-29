import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, Check, Target, X } from 'lucide-react';

const Habits: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { habits, updateHabitEntry, updateHabit } = useData();
  const [selectedHabitForAnalytics, setSelectedHabitForAnalytics] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute to keep dates fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Generate last 7 days (oldest to newest, left to right) - REAL-TIME
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentTime); // Use currentTime instead of new Date()
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Get habit entry for a specific date
  const getHabitEntry = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.entries.find(entry => entry.date === date);
  };

  // Check if date is before habit creation
  const isDateBeforeHabitCreation = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return true;
    
    const habitCreationDate = new Date(habit.createdAt).toISOString().split('T')[0];
    return date < habitCreationDate;
  };

  // Get status symbol for habit entry
  const getStatusSymbol = (habit: any, date: string) => {
    // If date is before habit creation, don't show anything
    if (isDateBeforeHabitCreation(habit.id, date)) {
      return { symbol: '', color: 'text-transparent', bgColor: 'bg-transparent', disabled: true };
    }

    const entry = getHabitEntry(habit.id, date);
    
    if (!entry) {
      return { symbol: '?', color: 'text-gray-400', bgColor: 'bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm', disabled: false };
    }

    if (entry.completed) {
      return { symbol: '✅', color: 'text-green-600', bgColor: 'bg-green-100/80 dark:bg-green-900/50 backdrop-blur-sm', disabled: false };
    } else {
      return { symbol: '❌', color: 'text-red-600', bgColor: 'bg-red-100/80 dark:bg-red-900/50 backdrop-blur-sm', disabled: false };
    }
  };

  // Handle habit click with proper cycle: ? -> ❌ -> ✅ -> ?
  const handleHabitClick = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Don't allow marking dates before habit creation
    if (isDateBeforeHabitCreation(habitId, date)) {
      return;
    }

    const entry = getHabitEntry(habitId, date);
    
    if (!entry) {
      // ? -> ❌ (first click creates entry as not completed)
      updateHabitEntry(habitId, date, { completed: false });
    } else if (!entry.completed) {
      // ❌ -> ✅
      updateHabitEntry(habitId, date, { completed: true });
    } else {
      // ✅ -> ? (remove entry)
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const newEntries = habit.entries.filter(e => e.date !== date);
        updateHabit(habitId, { entries: newEntries });
      }
    }
  };

  // Calculate analytics for selected habit
  const selectedHabitAnalytics = useMemo(() => {
    if (!selectedHabitForAnalytics) return null;
    
    const habit = habits.find(h => h.id === selectedHabitForAnalytics);
    if (!habit) return null;

    const now = currentTime; // Use currentTime for real-time updates
    const creationDate = new Date(habit.createdAt);
    const today = now.toISOString().split('T')[0];
    const creationDateStr = creationDate.toISOString().split('T')[0];
    
    // FIXED: Calculate days between creation date and today (inclusive)
    const timeDiff = now.getTime() - creationDate.getTime();
    const totalDaysTracked = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include today

    // Get all entries
    const completedEntries = habit.entries.filter(entry => entry.completed);
    const missedEntries = habit.entries.filter(entry => !entry.completed);
    
    const totalDaysCompleted = completedEntries.length;
    const totalDaysMissed = missedEntries.length;

    // Overall completion and failure rates
    const overallCompletionRate = totalDaysTracked > 0 ? Math.round((totalDaysCompleted / totalDaysTracked) * 100) : 0;
    const overallFailureRate = totalDaysTracked > 0 ? Math.round((totalDaysMissed / totalDaysTracked) * 100) : 0;

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    
    // Sort completed entries by date
    const sortedCompletedDates = completedEntries
      .map(entry => entry.date)
      .sort();

    for (let i = 0; i < sortedCompletedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedCompletedDates[i - 1]);
        const currDate = new Date(sortedCompletedDates[i]);
        const diffDays = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // Calculate longest gap (consecutive missed days)
    let longestGap = 0;
    let currentGap = 0;
    
    // Check all days from creation to today for gaps
    for (let i = 0; i < totalDaysTracked; i++) {
      const checkDate = new Date(creationDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const entry = habit.entries.find(e => e.date === dateStr);
      
      if (!entry || !entry.completed) {
        currentGap++;
        longestGap = Math.max(longestGap, currentGap);
      } else {
        currentGap = 0;
      }
    }

    // Calculate this month vs previous month comparison
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month completions and days
    const currentMonthEntries = completedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const effectiveMonthStart = currentMonthStart > creationDate ? currentMonthStart : creationDate;
    const currentMonthDays = Math.floor((now.getTime() - effectiveMonthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentMonthRate = currentMonthDays > 0 ? (currentMonthEntries.length / currentMonthDays) * 100 : 0;

    // Last month completions and days
    const lastMonthEntries = completedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear;
    });

    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);
    const lastMonthDays = lastMonthStart >= creationDate ? Math.floor((lastMonthEnd.getTime() - lastMonthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const lastMonthRate = lastMonthDays > 0 ? (lastMonthEntries.length / lastMonthDays) * 100 : 0;

    const successRatioToPreviousMonth = Math.round(currentMonthRate - lastMonthRate);

    return {
      totalDaysTracked,
      totalDaysCompleted,
      totalDaysMissed,
      overallCompletionRate,
      overallFailureRate,
      longestStreak,
      longestGap,
      successRatioToPreviousMonth
    };
  }, [selectedHabitForAnalytics, habits, currentTime]); // Added currentTime dependency

  // Calculate stats - REMOVED completion rate and total streaks
  const totalHabits = habits.length;
  const today = currentTime.toISOString().split('T')[0]; // Use currentTime
  
  const completedToday = habits.filter(habit => {
    const entry = getHabitEntry(habit.id, today);
    return entry?.completed;
  }).length;

  const getHabitColor = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      orange: 'bg-orange-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const openHabitEditor = (habitId?: string) => {
    if (habitId) {
      navigate(`/habit-editor?id=${habitId}`);
    } else {
      navigate('/habit-editor');
    }
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

  // Habits button colors - soft violet/lavender in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${textClasses}`}>Habits</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => openHabitEditor()}
            className={`px-4 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg flex items-center space-x-2`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Stats Overview - REMOVED completion rate and total streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${cardClasses} rounded-xl p-6 shadow-lg border ${borderClasses}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${secondaryTextClasses}`}>Total Habits</p>
              <p className={`text-3xl font-bold ${
                theme === 'light' ? 'text-purple-600' : 'text-purple-400'
              }`}>{totalHabits}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className={`${cardClasses} rounded-xl p-6 shadow-lg border ${borderClasses}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${secondaryTextClasses}`}>Completed Today</p>
              <p className={`text-3xl font-bold ${
                theme === 'light' ? 'text-green-600' : 'text-green-400'
              }`}>{completedToday}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Habits List */}
      {habits.length > 0 ? (
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          {/* Header with dates - FIXED ALIGNMENT */}
          <div className={`grid grid-cols-12 gap-4 p-6 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm border-b ${borderClasses}`}>
            <div className={`col-span-5 font-medium ${textClasses}`}>Habit</div>
            <div className="col-span-7 grid grid-cols-7 gap-2">
              {last7Days.map(day => (
                <div key={day.date} className="text-center">
                  <div className={`text-xs font-medium ${secondaryTextClasses}`}>{day.dayName}</div>
                  <div className={`text-sm ${day.isToday ? 'font-bold text-purple-600 dark:text-purple-400' : textClasses}`}>
                    {day.dayNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habits - FIXED ALIGNMENT */}
          <div className={`divide-y divide-gray-100 dark:divide-gray-700`}>
            {habits.map(habit => (
              <div key={habit.id} className={`grid grid-cols-12 gap-4 p-6 hover:bg-gray-50/30 dark:hover:bg-gray-700/30 backdrop-blur-sm transition-colors duration-200`}>
                <div className="col-span-5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getHabitColor(habit.color)}`}></div>
                    <div className="flex-1">
                      <button
                        onClick={() => setSelectedHabitForAnalytics(habit.id)}
                        className={`text-left hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200`}
                      >
                        <h3 className={`font-medium ${textClasses}`}>{habit.name}</h3>
                        <p className={`text-sm ${secondaryTextClasses}`}>{habit.question}</p>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* FIXED: Proper alignment with header dates */}
                <div className="col-span-7 grid grid-cols-7 gap-2">
                  {last7Days.map(day => {
                    const status = getStatusSymbol(habit, day.date);
                    
                    return (
                      <div key={day.date} className="flex justify-center">
                        <button
                          onClick={() => !status.disabled && handleHabitClick(habit.id, day.date)}
                          disabled={status.disabled}
                          className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium ${
                            status.disabled 
                              ? 'cursor-not-allowed' 
                              : 'hover:scale-110 cursor-pointer'
                          } ${status.bgColor} ${status.color}`}
                          title={status.disabled ? 'Habit not created yet' : `${day.dayName} ${day.dayNumber} - Click to update`}
                        >
                          {status.symbol}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Target className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold ${textClasses} mb-2`}>
            No habits yet
          </h3>
          <p className={`${secondaryTextClasses} mb-6`}>
            Start building better habits by adding your first one.
          </p>
          <button
            onClick={() => openHabitEditor()}
            className={`px-6 py-3 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Add First Habit
          </button>
        </div>
      )}

      {/* Analytics Pop-up Modal */}
      {selectedHabitForAnalytics && selectedHabitAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-xl shadow-2xl border ${borderClasses} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${borderClasses}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getHabitColor(habits.find(h => h.id === selectedHabitForAnalytics)?.color || 'blue')}`}></div>
                <h2 className={`text-xl font-semibold ${textClasses}`}>
                  {habits.find(h => h.id === selectedHabitForAnalytics)?.name} Analytics
                </h2>
              </div>
              <button
                onClick={() => setSelectedHabitForAnalytics(null)}
                className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Analytics Content */}
            <div className="p-6 space-y-6">
              {/* Row 1: Total days tracked and completed */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {selectedHabitAnalytics.totalDaysTracked}
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Total days tracked</p>
                </div>
                <div className="text-center p-4 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {selectedHabitAnalytics.totalDaysCompleted}
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Total days completed</p>
                </div>
              </div>

              {/* Row 2: Total days missed and completion rate */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {selectedHabitAnalytics.totalDaysMissed}
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Total days missed</p>
                </div>
                <div className="text-center p-4 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {selectedHabitAnalytics.overallCompletionRate}%
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Overall completion rate</p>
                </div>
              </div>

              {/* Row 3: Failure rate and longest streak */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-orange-50/80 dark:bg-orange-900/20 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {selectedHabitAnalytics.overallFailureRate}%
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Overall failure rate</p>
                </div>
                <div className="text-center p-4 bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                    {selectedHabitAnalytics.longestStreak}
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Longest streak</p>
                </div>
              </div>

              {/* Row 4: Longest gap and success ratio */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg">
                  <div className={`text-3xl font-bold ${secondaryTextClasses} mb-1`}>
                    {selectedHabitAnalytics.longestGap}
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Longest gap</p>
                </div>
                <div className="text-center p-4 bg-indigo-50/80 dark:bg-indigo-900/20 backdrop-blur-sm rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${
                    selectedHabitAnalytics.successRatioToPreviousMonth > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : selectedHabitAnalytics.successRatioToPreviousMonth < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {selectedHabitAnalytics.successRatioToPreviousMonth > 0 ? '+' : ''}{selectedHabitAnalytics.successRatioToPreviousMonth}%
                  </div>
                  <p className={`text-sm ${secondaryTextClasses}`}>Success ratio to previous month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;