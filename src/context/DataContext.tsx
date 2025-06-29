import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  categoryAPI, 
  ideaAPI, 
  journalAPI, 
  habitAPI, 
  clickAPI, 
  journeyAPI 
} from '../services/api';

interface FileItem {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

interface Category {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface Idea {
  _id: string;
  title: string;
  description: string;
  category: Category | string;
  status: 'todo' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  attachments: FileItem[];
  createdAt: string;
  updatedAt: string;
}

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface HabitEntry {
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

interface Habit {
  _id: string;
  name: string;
  question: string;
  color: string;
  entries: HabitEntry[];
  createdAt: string;
}

interface ClickMessage {
  _id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

interface JourneyNode {
  _id: string;
  title: string;
  question: string;
  status: 'pending' | 'completed' | 'failed';
  x: number;
  y: number;
  createdAt: string;
  currentDate: string;
  completedAt?: string;
}

interface DataContextType {
  ideas: Idea[];
  categories: Category[];
  journalEntries: JournalEntry[];
  habits: Habit[];
  clickMessages: ClickMessage[];
  journeyNodes: JourneyNode[];
  loading: boolean;
  error: string | null;
  addIdea: (idea: Omit<Idea, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addHabit: (habit: Omit<Habit, '_id' | 'entries' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabitEntry: (habitId: string, date: string, entry: Partial<HabitEntry>) => Promise<void>;
  addClickMessage: (file: File) => Promise<void>;
  deleteClickMessage: (id: string) => Promise<void>;
  updateJourneyNode: (nodeId: string, updates: Partial<JourneyNode>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [clickMessages, setClickMessages] = useState<ClickMessage[]>([]);
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from backend on mount
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [
        categoriesRes,
        ideasRes,
        journalRes,
        habitsRes,
        clicksRes,
        journeyRes
      ] = await Promise.allSettled([
        categoryAPI.getAll(),
        ideaAPI.getAll(),
        journalAPI.getAll(),
        habitAPI.getAll(),
        clickAPI.getAll(),
        journeyAPI.getAll()
      ]);

      // Handle each response, using empty arrays as fallbacks
      setCategories(
        categoriesRes.status === 'fulfilled' ? (categoriesRes.value?.data || []) : []
      );
      setIdeas(
        ideasRes.status === 'fulfilled' ? (ideasRes.value?.data || []) : []
      );
      setJournalEntries(
        journalRes.status === 'fulfilled' ? (journalRes.value?.data || []) : []
      );
      setHabits(
        habitsRes.status === 'fulfilled' ? (habitsRes.value?.data || []) : []
      );
      setClickMessages(
        clicksRes.status === 'fulfilled' ? (clicksRes.value?.data || []) : []
      );
      setJourneyNodes(
        journeyRes.status === 'fulfilled' ? (journeyRes.value?.data || []) : []
      );

      // Check if any requests failed
      const failedRequests = [categoriesRes, ideasRes, journalRes, habitsRes, clicksRes, journeyRes]
        .filter(res => res.status === 'rejected');
      
      if (failedRequests.length > 0) {
        console.warn('Some API requests failed, but app will continue with available data');
        setError('Some data could not be loaded, but the app is functional');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to connect to server. Using offline mode.');
      // Don't throw - let the app continue with empty data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await categoryAPI.create(categoryData);
      setCategories(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const response = await categoryAPI.update(id, updates);
      setCategories(prev => prev.map(cat => cat._id === id ? response.data : cat));
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
      // Also remove ideas in this category
      setIdeas(prev => prev.filter(idea => {
        const categoryId = typeof idea.category === 'string' ? idea.category : idea.category._id;
        return categoryId !== id;
      }));
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  // Idea operations
  const addIdea = async (ideaData: Omit<Idea, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await ideaAPI.create(ideaData);
      setIdeas(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error adding idea:', err);
      throw err;
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      const response = await ideaAPI.update(id, updates);
      setIdeas(prev => prev.map(idea => idea._id === id ? response.data : idea));
    } catch (err) {
      console.error('Error updating idea:', err);
      throw err;
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      await ideaAPI.delete(id);
      setIdeas(prev => prev.filter(idea => idea._id !== id));
    } catch (err) {
      console.error('Error deleting idea:', err);
      throw err;
    }
  };

  // Journal operations
  const addJournalEntry = async (entryData: Omit<JournalEntry, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await journalAPI.create(entryData);
      setJournalEntries(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error adding journal entry:', err);
      throw err;
    }
  };

  // Habit operations
  const addHabit = async (habitData: Omit<Habit, '_id' | 'entries' | 'createdAt'>) => {
    try {
      const response = await habitAPI.create(habitData);
      setHabits(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const response = await habitAPI.update(id, updates);
      setHabits(prev => prev.map(habit => habit._id === id ? response.data : habit));
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await habitAPI.delete(id);
      setHabits(prev => prev.filter(habit => habit._id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  };

  const updateHabitEntry = async (habitId: string, date: string, entryData: Partial<HabitEntry>) => {
    try {
      const response = await habitAPI.updateEntry(habitId, { date, ...entryData });
      setHabits(prev => prev.map(habit => habit._id === habitId ? response.data : habit));
    } catch (err) {
      console.error('Error updating habit entry:', err);
      throw err;
    }
  };

  // Click operations
  const addClickMessage = async (file: File) => {
    try {
      const response = await clickAPI.create(file);
      setClickMessages(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Error adding click message:', err);
      throw err;
    }
  };

  const deleteClickMessage = async (id: string) => {
    try {
      await clickAPI.delete(id);
      setClickMessages(prev => prev.filter(msg => msg._id !== id));
    } catch (err) {
      console.error('Error deleting click message:', err);
      throw err;
    }
  };

  // Journey operations
  const updateJourneyNode = async (nodeId: string, updates: Partial<JourneyNode>) => {
    try {
      const existingNode = journeyNodes.find(node => node._id === nodeId);
      if (existingNode) {
        const response = await journeyAPI.update(nodeId, updates);
        setJourneyNodes(prev => prev.map(node => node._id === nodeId ? response.data : node));
      } else {
        // Create new node
        const response = await journeyAPI.create(updates);
        setJourneyNodes(prev => [...prev, response.data]);
      }
    } catch (err) {
      console.error('Error updating journey node:', err);
      throw err;
    }
  };

  const value: DataContextType = {
    ideas,
    categories,
    journalEntries,
    habits,
    clickMessages,
    journeyNodes,
    loading,
    error,
    addIdea,
    updateIdea,
    deleteIdea,
    addCategory,
    updateCategory,
    deleteCategory,
    addJournalEntry,
    addHabit,
    updateHabit,
    deleteHabit,
    updateHabitEntry,
    addClickMessage,
    deleteClickMessage,
    updateJourneyNode,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};