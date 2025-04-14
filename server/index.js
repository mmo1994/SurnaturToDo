const express = require('express');
// const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
// const corsOptions = {
// 	origin: process.env.NODE_ENV === 'production'
// 		? [process.env.FRONTEND_URL, process.env.BACKEND_URL]
// 		: 'http://localhost:3000',
// 	credentials: true,
// 	optionsSuccessStatus: 200
// };

// // Middleware
// app.use(cors(corsOptions));
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
	res.send(process.env.FRONTEND_URL);
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
}); 