import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Link,
  Image,
  Palette,
  Table,
  Indent,
  Outdent,
  Undo,
  Redo,
  Type,
  Highlighter,
  Subscript,
  Superscript,
  Video,
  Smile,
  ImageIcon,
  Lock
} from 'lucide-react';

const JournalEditor: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const { journalEntries, addJournalEntry, loading } = useData();
  
  const entryId = searchParams.get('id');
  const existingEntry = entryId ? journalEntries.find(entry => entry._id === entryId) : null;
  const isReadOnly = !!existingEntry; // Entries become read-only after saving

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(isReadOnly);
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [saving, setSaving] = useState(false);

  const editorRef = React.useRef<HTMLDivElement>(null);

  // Initialize form data when entry loads
  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title);
      setMood(existingEntry.mood);
      setContent(existingEntry.content);
    }
  }, [existingEntry]);

  // Initialize editor content when component mounts
  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // Available fonts including custom ones
  const availableFonts = [
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Courier New',
    'Comic Sans MS',
    ...(settings.editorFonts || []).map(font => font.name)
  ];

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😤', label: 'Angry' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😌', label: 'Peaceful' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🎉', label: 'Excited' },
    { emoji: '😍', label: 'Grateful' },
    { emoji: '🙂', label: 'Neutral' },
    { emoji: '😢', label: 'Emotional' },
    { emoji: '😎', label: 'Confident' },
    { emoji: '🤗', label: 'Loved' },
    { emoji: '😕', label: 'Confused' },
    { emoji: '🥳', label: 'Celebratory' },
  ];

  const execCommand = (command: string, value?: string) => {
    if (isReadOnly) return;
    
    // Focus the editor first to ensure commands work properly
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current && !isReadOnly) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    if (isReadOnly) return;
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
      const rowCount = parseInt(rows);
      const colCount = parseInt(cols);
      
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      
      for (let i = 0; i < rowCount; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < colCount; j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      
      execCommand('insertHTML', tableHTML);
    }
  };

  const insertLink = () => {
    if (isReadOnly) return;
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text:', url);
      if (text) {
        execCommand('insertHTML', `<a href="${url}" target="_blank">${text}</a>`);
      }
    }
  };

  const insertImage = () => {
    if (isReadOnly) return;
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Image" />`);
    }
  };

  const insertVideo = () => {
    if (isReadOnly) return;
    const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (url) {
      // Simple video embed - you can enhance this for different platforms
      execCommand('insertHTML', `<div style="margin: 10px 0;"><video controls style="max-width: 100%; height: auto;"><source src="${url}">Your browser does not support the video tag.</video></div>`);
    }
  };

  const insertGif = () => {
    if (isReadOnly) return;
    const url = prompt('Enter GIF URL:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="GIF" />`);
    }
  };

  const insertSticker = () => {
    if (isReadOnly) return;
    const stickers = ['🎉', '❤️', '🌟', '🔥', '💯', '👍', '🎈', '🌈', '⭐', '💫', '🎊', '🎁', '🌺', '🌸', '🦋', '🌻'];
    const sticker = prompt('Choose a sticker:\n' + stickers.join(' ') + '\n\nOr enter your own emoji:');
    if (sticker) {
      execCommand('insertHTML', `<span style="font-size: 24px; margin: 0 5px;">${sticker}</span>`);
    }
  };

  const changeTextColor = () => {
    if (isReadOnly) return;
    const color = prompt('Enter color (hex, rgb, or name):', '#000000');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    if (isReadOnly) return;
    const color = prompt('Enter background color (hex, rgb, or name):', '#ffff00');
    if (color) {
      execCommand('backColor', color);
    }
  };

  const changeFontSize = (size: string) => {
    if (isReadOnly) return;
    setFontSize(size);
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        try {
          range.surroundContents(span);
        } catch (e) {
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
        updateContent();
      } else {
        // If no selection, apply to future text
        execCommand('fontSize', '3');
        const fontElements = editorRef.current.querySelectorAll('font[size="3"]');
        fontElements.forEach(el => {
          const span = document.createElement('span');
          span.style.fontSize = size + 'px';
          span.innerHTML = el.innerHTML;
          el.parentNode?.replaceChild(span, el);
        });
        updateContent();
      }
    }
  };

  const changeFontFamily = (family: string) => {
    if (isReadOnly) return;
    setFontFamily(family);
    
    // Apply custom font if it's a custom one
    const customFont = settings.editorFonts?.find(font => font.name === family);
    if (customFont) {
      // Create temporary style for this font if not already exists
      const styleId = `editor-font-${family.replace(/\s+/g, '-')}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @font-face {
            font-family: '${family}';
            src: url('${customFont.url}') format('truetype');
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    execCommand('fontName', family);
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    
    if (!title.trim()) {
      alert('Please enter a title for your journal entry.');
      return;
    }

    if (!content.trim()) {
      alert('Please write some content for your journal entry.');
      return;
    }

    try {
      setSaving(true);

      const entryData = {
        title: title.trim(),
        content,
        mood,
        tags: [], // No tags as requested
      };

      await addJournalEntry(entryData);
      navigate('/journal');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toolbarSections = [
    // Basic formatting
    [
      { icon: Undo, command: 'undo', title: 'Undo' },
      { icon: Redo, command: 'redo', title: 'Redo' },
    ],
    // Text formatting
    [
      { icon: Bold, command: 'bold', title: 'Bold' },
      { icon: Italic, command: 'italic', title: 'Italic' },
      { icon: Underline, command: 'underline', title: 'Underline' },
      { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
      { icon: Subscript, command: 'subscript', title: 'Subscript' },
      { icon: Superscript, command: 'superscript', title: 'Superscript' },
    ],
    // Alignment
    [
      { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
      { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
      { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
      { icon: AlignJustify, command: 'justifyFull', title: 'Justify' },
    ],
    // Lists and indentation
    [
      { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
      { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
      { icon: Indent, command: 'indent', title: 'Increase Indent' },
      { icon: Outdent, command: 'outdent', title: 'Decrease Indent' },
    ],
    // Blocks
    [
      { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
      { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
      { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
      { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
      { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    ],
  ];

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

  // Fixed dropdown/select styling for dark mode
  const selectClasses = theme === 'light'
    ? 'bg-white text-black border-gray-300'
    : 'bg-gray-800 text-white border-gray-600';

  const inputClasses = theme === 'light'
    ? 'bg-white text-black border-gray-300'
    : 'bg-gray-800 text-white border-gray-600';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b ${borderClasses} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/journal')}
                className={`p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                {mood && <span className="text-xl">{mood}</span>}
                <h1 className={`text-xl font-semibold ${textClasses}`}>
                  {isReadOnly ? 'Journal Entry' : 'New Journal Entry'}
                </h1>
                {isReadOnly && (
                  <Lock className="h-4 w-4 text-gray-400" title="This entry is read-only" />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200 flex items-center space-x-2`}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
              {!isReadOnly && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-lg flex items-center space-x-2 font-semibold disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Entry'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          {/* Title and Mood */}
          <div className={`p-6 border-b ${borderClasses} space-y-4`}>
            <div>
              <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => !isReadOnly && setTitle(e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xl font-semibold ${
                  isReadOnly ? 'cursor-not-allowed opacity-75' : ''
                } ${inputClasses}`}
                placeholder="What's on your mind today?"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                How are you feeling?
              </label>
              {isReadOnly ? (
                <div className="flex items-center space-x-2">
                  {mood && (
                    <>
                      <span className="text-2xl">{mood}</span>
                      <span className={secondaryTextClasses}>
                        {moods.find(m => m.emoji === mood)?.label}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {moods.map(moodOption => (
                    <button
                      key={moodOption.emoji}
                      type="button"
                      onClick={() => setMood(moodOption.emoji)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                        mood === moodOption.emoji
                          ? `border-green-500 ${cardClasses}`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      title={moodOption.label}
                    >
                      <span className="text-2xl">{moodOption.emoji}</span>
                      <span className={`text-xs ${secondaryTextClasses}`}>{moodOption.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!showPreview && !isReadOnly && (
            <>
              {/* Advanced Toolbar */}
              <div className={`border-b ${borderClasses} bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm`}>
                {/* Font Controls */}
                <div className={`p-3 border-b ${borderClasses}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={fontFamily}
                      onChange={(e) => changeFontFamily(e.target.value)}
                      className={`px-3 py-1 border rounded text-sm ${selectClasses}`}
                    >
                      {availableFonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    
                    <select
                      value={fontSize}
                      onChange={(e) => changeFontSize(e.target.value)}
                      className={`px-3 py-1 border rounded text-sm ${selectClasses}`}
                    >
                      <option value="10">10px</option>
                      <option value="12">12px</option>
                      <option value="14">14px</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                      <option value="20">20px</option>
                      <option value="24">24px</option>
                      <option value="28">28px</option>
                      <option value="32">32px</option>
                      <option value="36">36px</option>
                    </select>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                    <button
                      onClick={changeTextColor}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Text Color"
                    >
                      <Type className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={changeBackgroundColor}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Highlight Color"
                    >
                      <Highlighter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Main Toolbar */}
                <div className="p-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {toolbarSections.map((section, sectionIndex) => (
                      <React.Fragment key={sectionIndex}>
                        {section.map((button, buttonIndex) => (
                          <button
                            key={buttonIndex}
                            type="button"
                            onClick={() => execCommand(button.command, button.value)}
                            className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                            title={button.title}
                          >
                            <button.icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        ))}
                        {sectionIndex < toolbarSections.length - 1 && (
                          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                        )}
                      </React.Fragment>
                    ))}

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    <button
                      onClick={insertLink}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Link"
                    >
                      <Link className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={insertTable}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Table"
                    >
                      <Table className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    {/* Media Controls */}
                    <button
                      onClick={insertImage}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Image"
                    >
                      <Image className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={insertVideo}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Video"
                    >
                      <Video className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={insertGif}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert GIF"
                    >
                      <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={insertSticker}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Sticker/Emoji"
                    >
                      <Smile className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="p-6">
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Content *
                </label>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={updateContent}
                  onPaste={(e) => {
                    // Handle paste to maintain proper formatting
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                    updateContent();
                  }}
                  className={`min-h-[400px] p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${inputClasses}`}
                  style={{ 
                    fontFamily: fontFamily,
                    fontSize: fontSize + 'px',
                    lineHeight: '1.6',
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal'
                  }}
                  suppressContentEditableWarning={true}
                />
                <p className={`text-sm ${secondaryTextClasses} mt-2`}>
                  💡 Tip: You can drag and drop images, videos, GIFs, and stickers anywhere in your text!
                </p>
              </div>
            </>
          )}

          {/* Preview Mode */}
          {(showPreview || isReadOnly) && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    {mood && <span className="text-3xl">{mood}</span>}
                    <div>
                      <h1 className={`text-4xl font-bold ${textClasses}`}>
                        {title || 'Untitled Entry'}
                      </h1>
                      <p className={`${secondaryTextClasses} mt-2`}>
                        {existingEntry && new Date(existingEntry.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`prose dark:prose-invert max-w-none prose-lg ${textClasses}`}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;