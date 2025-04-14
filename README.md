# SurnaturToDo

A modern minimalist Todo web application with futuristic animations.

## Features

- User registration and authentication with JWT
- Create, read, update, and delete Todo items
- Drag-and-drop reordering of Todo items
- Filter/sort Todos by completion status, due date, etc.
- Responsive design for all device sizes
- Smooth, engaging animations and transitions
- Pure CSS for styling (no CSS frameworks)

## Tech Stack

- **Frontend**: React.js (with React Beautiful DND for drag-and-drop)
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd SurnaturToDo
```

### 2. Set up the database

- Create a PostgreSQL database named `surnatur_todo`
- Run the SQL commands in `server/database.sql` to create the tables

### 3. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=surnatur_todo
DB_PASSWORD=your_postgresql_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

### 4. Set up the frontend

```bash
cd ../client
npm install
```

### 5. Run the application

#### Backend

```bash
cd ../server
npm run dev
```

#### Frontend

```bash
cd ../client
npm start
```

The application should now be running at http://localhost:3000

## Usage

1. Register a new account or login
2. Add new tasks from the dashboard
3. Click on a task to view details
4. Check the checkbox to mark a task as completed
5. Use the edit and delete buttons to modify tasks
6. Drag and drop tasks to reorder them
7. Use filters and search to find specific tasks

## Project Structure

```
SurnaturToDo/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # React components
│       ├── context/      # React context (state management)
│       └── utils/        # Utility functions
└── server/               # Backend Express application
    ├── middleware/       # Express middleware
    ├── routes/           # API routes
    └── database.sql      # Database schema
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth` - Get authenticated user

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Todos

- `GET /api/todos` - Get all todos for authenticated user
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a specific todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `PUT /api/todos/reorder` - Reorder todos (drag and drop)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
