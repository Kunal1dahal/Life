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
  Upload,
  X,
  File,
  Video,
  FileText
} from 'lucide-react';

interface FileItem {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

const IdeaEditor: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const { ideas, categories, addIdea, updateIdea, loading } = useData();
  
  const ideaId = searchParams.get('id');
  const categoryId = searchParams.get('category');
  const existingIdea = ideaId ? ideas.find(idea => idea._id === ideaId) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [saving, setSaving] = useState(false);

  const editorRef = React.useRef<HTMLDivElement>(null);

  // Initialize form data when idea loads
  useEffect(() => {
    if (existingIdea) {
      setTitle(existingIdea.title);
      setDescription(existingIdea.description);
      const categoryId = typeof existingIdea.category === 'string' 
        ? existingIdea.category 
        : existingIdea.category._id;
      setSelectedCategory(categoryId);
    } else if (categoryId) {
      setSelectedCategory(categoryId);
    } else if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [existingIdea, categoryId, categories]);

  // Initialize editor content when component mounts
  useEffect(() => {
    if (editorRef.current && description) {
      editorRef.current.innerHTML = description;
    }
  }, [description]);

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

  const execCommand = (command: string, value?: string) => {
    // Focus the editor first to ensure commands work properly
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
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
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text:', url);
      if (text) {
        execCommand('insertHTML', `<a href="${url}" target="_blank">${text}</a>`);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" style="max-width: 100%; height: auto;" alt="Image" />`);
    }
  };

  const changeTextColor = () => {
    const color = prompt('Enter color (hex, rgb, or name):', '#000000');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt('Enter background color (hex, rgb, or name):', '#ffff00');
    if (color) {
      execCommand('backColor', color);
    }
  };

  const changeFontSize = (size: string) => {
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

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: File[] = [];
    
    for (let i = 0; i < selectedFiles.length && attachments.length + newFiles.length < 10; i++) {
      const file = selectedFiles[i];
      newFiles.push(file);
    }
    
    setAttachments([...attachments, ...newFiles]);
  };

  const removeFile = (fileIndex: number) => {
    setAttachments(attachments.filter((_, index) => index !== fileIndex));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your idea.');
      return;
    }

    if (!selectedCategory && categories.length > 0) {
      alert('Please select a category for your idea.');
      return;
    }

    try {
      setSaving(true);

      const ideaData = {
        title: title.trim(),
        description,
        category: selectedCategory,
        status: 'todo' as const,
        priority: 'medium' as const,
        attachments: attachments,
      };

      if (existingIdea) {
        await updateIdea(existingIdea._id, ideaData);
      } else {
        await addIdea(ideaData);
      }

      navigate('/projects');
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('Failed to save idea. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedCategoryData = categories.find(cat => cat._id === selectedCategory);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                onClick={() => navigate('/projects')}
                className={`p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                {selectedCategoryData && (
                  <span className="text-xl">{selectedCategoryData.emoji}</span>
                )}
                <h1 className={`text-xl font-semibold ${textClasses}`}>
                  {existingIdea ? 'Edit Idea' : 'Create New Idea'}
                </h1>
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
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-200 shadow-lg flex items-center space-x-2 font-semibold disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : (existingIdea ? 'Update' : 'Save')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} overflow-hidden`}>
          {/* Title and Category */}
          <div className={`p-6 border-b ${borderClasses} space-y-4`}>
            <div>
              <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-semibold ${inputClasses}`}
                placeholder="Enter your idea title..."
                required
              />
            </div>

            {categories.length > 0 && (
              <div>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectClasses}`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!showPreview && (
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
                      onClick={insertImage}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Image"
                    >
                      <Image className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                      onClick={insertTable}
                      className={`p-2 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-colors duration-200`}
                      title="Insert Table"
                    >
                      <Table className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="p-6">
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-2`}>
                  Description
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
                  className={`min-h-[400px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${inputClasses}`}
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
              </div>

              {/* File Attachments */}
              <div className={`p-6 border-t ${borderClasses}`}>
                <label className={`block text-sm font-medium ${secondaryTextClasses} mb-4`}>
                  Attachments (Optional)
                </label>
                
                <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200`}>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={`${secondaryTextClasses} mb-2`}>
                    Drag and drop files here, or{' '}
                    <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      browse
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                      />
                    </label>
                  </p>
                  <p className={`text-sm ${secondaryTextClasses}`}>
                    Maximum 10 files, any file type supported
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className={`font-medium ${textClasses}`}>
                      Attached Files ({attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {attachments.map((file, index) => {
                        const IconComponent = getFileIcon(file.type);
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 ${cardClasses} rounded-lg`}
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div>
                                <p className={`text-sm font-medium ${textClasses}`}>
                                  {file.name}
                                </p>
                                <p className={`text-xs ${secondaryTextClasses}`}>
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Preview Mode */}
          {showPreview && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className={`text-4xl font-bold ${textClasses} mb-4`}>
                    {title || 'Untitled Idea'}
                  </h1>
                  <div className="flex items-center space-x-3">
                    {selectedCategoryData && (
                      <>
                        <span className="text-2xl">{selectedCategoryData.emoji}</span>
                        <span className={`text-lg ${secondaryTextClasses}`}>
                          {selectedCategoryData.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div 
                  className={`prose dark:prose-invert max-w-none prose-lg ${textClasses}`}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                
                {attachments.length > 0 && (
                  <div className="mt-8">
                    <h3 className={`text-xl font-semibold ${textClasses} mb-4`}>
                      Attachments ({attachments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attachments.map((file, index) => {
                        const IconComponent = getFileIcon(file.type);
                        return (
                          <div
                            key={index}
                            className={`p-4 ${cardClasses} rounded-lg border ${borderClasses}`}
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                              <div>
                                <p className={`font-medium ${textClasses}`}>
                                  {file.name}
                                </p>
                                <p className={`text-sm ${secondaryTextClasses}`}>
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaEditor;