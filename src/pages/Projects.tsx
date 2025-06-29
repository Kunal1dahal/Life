import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, Settings, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';

interface FileItem {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

interface ExtendedIdea {
  _id: string;
  title: string;
  description: string;
  category: any;
  status: 'todo' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  attachments: FileItem[];
  createdAt: string;
  updatedAt: string;
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { ideas, categories, addCategory, updateCategory, deleteCategory, deleteIdea, loading } = useData();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categorySettings, setCategorySettings] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '💡',
    color: 'blue',
  });

  // Comprehensive emoji list with all available emojis
  const emojis = [
    '💡', '💼', '🏠', '📚', '🎯', '🚀', '💻', '🎨', '🏃‍♂️', '🌟',
    '🔬', '🎵', '🍳', '🌱', '⚡', '🎮', '📱', '🎬', '📝', '🔧',
    '🎪', '🏆', '💰', '🌍', '🎓', '🏥', '🚗', '✈️', '🏖️', '🎂',
    '🎸', '📷', '🎭', '🏋️', '🧘', '🔥', '💎', '🌈', '⭐', '🎊',
    '🎉', '🎈', '🎀', '🎁', '🏅', '🥇', '🏵️', '🌺', '🌸', '🌼',
    '🌻', '🌷', '🌹', '🥀', '🌿', '🍀', '🍃', '🌾', '🌵', '🌲',
    '🌳', '🌴', '🌊', '🌀', '🌈', '☀️', '⭐', '🌟', '✨', '💫',
    '🔮', '💜', '💙', '💚', '💛', '🧡', '❤️', '🖤', '🤍', '🤎',
    '💕', '💖', '💗', '💘', '💝', '💞', '💟', '❣️', '💔', '❤️‍🔥',
    '❤️‍🩹', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬',
    '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖',
    '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜'
  ];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      try {
        await addCategory(newCategory);
        setNewCategory({
          name: '',
          emoji: '💡',
          color: 'blue',
        });
        setShowAddCategory(false);
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category. Please try again.');
      }
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openIdeaEditor = (categoryId?: string, ideaId?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    if (ideaId) params.set('id', ideaId);
    navigate(`/idea-editor?${params.toString()}`);
  };

  const openIdeaViewer = (ideaId: string) => {
    navigate(`/idea-viewer?id=${ideaId}`);
  };

  const handleRenameCategory = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (category) {
      setRenameValue(category.name);
      setShowRenameModal(categoryId);
      setCategorySettings(null);
    }
  };

  const submitRename = async () => {
    if (showRenameModal && renameValue.trim()) {
      try {
        await updateCategory(showRenameModal, { name: renameValue.trim() });
        setShowRenameModal(null);
        setRenameValue('');
      } catch (error) {
        console.error('Error updating category:', error);
        alert('Failed to update category. Please try again.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (category && confirm(`Are you sure you want to delete "${category.name}" and all its ideas?`)) {
      try {
        await deleteCategory(categoryId);
        setCategorySettings(null);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteIdea(ideaId);
      } catch (error) {
        console.error('Error deleting idea:', error);
        alert('Failed to delete idea. Please try again.');
      }
    }
  };

  // Group ideas by category
  const groupedIdeas = categories.map(category => ({
    ...category,
    ideas: ideas.filter(idea => {
      const categoryId = typeof idea.category === 'string' ? idea.category : idea.category._id;
      return categoryId === category._id;
    }),
  }));

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

  // Projects button colors - light green in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className={textClasses}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Action Buttons - No intro text */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setShowAddCategory(true)}
          className={`px-8 py-4 ${buttonClasses} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2`}
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Add Category</span>
        </button>
        
        <button
          onClick={() => openIdeaEditor()}
          className={`px-8 py-4 ${buttonClasses} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2`}
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Add Idea</span>
        </button>
      </div>

      {/* Categories and Ideas */}
      <div className="space-y-6">
        {groupedIdeas.length > 0 ? (
          groupedIdeas.map(category => (
            <div key={category._id} className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-visible relative`}>
              {/* Category Header */}
              <div className={`flex items-center justify-between p-6 bg-gradient-to-r from-blue-50/50 to-white/50 dark:from-gray-700/50 dark:to-gray-800/50 border-b ${borderClasses}`}>
                <div 
                  className="flex items-center space-x-4 cursor-pointer flex-1"
                  onClick={() => toggleCategoryExpansion(category._id)}
                >
                  <div className="flex items-center space-x-2">
                    {expandedCategories.has(category._id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-3xl">{category.emoji}</span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${textClasses}`}>
                      {category.name}
                    </h2>
                    <p className={`text-sm ${secondaryTextClasses}`}>
                      {category.ideas.length} {category.ideas.length === 1 ? 'idea' : 'ideas'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openIdeaEditor(category._id);
                    }}
                    className={`p-2 ${
                      theme === 'light' ? 'text-green-600 hover:bg-green-100' : 'text-green-400 hover:bg-green-900/50'
                    } rounded-lg transition-colors duration-200`}
                    title="Add idea to this category"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategorySettings(categorySettings === category._id ? null : category._id);
                      }}
                      className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200`}
                      title="Category settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    {/* Settings Dropdown - Fixed positioning */}
                    {categorySettings === category._id && (
                      <div className={`absolute right-0 top-full mt-2 ${cardClasses} border ${borderClasses} rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden`}>
                        <button
                          onClick={() => handleRenameCategory(category._id)}
                          className={`w-full px-4 py-3 text-left text-sm ${textClasses} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200`}
                        >
                          Rename
                        </button>
                        <div className={`border-t ${borderClasses}`}></div>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className={`w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200`}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Ideas */}
              {expandedCategories.has(category._id) && (
                <div className="p-6">
                  {category.ideas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.ideas.map(idea => (
                        <div 
                          key={idea._id} 
                          className={`bg-gradient-to-br from-blue-50/80 to-white/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg p-4 hover:shadow-md transition-all duration-200 border border-blue-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-gray-500 group`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 
                              className={`font-medium ${textClasses} line-clamp-2 flex-1 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200`}
                              onClick={() => openIdeaViewer(idea._id)}
                            >
                              {idea.title}
                            </h3>
                            <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openIdeaViewer(idea._id);
                                }}
                                className={`p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded`}
                                title="View idea"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteIdea(idea._id);
                                }}
                                className={`p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded`}
                                title="Delete idea"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div 
                            className={`text-sm ${secondaryTextClasses} mb-3 line-clamp-3 cursor-pointer`}
                            onClick={() => openIdeaViewer(idea._id)}
                            dangerouslySetInnerHTML={{ 
                              __html: idea.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                            }}
                          />
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${secondaryTextClasses}`}>
                              {new Date(idea.createdAt).toLocaleDateString()}
                            </span>
                            {(idea as ExtendedIdea).attachments && (idea as ExtendedIdea).attachments.length > 0 && (
                              <div className={`text-xs ${secondaryTextClasses}`}>
                                📎 {(idea as ExtendedIdea).attachments.length}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`${secondaryTextClasses} mb-4`}>
                        No ideas in this category yet
                      </p>
                      <button
                        onClick={() => openIdeaEditor(category._id)}
                        className={`px-4 py-2 ${
                          theme === 'light' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                        } rounded-lg transition-colors duration-200`}
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Add First Idea
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💡</div>
            <h3 className={`text-xl font-semibold ${textClasses} mb-2`}>
              Ready to start organizing?
            </h3>
            <p className={`${secondaryTextClasses} mb-8`}>
              Create your first category to begin organizing your ideas and projects.
            </p>
            <button
              onClick={() => setShowAddCategory(true)}
              className={`px-6 py-3 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create First Category
            </button>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-xl p-6 w-full max-w-md shadow-2xl border ${borderClasses}`}>
            <h3 className={`text-lg font-semibold ${textClasses} mb-4`}>
              Create New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Enter category name..."
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Choose an Emoji
                </label>
                <div className={`grid grid-cols-8 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 ${cardClasses}`}>
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, emoji }))}
                      className={`p-2 text-xl rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                        newCategory.emoji === emoji
                          ? 'border-green-500 bg-green-100 dark:bg-green-900/50 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-600'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className={`px-4 py-2 ${secondaryTextClasses} hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Category Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-xl p-6 w-full max-w-md shadow-2xl border ${borderClasses}`}>
            <h3 className={`text-lg font-semibold ${textClasses} mb-4`}>
              Rename Category
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Enter new category name..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      submitRename();
                    } else if (e.key === 'Escape') {
                      setShowRenameModal(null);
                      setRenameValue('');
                    }
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRenameModal(null);
                    setRenameValue('');
                  }}
                  className={`px-4 py-2 ${secondaryTextClasses} hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={submitRename}
                  className={`px-6 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close settings */}
      {categorySettings && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setCategorySettings(null)}
        />
      )}
    </div>
  );
};

export default Projects;