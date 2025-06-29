import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database folder path
const DB_PATH = path.join(__dirname, '../../database');

// Ensure database directory exists
const ensureDbDirectory = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }
  
  // Create subdirectories
  const subdirs = ['categories', 'ideas', 'journal', 'habits', 'clicks', 'journey', 'fonts', 'attachments'];
  subdirs.forEach(dir => {
    const dirPath = path.join(DB_PATH, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Initialize database
ensureDbDirectory();

// Generic file operations
export const readJsonFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return [];
  }
};

export const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return false;
  }
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Collection paths
export const getCollectionPath = (collection) => {
  return path.join(DB_PATH, `${collection}.json`);
};

export const getAttachmentPath = (filename) => {
  return path.join(DB_PATH, 'attachments', filename);
};

// Generic CRUD operations
export const findAll = (collection) => {
  const filePath = getCollectionPath(collection);
  return readJsonFile(filePath);
};

export const findById = (collection, id) => {
  const items = findAll(collection);
  return items.find(item => item._id === id);
};

export const create = (collection, data) => {
  const items = findAll(collection);
  const newItem = {
    _id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.push(newItem);
  const filePath = getCollectionPath(collection);
  writeJsonFile(filePath, items);
  return newItem;
};

export const updateById = (collection, id, updates) => {
  const items = findAll(collection);
  const index = items.findIndex(item => item._id === id);
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  const filePath = getCollectionPath(collection);
  writeJsonFile(filePath, items);
  return items[index];
};

export const deleteById = (collection, id) => {
  const items = findAll(collection);
  const index = items.findIndex(item => item._id === id);
  if (index === -1) return false;
  
  items.splice(index, 1);
  const filePath = getCollectionPath(collection);
  writeJsonFile(filePath, items);
  return true;
};

export const deleteMany = (collection, filter) => {
  const items = findAll(collection);
  const filteredItems = items.filter(item => {
    return !Object.keys(filter).every(key => item[key] === filter[key]);
  });
  
  const filePath = getCollectionPath(collection);
  writeJsonFile(filePath, filteredItems);
  return items.length - filteredItems.length;
};

// File operations for attachments
export const saveAttachment = (file, filename) => {
  try {
    const attachmentPath = getAttachmentPath(filename);
    fs.copyFileSync(file.path, attachmentPath);
    return `/database/attachments/${filename}`;
  } catch (error) {
    console.error('Error saving attachment:', error);
    return null;
  }
};

export const deleteAttachment = (filename) => {
  try {
    const attachmentPath = getAttachmentPath(filename);
    if (fs.existsSync(attachmentPath)) {
      fs.unlinkSync(attachmentPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return false;
  }
};

export { DB_PATH };