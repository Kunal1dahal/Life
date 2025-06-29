import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Edit3, TrendingUp, Calendar, Award } from 'lucide-react';

const HabitDetails: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const { habits } = useData();
  
  const habitId = searchParams.get('id');
  const habit = habitId ? habits.find(h => h.id === habitId) : null;

  // Calculate analytics for the 3 sections only
  const analytics = useMemo(() => {
    if (!habit) return null;

    const now = new Date();
    const creationDate = new Date(habit.createdAt);
    const today = now.toISOString().split('T')[0];
    
    // Helper function to get days between dates (inclusive)
    const getDaysBetween = (start: Date, end: Date) => {
      const diffTime = end.getTime() - start.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    // Get all completed entries
    const completedEntries = habit.entries.filter(entry => entry.completed);
    const totalCompletions = completedEntries.length;

    // Calculate total days since creation (including today)
    const totalDaysSinceCreation = getDaysBetween(creationDate, now);

    // 1️⃣ OVERVIEW CALCULATIONS
    const overallScore = totalDaysSinceCreation > 0 ? Math.round((totalCompletions / totalDaysSinceCreation) * 100) : 0;

    // Month calculations
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
    const currentMonthDays = getDaysBetween(effectiveMonthStart, now);
    const currentMonthRate = currentMonthDays > 0 ? (currentMonthEntries.length / currentMonthDays) * 100 : 0;

    // Last month completions and days
    const lastMonthEntries = completedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear;
    });

    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);
    const lastMonthDays = lastMonthStart >= creationDate ? getDaysBetween(lastMonthStart, lastMonthEnd) : 0;
    const lastMonthRate = lastMonthDays > 0 ? (lastMonthEntries.length / lastMonthDays) * 100 : 0;

    const monthChange = Math.round(currentMonthRate - lastMonthRate);

    // Year calculations
    const currentYearEntries = completedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear;
    });

    const currentYearStart = new Date(currentYear, 0, 1);
    const effectiveYearStart = currentYearStart > creationDate ? currentYearStart : creationDate;
    const currentYearDays = getDaysBetween(effectiveYearStart, now);
    const currentYearRate = currentYearDays > 0 ? (currentYearEntries.length / currentYearDays) * 100 : 0;

    const lastYear = currentYear - 1;
    const lastYearEntries = completedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === lastYear;
    });

    const lastYearStart = new Date(lastYear, 0, 1);
    const lastYearEnd = new Date(lastYear, 11, 31);
    const lastYearDays = lastYearStart >= creationDate ? getDaysBetween(lastYearStart, lastYearEnd) : 0;
    const lastYearRate = lastYearDays > 0 ? (lastYearEntries.length / lastYearDays) * 100 : 0;

    const yearChange = Math.round(currentYearRate - lastYearRate);

    // 2️⃣ WEEKLY STREAK COUNTS - HISTOGRAM STYLE
    const weeklyStreaks = [];
    const weeksSinceCreation = Math.ceil(totalDaysSinceCreation / 7);
    
    for (let week = 0; week < weeksSinceCreation; week++) {
      const weekStart = new Date(creationDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > now) weekEnd.setTime(now.getTime());
      
      // Calculate streak for this week
      let weekStreak = 0;
      let currentWeekStreak = 0;
      
      for (let day = 0; day < 7; day++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(checkDate.getDate() + day);
        
        if (checkDate > now) break;
        
        const dateStr = checkDate.toISOString().split('T')[0];
        const entry = habit.entries.find(e => e.date === dateStr);
        
        if (entry?.completed) {
          currentWeekStreak++;
          weekStreak = Math.max(weekStreak, currentWeekStreak);
        } else {
          currentWeekStreak = 0;
        }
      }
      
      weeklyStreaks.push({
        week: week + 1,
        streak: weekStreak,
        startDate: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        endDate: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // 3️⃣ FULL CALENDAR HEATMAP - From creation date to current date
    const calendarData = [];
    const monthsData = [];
    let currentMonthData = null;
    
    // Generate all days from creation to now
    for (let i = 0; i < totalDaysSinceCreation; i++) {
      const date = new Date(creationDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = habit.entries.find(e => e.date === dateStr);
      
      const dayData = {
        date: dateStr,
        completed: entry?.completed || false,
        dayOfWeek: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
        dayOfMonth: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        fullMonth: date.getMonth(),
        fullYear: date.getFullYear()
      };
      
      // Group by month
      const monthKey = `${dayData.fullYear}-${dayData.fullMonth}`;
      if (!currentMonthData || currentMonthData.key !== monthKey) {
        if (currentMonthData) {
          monthsData.push(currentMonthData);
        }
        currentMonthData = {
          key: monthKey,
          month: dayData.month,
          year: dayData.year,
          days: []
        };
      }
      
      currentMonthData.days.push(dayData);
      calendarData.push(dayData);
    }
    
    // Add the last month
    if (currentMonthData) {
      monthsData.push(currentMonthData);
    }

    // Organize calendar into weeks for proper display
    const calendarWeeks = [];
    monthsData.forEach(monthData => {
      const monthWeeks = [];
      let currentWeek = [];
      
      // Add empty cells for days before the first day of the month
      const firstDay = monthData.days[0];
      const startDayOfWeek = firstDay.dayOfWeek;
      
      // Fill empty cells at the beginning (Monday = 1, Sunday = 0)
      const mondayStartOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
      for (let i = 0; i < mondayStartOffset; i++) {
        currentWeek.push(null);
      }
      
      // Add all days of the month
      monthData.days.forEach(day => {
        currentWeek.push(day);
        
        // If it's Sunday or we have 7 days, complete the week
        if (currentWeek.length === 7) {
          monthWeeks.push([...currentWeek]);
          currentWeek = [];
        }
      });
      
      // Fill the last week if needed
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        monthWeeks.push(currentWeek);
      }
      
      calendarWeeks.push({
        month: monthData.month,
        year: monthData.year,
        weeks: monthWeeks
      });
    });

    // Current streak calculation
    let currentStreak = 0;
    const todayEntry = habit.entries.find(e => e.date === today);
    if (todayEntry?.completed) {
      currentStreak = 1;
      for (let i = 1; i < totalDaysSinceCreation; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const entry = habit.entries.find(e => e.date === dateStr);
        
        if (entry?.completed) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      // Overview
      overallScore,
      monthChange,
      yearChange,
      totalCompletions,
      currentStreak,
      
      // Weekly streaks
      weeklyStreaks,
      
      // Calendar
      calendarWeeks
    };
  }, [habit]);

  if (!habit || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} mb-4`}>Habit Not Found</h2>
          <button
            onClick={() => navigate('/habits')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-lg"
          >
            Back to Habits
          </button>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getHabitColor(habit.color)}`}></div>
                <h1 className={`text-xl font-semibold ${textClasses}`}>
                  {habit.name}
                </h1>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/habit-editor?id=${habit.id}`)}
              className={`p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              title="Edit habit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Habit Question */}
        <div className="text-center">
          <h2 className={`text-2xl font-medium ${secondaryTextClasses} mb-2`}>
            {habit.question}
          </h2>
          <div className={`flex items-center justify-center space-x-4 text-sm ${secondaryTextClasses}`}>
            <span>📅 Every day</span>
            <span>🔔 Off</span>
          </div>
        </div>

        {/* 1️⃣ Overview */}
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-8`}>
          <h2 className={`text-2xl font-bold ${textClasses} mb-6`}>Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Score Circle */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
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
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - analytics.overallScore / 100)}`}
                    className="text-purple-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${textClasses}`}>
                    {analytics.overallScore}%
                  </span>
                </div>
              </div>
              <p className={`text-sm ${secondaryTextClasses}`}>Score</p>
            </div>

            {/* Month Change */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${textClasses} mb-1`}>
                {analytics.monthChange > 0 ? '+' : ''}{analytics.monthChange}%
              </div>
              <p className={`text-sm ${secondaryTextClasses}`}>Month</p>
            </div>

            {/* Year Change */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${textClasses} mb-1`}>
                {analytics.yearChange > 0 ? '+' : ''}{analytics.yearChange}%
              </div>
              <p className={`text-sm ${secondaryTextClasses}`}>Year</p>
            </div>

            {/* Total Completions */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${textClasses} mb-1`}>
                {analytics.totalCompletions}
              </div>
              <p className={`text-sm ${secondaryTextClasses}`}>Total</p>
            </div>

            {/* Current Streak */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {analytics.currentStreak}
              </div>
              <p className={`text-sm ${secondaryTextClasses}`}>Current Streak</p>
            </div>
          </div>
        </div>

        {/* 2️⃣ Weekly Streak Histogram */}
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-8`}>
          <h2 className={`text-2xl font-bold ${textClasses} mb-6`}>Weekly Streaks</h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-full h-64 flex items-end justify-start space-x-1" style={{ minWidth: `${analytics.weeklyStreaks.length * 60}px` }}>
              {analytics.weeklyStreaks.map((week, index) => {
                const maxStreak = Math.max(...analytics.weeklyStreaks.map(w => w.streak), 1);
                const height = week.streak > 0 ? (week.streak / maxStreak) * 200 : 4;
                
                return (
                  <div key={index} className="flex flex-col items-center" style={{ minWidth: '50px' }}>
                    <div className="flex-1 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t relative group transition-all duration-300 hover:from-purple-700 hover:to-purple-500"
                        style={{ height: `${height}px`, minHeight: '4px' }}
                      >
                        {/* Show streak count on top of bar */}
                        {week.streak > 0 && (
                          <span className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold ${textClasses} bg-white dark:bg-gray-800 px-1 rounded shadow`}>
                            {week.streak}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`text-xs ${secondaryTextClasses} mt-3 text-center`}>
                      <div className="font-medium">W{week.week}</div>
                      <div className={`text-xs ${secondaryTextClasses}`}>
                        {week.startDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3️⃣ Full Calendar Heatmap */}
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-8`}>
          <h2 className={`text-2xl font-bold ${textClasses} mb-6`}>Calendar</h2>
          
          <div className="space-y-8">
            {analytics.calendarWeeks.map((monthData, monthIndex) => (
              <div key={monthIndex} className="space-y-4">
                {/* Month header */}
                <h3 className={`text-lg font-semibold ${textClasses}`}>
                  {monthData.month} {monthData.year}
                </h3>
                
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className={`text-center text-xs font-medium ${secondaryTextClasses} p-1`}>
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid for this month */}
                <div className="space-y-1">
                  {monthData.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110 ${
                            day
                              ? day.completed
                                ? 'bg-purple-500 text-white shadow-lg hover:bg-purple-600'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                              : 'bg-transparent'
                          }`}
                          title={day ? `${day.date}: ${day.completed ? 'Completed' : 'Not completed'}` : ''}
                        >
                          {day?.dayOfMonth}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className={`flex items-center space-x-4 text-sm ${secondaryTextClasses}`}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <span>Not completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitDetails;