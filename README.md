# TeamSync - Remote Team Collaboration Platform

A comprehensive full-stack web application designed for remote team collaboration, featuring role-based access control, real-time task management, and modern UI/UX design.

## 🚀 Overview

TeamSync is a modern MERN stack application that enables remote teams to collaborate effectively through structured task management, team organization, and role-based workflows. The platform provides distinct interfaces for Admins, Team Leads, and Members, each tailored to their specific responsibilities and permissions.

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Team Lead, Member)
- Secure user registration and login
- Protected routes and API endpoints

### 👥 Team Management
- Create and manage teams
- Assign team leads and members
- Team-based task organization
- Member invitation system

### 📋 Task Management
- Kanban-style task board with drag & drop functionality
- Task creation, assignment, and tracking
- Priority levels and deadline management
- Real-time task status updates
- Task filtering and search capabilities

### 🎯 Role-Based Dashboards
- **Admin Dashboard**: System-wide management, user oversight, analytics
- **Team Lead Dashboard**: Team management, task assignment, progress tracking
- **Member Dashboard**: Personal task view, team collaboration

### 📊 Analytics & Reporting
- Task completion metrics
- Team performance analytics
- Progress tracking and reporting
- Activity logs and audit trails

### 🎨 Modern UI/UX
- Glass morphism design with Tailwind CSS
- Responsive design for all devices
- Smooth animations with Framer Motion
- Professional SaaS-style interface
- Custom font integration (Bevellier & Sentient)

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit + RTK Query** - State management and API caching
- **React Router DOM** - Client-side routing
- **@dnd-kit** - Drag and drop functionality
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Development & Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **MongoDB Memory Server** - In-memory MongoDB for testing
- **Nodemon** - Development server auto-restart
- **ESLint** - Code linting

## 📁 Project Structure

```
TeamSync/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── seeders/        # Database seeders
│   ├── tests/              # Test suites
│   ├── scripts/            # Utility scripts
│   └── uploads/            # File upload directory
├── frontend/               # React application
│   ├── src/
│   │   ├── api/           # RTK Query API services
│   │   ├── app/           # Redux store configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Redux slices
│   │   ├── layouts/       # Role-based layouts
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route protection
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeamSync
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Seed the database (optional)
   npm run seed
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/teamsync
MONGODB_TEST_URI=mongodb://localhost:27017/teamsync_test

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Test Coverage
The backend includes comprehensive test suites covering:
- Authentication endpoints
- User management
- Team operations
- Task management
- Role-based permissions
- Middleware functionality

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Team Endpoints
- `GET /api/teams` - Get user's teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Task Endpoints
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### User Management
- `GET /api/users` - Get users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 🎭 Demo Credentials

For testing purposes, use these credentials:

- **Admin**: admin@example.com / password
- **Team Lead**: lead@example.com / password  
- **Member**: member@example.com / password

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, AWS, etc.)
3. Ensure MongoDB connection is configured

### Frontend Deployment
1. Update API base URL in production
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples

## 🔮 Future Enhancements

- Real-time notifications
- Video conferencing integration
- Advanced analytics dashboard
- Mobile application
- Third-party integrations (Slack, GitHub, etc.)
- Advanced file sharing and collaboration tools

---

Built with ❤️ for remote teams worldwide.