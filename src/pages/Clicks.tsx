import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, 
  Camera, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ClickMessage {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
}

const Clicks: React.FC = () => {
  const { theme } = useTheme();
  const { clickMessages, addClickMessage, deleteClickMessage } = useData();
  
  // UI State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Filter only images and videos
  const mediaMessages = clickMessages.filter(msg => msg.type === 'image' || msg.type === 'video');

  // Group messages by date
  const groupedMessages = mediaMessages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ClickMessage[]>);

  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle file upload
  const handleFileUpload = (files: FileList, type: 'image' | 'video') => {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      
      addClickMessage({
        type,
        mediaUrl: url,
        fileName: file.name,
        fileSize: file.size,
      });
    });
    setShowMediaPicker(false);
  };

  // Open camera (simplified - in real app would use camera API)
  const openCamera = () => {
    // For now, just trigger file input
    fileInputRef.current?.click();
    setShowMediaPicker(false);
  };

  // Open lightbox
  const openLightbox = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl);
    const index = mediaMessages.findIndex(msg => msg.mediaUrl === mediaUrl);
    setCurrentIndex(index);
  };

  // Navigate in lightbox
  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + mediaMessages.length) % mediaMessages.length
      : (currentIndex + 1) % mediaMessages.length;
    
    setCurrentIndex(newIndex);
    setSelectedMedia(mediaMessages[newIndex].mediaUrl);
  };

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigateLightbox('prev');
    if (e.key === 'ArrowRight') navigateLightbox('next');
    if (e.key === 'Escape') setSelectedMedia(null);
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

  // Clicks button colors - light orange/coral in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  return (
    <div className="min-h-screen relative">
      {/* Media Counter - Top Left */}
      <div className="absolute top-4 left-4 z-30">
        <div className="flex items-center space-x-2">
          <Camera className={`h-5 w-5 ${secondaryTextClasses}`} />
          <span className={`text-sm font-medium ${secondaryTextClasses}`}>
            {mediaMessages.length} {mediaMessages.length === 1 ? 'photo/video' : 'photos/videos'}
          </span>
        </div>
      </div>

      {/* Feed */}
      <div className="pb-24 px-4 pt-16">
        {Object.keys(groupedMessages).length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-8">
            {Object.entries(groupedMessages)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, messages]) => (
                <div key={date} className="space-y-4">
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-8">
                    <div className={`${cardClasses} px-4 py-2 rounded-full text-sm ${textClasses} font-medium border ${borderClasses}`}>
                      {formatDate(new Date(date))}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-6">
                    {messages
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map(message => (
                        <div key={message.id} className="group relative">
                          {/* Media Content */}
                          <div className="relative">
                            {message.type === 'image' ? (
                              <img 
                                src={message.mediaUrl} 
                                alt="Shared image"
                                className="w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                                onClick={() => openLightbox(message.mediaUrl)}
                              />
                            ) : (
                              <video 
                                src={message.mediaUrl} 
                                controls
                                className="w-full rounded-xl shadow-lg"
                                poster=""
                              />
                            )}
                            
                            {/* Delete button - appears on hover */}
                            <button
                              onClick={() => deleteClickMessage(message.id)}
                              className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </div>

                          {/* Timestamp */}
                          <div className="mt-2 text-center">
                            <span className={`text-xs ${secondaryTextClasses}`}>
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Camera className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold ${textClasses} mb-2`}>
                No photos or videos yet
              </h3>
              <p className={`${secondaryTextClasses} mb-6`}>
                Start capturing your visual memories
              </p>
              <button
                onClick={() => setShowMediaPicker(true)}
                className={`px-6 py-3 ${buttonClasses} text-white rounded-full transition-all duration-200 font-medium shadow-lg`}
              >
                Add First Photo/Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMediaPicker(true)}
          className={`w-14 h-14 ${buttonClasses} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group`}
        >
          <Plus className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`${cardClasses} rounded-2xl p-6 w-full max-w-sm border ${borderClasses}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${textClasses}`}>Add Media</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className={`p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm rounded-lg transition-colors`}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={openCamera}
                className={`w-full flex items-center space-x-3 p-4 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 backdrop-blur-sm rounded-xl transition-colors duration-200`}
              >
                <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className={`font-medium ${textClasses}`}>Take Photo</span>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMediaPicker(false);
                }}
                className={`w-full flex items-center space-x-3 p-4 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 backdrop-blur-sm rounded-xl transition-colors duration-200`}
              >
                <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className={`font-medium ${textClasses}`}>Choose from Gallery</span>
              </button>

              <button
                onClick={() => {
                  videoInputRef.current?.click();
                  setShowMediaPicker(false);
                }}
                className={`w-full flex items-center space-x-3 p-4 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 backdrop-blur-sm rounded-xl transition-colors duration-200`}
              >
                <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className={`font-medium ${textClasses}`}>Record Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200 z-10"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {mediaMessages.length > 1 && (
            <>
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200 z-10"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200 z-10"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Media content */}
          <div className="max-w-4xl max-h-full p-4 flex items-center justify-center">
            {mediaMessages[currentIndex]?.type === 'image' ? (
              <img
                src={selectedMedia}
                alt="Full size"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>

          {/* Counter */}
          {mediaMessages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full">
              <span className="text-white text-sm">
                {currentIndex + 1} of {mediaMessages.length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
        className="hidden"
      />
      
      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')}
        className="hidden"
      />
    </div>
  );
};

export default Clicks;