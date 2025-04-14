const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body;

	try {
		// Check if user exists
		const userCheck = await db.query(
			'SELECT * FROM users WHERE email = $1',
			[email]
		);

		if (userCheck.rows.length > 0) {
			return res.status(400).json({ msg: 'User already exists' });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create user
		const newUser = await db.query(
			'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
			[name, email, hashedPassword]
		);

		// Create JWT payload
		const payload = {
			user: {
				id: newUser.rows[0].id
			}
		};

		// Sign token
		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '24h' },
			(err, token) => {
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user exists
		const user = await db.query(
			'SELECT * FROM users WHERE email = $1',
			[email]
		);

		if (user.rows.length === 0) {
			return res.status(400).json({ msg: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.rows[0].password);

		if (!isMatch) {
			return res.status(400).json({ msg: 'Invalid credentials' });
		}

		// Create JWT payload
		const payload = {
			user: {
				id: user.rows[0].id
			}
		};

		// Sign token
		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '24h' },
			(err, token) => {
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const user = await db.query(
			'SELECT id, name, email, created_at FROM users WHERE id = $1',
			[req.user.id]
		);

		if (user.rows.length === 0) {
			return res.status(404).json({ msg: 'User not found' });
		}

		res.json(user.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router; 