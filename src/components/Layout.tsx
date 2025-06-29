import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Camera, 
  Map, 
  Sun, 
  Moon,
  Zap,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/projects', label: 'Projects', icon: Lightbulb },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/habits', label: 'Habits', icon: Target },
    { path: '/clicks', label: 'Clicks', icon: Camera },
    { path: '/journey', label: 'Journey', icon: Map },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen relative ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-blue-100 via-white to-blue-200' 
        : 'bg-gradient-to-br from-red-950 via-black to-red-900'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-50 ${
        theme === 'light'
          ? 'bg-white/80 border-gray-200'
          : 'bg-gray-900/80 border-gray-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Motto */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className={`h-8 w-8 ${
                  theme === 'light' ? 'text-blue-600' : 'text-red-400'
                }`} />
                <div>
                  <h1 className={`text-2xl font-bold ${
                    theme === 'light' ? 'text-black' : 'text-white'
                  }`}>Life</h1>
                  <p className={`text-xs -mt-1 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>Go For It</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? theme === 'light'
                          ? 'bg-blue-100/80 text-blue-700 shadow-sm backdrop-blur-sm'
                          : 'bg-red-900/50 text-red-300 shadow-sm backdrop-blur-sm'
                        : theme === 'light'
                        ? 'text-black hover:bg-blue-50/80 backdrop-blur-sm'
                        : 'text-gray-300 hover:bg-gray-800/50 backdrop-blur-sm'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === 'light'
                  ? 'text-black hover:bg-blue-50/80 backdrop-blur-sm'
                  : 'text-gray-300 hover:bg-gray-800/50 backdrop-blur-sm'
              }`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden border-t ${
          theme === 'light' ? 'border-gray-200' : 'border-gray-700'
        }`}>
          <div className="px-4 py-2 flex overflow-x-auto space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-blue-100/80 text-blue-700 backdrop-blur-sm'
                        : 'bg-red-900/50 text-red-300 backdrop-blur-sm'
                      : theme === 'light'
                      ? 'text-black'
                      : 'text-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;