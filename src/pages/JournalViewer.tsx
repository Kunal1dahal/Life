import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft } from 'lucide-react';

const JournalViewer: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const { journalEntries } = useData();
  
  const entryId = searchParams.get('id');
  const entry = entryId ? journalEntries.find(e => e.id === entryId) : null;

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} mb-4`}>Entry Not Found</h2>
          <button
            onClick={() => navigate('/journal')}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-lg"
          >
            Back to Journal
          </button>
        </div>
      </div>
    );
  }

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
            {/* Left: Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/journal')}
                className={`p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className={`text-xl font-semibold ${textClasses}`}>
                {entry.title}
              </h1>
            </div>
            
            {/* Right: Published Date and Time */}
            <div className={`text-sm ${secondaryTextClasses}`}>
              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          <div className="p-8">
            {/* Title and Mood */}
            <div className="mb-8">
              <h1 className={`text-4xl font-bold ${textClasses} mb-4`}>
                {entry.title}
              </h1>
              {/* Mood emoji below title with gap */}
              {entry.mood && (
                <div className="mb-6">
                  <span className="text-3xl">{entry.mood}</span>
                </div>
              )}
            </div>
            
            {/* Content with gap after mood */}
            <div 
              className={`prose dark:prose-invert max-w-none prose-lg ${textClasses}`}
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalViewer;