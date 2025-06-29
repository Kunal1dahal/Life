import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, Check, X, Calendar, Clock, ChevronDown } from 'lucide-react';

interface JourneyNode {
  id: string;
  title: string;
  question: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  currentDate: Date;
  completedAt?: Date;
}

const Journey: React.FC = () => {
  const { theme } = useTheme();
  const { journeyNodes, updateJourneyNode } = useData();
  const [showAddNode, setShowAddNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showNextNodeForm, setShowNextNodeForm] = useState(false);

  const [newNode, setNewNode] = useState({
    title: '',
    question: '',
  });

  const [nextNode, setNextNode] = useState({
    title: '',
    question: '',
  });

  // Sort nodes: pending tasks first (by current date desc), then completed tasks (by completion date desc)
  const sortedNodes = [...journeyNodes].sort((a, b) => {
    // If both are pending, sort by current date (newest first)
    if (a.status === 'pending' && b.status === 'pending') {
      return new Date(b.currentDate).getTime() - new Date(a.currentDate).getTime();
    }
    
    // If one is pending and one is not, pending comes first
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // For completed tasks, sort by completion date (newest first)
    if (a.status === 'completed' && b.status === 'completed') {
      const aDate = a.completedAt || a.currentDate;
      const bDate = b.completedAt || b.currentDate;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    
    // Default to current date
    return new Date(b.currentDate).getTime() - new Date(a.currentDate).getTime();
  });

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNode.title.trim() && newNode.question.trim()) {
      const id = Date.now().toString();
      const now = new Date();
      const node: JourneyNode = {
        id,
        title: newNode.title.trim(),
        question: newNode.question.trim(),
        status: 'pending',
        createdAt: now,
        currentDate: now,
      };
      updateJourneyNode(id, node);
      setNewNode({ title: '', question: '' });
      setShowAddNode(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    const node = journeyNodes.find(n => n.id === nodeId);
    if (node && node.status === 'pending') {
      setSelectedNode(nodeId);
    }
  };

  const handleNodeAction = (action: 'completed' | 'failed') => {
    if (!selectedNode) return;

    const node = journeyNodes.find(n => n.id === selectedNode);
    if (!node) return;

    if (action === 'completed') {
      // Mark as completed
      updateJourneyNode(selectedNode, {
        status: 'completed',
        completedAt: new Date(),
      });
      setShowNextNodeForm(true);
    } else {
      // Shift to next day and keep at top
      const nextDay = new Date(node.currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      updateJourneyNode(selectedNode, {
        currentDate: nextDay,
      });
    }
    setSelectedNode(null);
  };

  const handleAddNextNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (nextNode.title.trim() && nextNode.question.trim()) {
      const id = Date.now().toString();
      const now = new Date();
      
      const node: JourneyNode = {
        id,
        title: nextNode.title.trim(),
        question: nextNode.question.trim(),
        status: 'pending',
        createdAt: now,
        currentDate: now,
      };
      updateJourneyNode(id, node);
      setNextNode({ title: '', question: '' });
      setShowNextNodeForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'failed': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'failed': return <X className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default: return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Pending';
      default: return 'Active';
    }
  };

  // Calculate stats
  const totalTasks = journeyNodes.length;
  const completedTasks = journeyNodes.filter(n => n.status === 'completed').length;
  const pendingTasks = journeyNodes.filter(n => n.status === 'pending').length;

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

  // Journey button colors - warm golden/amber in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${textClasses}`}>Journey</h1>
          <p className={secondaryTextClasses}>Track your daily progress and build momentum</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardClasses} rounded-xl p-6 shadow-lg border ${borderClasses}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${secondaryTextClasses}`}>Total Tasks</p>
              <p className={`text-3xl font-bold ${
                theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
              }`}>{totalTasks}</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </div>

        <div className={`${cardClasses} rounded-xl p-6 shadow-lg border ${borderClasses}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${secondaryTextClasses}`}>Completed</p>
              <p className={`text-3xl font-bold ${
                theme === 'light' ? 'text-green-600' : 'text-green-400'
              }`}>{completedTasks}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className={`${cardClasses} rounded-xl p-6 shadow-lg border ${borderClasses}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${secondaryTextClasses}`}>Active</p>
              <p className={`text-3xl font-bold ${
                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
              }`}>{pendingTasks}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {sortedNodes.length > 0 ? (
          <div className="space-y-6">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30"></div>
            
            {sortedNodes.map((node, index) => (
              <div key={node.id} className="relative flex items-start space-x-6">
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${getStatusColor(node.status)} shadow-lg`}>
                  {getStatusIcon(node.status)}
                  
                  {/* Pulse animation for pending tasks */}
                  {node.status === 'pending' && (
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-30"></div>
                  )}
                </div>

                {/* Card */}
                <div 
                  className={`flex-1 ${cardClasses} rounded-xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${getStatusColor(node.status)} ${
                    node.status === 'pending' ? 'cursor-pointer hover:scale-[1.02]' : ''
                  }`}
                  onClick={() => node.status === 'pending' && handleNodeClick(node.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold ${textClasses} mb-2`}>
                        {node.title}
                      </h3>
                      <p className={`${secondaryTextClasses} leading-relaxed`}>
                        {node.question}
                      </p>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        node.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        node.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {getStatusText(node.status)}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between text-sm ${secondaryTextClasses}`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(node.currentDate)}</span>
                      </div>
                      {node.completedAt && (
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <Check className="h-4 w-4" />
                          <span>Completed {formatDate(node.completedAt)}</span>
                        </div>
                      )}
                    </div>
                    
                    {node.status === 'pending' && (
                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <span>Click to update</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dotted connection line to next card */}
                {index < sortedNodes.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-6 border-l-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center`}>
              <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={`text-xl font-semibold ${textClasses} mb-2`}>
              Start Your Journey
            </h3>
            <p className={`${secondaryTextClasses} mb-6 max-w-md mx-auto`}>
              Create your first task and begin tracking your daily progress. Each step forward builds momentum.
            </p>
            <button
              onClick={() => setShowAddNode(true)}
              className={`px-6 py-3 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create First Task
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAddNode(true)}
          className={`w-14 h-14 ${buttonClasses} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110`}
        >
          <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-xl p-6 w-full max-w-md shadow-2xl border ${borderClasses}`}>
            <h3 className={`text-lg font-semibold ${textClasses} mb-4`}>Add New Task</h3>
            <form onSubmit={handleAddNode} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newNode.title}
                  onChange={(e) => setNewNode(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="What do you want to accomplish?"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Question/Description *
                </label>
                <textarea
                  value={newNode.question}
                  onChange={(e) => setNewNode(prev => ({ ...prev, question: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none`}
                  placeholder="What specific task or question will you complete?"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddNode(false)}
                  className={`px-4 py-2 ${secondaryTextClasses} hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 ${buttonClasses} text-white rounded-lg transition-all duration-200 shadow-lg`}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Action Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-xl p-6 w-full max-w-md shadow-2xl border ${borderClasses}`}>
            {(() => {
              const node = journeyNodes.find(n => n.id === selectedNode);
              return node ? (
                <div className="text-center">
                  <h3 className={`text-xl font-semibold ${textClasses} mb-3`}>{node.title}</h3>
                  <p className={`${secondaryTextClasses} mb-6 leading-relaxed`}>{node.question}</p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleNodeAction('completed')}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <Check className="h-5 w-5" />
                      <span>✅ Mark as Completed</span>
                    </button>
                    
                    <button
                      onClick={() => handleNodeAction('failed')}
                      className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <X className="h-5 w-5" />
                      <span>❌ Try Tomorrow</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedNode(null)}
                      className={`w-full px-6 py-2 ${secondaryTextClasses} hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Add Next Node Modal */}
      {showNextNodeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-xl p-6 w-full max-w-md shadow-2xl border ${borderClasses}`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-xl font-semibold ${textClasses}`}>Task Completed! 🎉</h3>
              <p className={`${secondaryTextClasses} mt-2`}>Ready for your next challenge?</p>
            </div>
            
            <form onSubmit={handleAddNextNode} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Next Task Title *
                </label>
                <input
                  type="text"
                  value={nextNode.title}
                  onChange={(e) => setNextNode(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="What's your next goal?"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Next Question/Description *
                </label>
                <textarea
                  value={nextNode.question}
                  onChange={(e) => setNextNode(prev => ({ ...prev, question: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg ${cardClasses} ${textClasses} focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none`}
                  placeholder="What will you accomplish next?"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNextNodeForm(false)}
                  className={`px-4 py-2 ${secondaryTextClasses} hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200`}
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  Add Next Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journey;