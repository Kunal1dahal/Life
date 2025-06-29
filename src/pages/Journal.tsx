import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, BookOpen, Eye } from 'lucide-react';

const Journal: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { journalEntries } = useData();

  // Group entries by date
  const groupedEntries = journalEntries.reduce((groups, entry) => {
    const date = new Date(entry.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof journalEntries>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const openJournalEditor = (entryId?: string) => {
    if (entryId) {
      navigate(`/journal-viewer?id=${entryId}`);
    } else {
      navigate('/journal-editor');
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

  // Journal button colors - keep green in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${textClasses}`}>Journal</h1>
        <button
          onClick={() => openJournalEditor()}
          className={`px-6 py-3 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg font-semibold`}
        >
          New Entry
        </button>
      </div>

      {/* Journal Entries */}
      <div className="space-y-8">
        {Object.keys(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, entries]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <h2 className={`text-lg font-semibold ${textClasses}`}>
                    {formatDate(date)}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>
                
                <div className="space-y-4">
                  {entries.map(entry => (
                    <div key={entry.id} className={`${cardClasses} rounded-xl p-6 shadow-lg border ${borderClasses} hover:shadow-xl transition-all duration-300`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {entry.mood && (
                            <span className="text-2xl">{entry.mood}</span>
                          )}
                          <div>
                            <h3 className={`text-xl font-semibold ${textClasses}`}>
                              {entry.title}
                            </h3>
                            <p className={`text-sm ${secondaryTextClasses}`}>
                              {new Date(entry.createdAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openJournalEditor(entry.id)}
                            className={`p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                            title="View entry"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none mb-4">
                        <div 
                          className={`${secondaryTextClasses} leading-relaxed`}
                          dangerouslySetInnerHTML={{ 
                            __html: entry.content.length > 300 
                              ? entry.content.substring(0, 300) + '...' 
                              : entry.content 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold ${textClasses} mb-2`}>
              Start Your Journal
            </h3>
            <p className={`${secondaryTextClasses} mb-6`}>
              Begin documenting your thoughts, experiences, and memories.
            </p>
            <button
              onClick={() => openJournalEditor()}
              className={`px-6 py-3 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
            >
              Write First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;