const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Custom CORS middleware
app.use((req, res, next) => {
	//process.env.FRONTEND_URL
	// Allow specific origins or use * for development
	const allowedOrigins = ['https://surnatur-to-do.vercel.app', 'http://localhost:3000'];
	const origin = req.headers.origin;

	if (allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}

	// Allow specific headers and methods
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	// Handle preflight requests
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	next();
});

// Middleware
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
	next();
});

// Error handler
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
	res.send('SurnaturToDo API is running');
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
}); 