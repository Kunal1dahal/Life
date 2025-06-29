# Life Productivity Platform

A comprehensive productivity platform combining project management, journaling, habit tracking, and visual journey mapping with file-based storage.

## 🏗️ Architecture

```
life-productivity/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express API server
├── database/          # File-based storage (JSON files and attachments)
│   ├── categories.json
│   ├── ideas.json
│   ├── journal.json
│   ├── habits.json
│   ├── clicks.json
│   ├── journey.json
│   ├── fonts.json
│   └── attachments/   # All uploaded files (images, videos, fonts, etc.)
├── uploads/           # Temporary upload directory
└── README.md
```

## 🚀 Features

- **Project Management**: Organize ideas into categories with rich text editing
- **Journal**: Personal journaling with mood tracking and rich content
- **Habits**: Daily habit tracking with visual progress indicators
- **Clicks**: Photo and video sharing with timeline view
- **Journey**: Task-based progress tracking with completion states
- **Settings**: Custom font management for editors

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **File-based JSON storage** (no database required)
- **Multer** for file uploads
- **Joi** for validation
- **Helmet** for security
- **CORS** for cross-origin requests

### Storage
- **JSON files** for data persistence
- **Local file system** for attachments
- Organized folder structure in `/database`

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd life-productivity
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### 4. Seed Sample Data
```bash
# Seed the database with sample data
cd backend
npm run seed
```

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
DATABASE_PATH=../database
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 File Storage Structure

### Data Storage (`/database`)
```
database/
├── categories.json     # Category definitions
├── ideas.json         # Project ideas and details
├── journal.json       # Journal entries
├── habits.json        # Habit tracking data
├── clicks.json        # Media posts metadata
├── journey.json       # Journey task nodes
├── fonts.json         # Custom font metadata
└── attachments/       # All uploaded files
    ├── images/
    ├── videos/
    ├── fonts/
    └── documents/
```

### File Organization
- **JSON files**: Store structured data with auto-generated IDs
- **Attachments folder**: Organized storage for all uploaded files
- **Automatic cleanup**: Orphaned files are handled during deletion
- **File naming**: Unique timestamps + random strings prevent conflicts

## 🔌 API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Ideas
- `GET /api/ideas` - Get all ideas
- `POST /api/ideas` - Create idea (with file upload)
- `PUT /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea

### Journal
- `GET /api/journal` - Get all entries
- `POST /api/journal` - Create entry
- `PUT /api/journal/:id` - Update entry
- `DELETE /api/journal/:id` - Delete entry

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id/entries` - Update habit entry
- `DELETE /api/habits/:id` - Delete habit

### Clicks
- `GET /api/clicks` - Get all media
- `POST /api/clicks` - Upload media
- `DELETE /api/clicks/:id` - Delete media

### Journey
- `GET /api/journey` - Get all nodes
- `POST /api/journey` - Create node
- `PUT /api/journey/:id` - Update node
- `DELETE /api/journey/:id` - Delete node

### Fonts
- `GET /api/fonts` - Get all fonts
- `POST /api/fonts` - Upload font
- `DELETE /api/fonts/:id` - Delete font

## 🎨 Features

### Rich Text Editing
- Advanced toolbar with formatting options
- Font family and size selection
- Color and highlighting support
- Image and video embedding
- Table insertion
- Custom font support

### File Management
- Organized file storage in `/database/attachments`
- Automatic file naming and path management
- File type validation and size limits
- Secure file serving via Express static middleware

### Data Validation
- Comprehensive input validation using Joi
- File upload validation
- Error handling and user feedback

### Performance Optimization
- Efficient file serving
- Request rate limiting
- Response compression
- Optimized JSON file operations

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- File upload restrictions
- Rate limiting
- Error handling without data exposure

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Environment Setup
- Set production environment variables
- Configure proper CORS origins
- Set secure file upload limits
- Enable production logging
- Ensure proper file permissions

## 🗃️ Data Management

### Backup
```bash
# Backup entire database folder
cp -r database database_backup_$(date +%Y%m%d)
```

### Migration
- JSON files are human-readable and easily portable
- Simple file copying for data migration
- No database setup required on new systems

### Maintenance
- Periodic cleanup of orphaned files
- JSON file optimization
- Log rotation for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with file-based storage
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the file storage structure
- Review the API endpoints
- Test with the provided seed data
- Examine JSON file formats

## 🔄 Development Workflow

1. **Start backend** server (`npm run dev`)
2. **Run frontend** development server (`npm run dev`)
3. **Seed sample data** if needed (`npm run seed`)
4. **Test API endpoints** using the frontend
5. **Monitor file storage** in `/database` folder
6. **Check logs** for debugging

The platform provides a complete productivity solution with modern web technologies and a robust file-based storage system that requires no database setup.