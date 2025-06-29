import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Edit3, File, Image, Video, FileText } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ExtendedIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'todo' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  attachments: FileItem[];
  createdAt: Date;
  updatedAt: Date;
}

const IdeaViewer: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const { ideas, categories } = useData();
  
  const ideaId = searchParams.get('id');
  const idea = ideaId ? ideas.find(i => i.id === ideaId) as ExtendedIdea : null;
  const category = idea ? categories.find(cat => cat.id === idea.category) : null;

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} mb-4`}>Idea Not Found</h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('text') || type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openEditor = () => {
    navigate(`/idea-editor?id=${idea.id}`);
  };

  // Determine if this was edited (has updatedAt different from createdAt)
  const wasEdited = idea.updatedAt && new Date(idea.updatedAt).getTime() !== new Date(idea.createdAt).getTime();
  const displayDate = wasEdited ? idea.updatedAt : idea.createdAt;
  const dateLabel = wasEdited ? 'Edited' : 'Published';

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
                onClick={() => navigate('/projects')}
                className={`p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className={`text-xl font-semibold ${textClasses}`}>
                {idea.title}
              </h1>
            </div>
            
            {/* Right: Date and Edit Button */}
            <div className="flex items-center space-x-4">
              <div className={`text-sm ${secondaryTextClasses}`}>
                {dateLabel} {new Date(displayDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {new Date(displayDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <button
                onClick={openEditor}
                className={`p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                title="Edit idea"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          <div className="p-8">
            {/* Category tile with emoji (no title) */}
            {category && (
              <div className="mb-6">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-blue-100/80 dark:bg-blue-900/50 backdrop-blur-sm text-blue-700 dark:text-blue-300 rounded-lg`}>
                  <span className="text-xl">{category.emoji}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
              </div>
            )}
            
            {/* Content with proper text color */}
            <div 
              className={`prose dark:prose-invert max-w-none prose-lg mb-8 ${textClasses}`}
              dangerouslySetInnerHTML={{ __html: idea.description }}
            />

            {/* Attachments Section */}
            {idea.attachments && idea.attachments.length > 0 && (
              <div className={`border-t ${borderClasses} pt-8`}>
                <h3 className={`text-xl font-semibold ${textClasses} mb-6`}>
                  Attachments ({idea.attachments.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {idea.attachments.map((file) => {
                    const IconComponent = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className={`p-4 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg border ${borderClasses} hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors duration-200 cursor-pointer`}
                        onClick={() => {
                          if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                            window.open(file.url, '_blank');
                          } else {
                            // For other file types, you might want to download or open differently
                            window.open(file.url, '_blank');
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-8 w-8 ${secondaryTextClasses} flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${textClasses} truncate`}>
                              {file.name}
                            </p>
                            <p className={`text-sm ${secondaryTextClasses}`}>
                              {formatFileSize(file.size)}
                            </p>
                            {file.type.startsWith('image/') && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Click to view full size
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Preview for images */}
                        {file.type.startsWith('image/') && (
                          <div className="mt-3">
                            <img
                              src={file.url}
                              alt={file.name}
                              className={`w-full h-32 object-cover rounded border ${borderClasses}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaViewer;