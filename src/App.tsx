import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import IdeaEditor from './pages/IdeaEditor';
import IdeaViewer from './pages/IdeaViewer';
import Journal from './pages/Journal';
import JournalEditor from './pages/JournalEditor';
import JournalViewer from './pages/JournalViewer';
import Habits from './pages/Habits';
import HabitEditor from './pages/HabitEditor';
import HabitDetails from './pages/HabitDetails';
import Clicks from './pages/Clicks';
import Journey from './pages/Journey';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/idea-editor" element={<IdeaEditor />} />
              <Route path="/idea-viewer" element={<IdeaViewer />} />
              <Route path="/journal-editor" element={<JournalEditor />} />
              <Route path="/journal-viewer" element={<JournalViewer />} />
              <Route path="/habit-editor" element={<HabitEditor />} />
              <Route path="/habit-details" element={<HabitDetails />} />
              <Route path="/*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/habits" element={<Habits />} />
                    <Route path="/clicks" element={<Clicks />} />
                    <Route path="/journey" element={<Journey />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </Router>
        </DataProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;