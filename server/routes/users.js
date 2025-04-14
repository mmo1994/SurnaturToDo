const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		// Check if user is accessing their own profile
		if (req.user.id != req.params.id) {
			return res.status(401).json({ msg: 'Not authorized' });
		}

		const user = await db.query(
			'SELECT id, name, email, created_at FROM users WHERE id = $1',
			[req.params.id]
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

// @route   PUT api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
	try {
		// Check if user is updating their own profile
		if (req.user.id != req.params.id) {
			return res.status(401).json({ msg: 'Not authorized' });
		}

		const { name, email, password } = req.body;

		// Get the current user
		const currentUser = await db.query(
			'SELECT * FROM users WHERE id = $1',
			[req.params.id]
		);

		if (currentUser.rows.length === 0) {
			return res.status(404).json({ msg: 'User not found' });
		}

		// Build update object
		const updateFields = [];
		const updateValues = [];
		let paramCount = 1;

		if (name) {
			updateFields.push(`name = $${paramCount}`);
			updateValues.push(name);
			paramCount++;
		}

		if (email) {
			// Check if email already exists for another user
			const emailCheck = await db.query(
				'SELECT * FROM users WHERE email = $1 AND id <> $2',
				[email, req.params.id]
			);

			if (emailCheck.rows.length > 0) {
				return res.status(400).json({ msg: 'Email already in use' });
			}

			updateFields.push(`email = $${paramCount}`);
			updateValues.push(email);
			paramCount++;
		}

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			updateFields.push(`password = $${paramCount}`);
			updateValues.push(hashedPassword);
			paramCount++;
		}

		// Add updated_at timestamp
		updateFields.push(`updated_at = $${paramCount}`);
		updateValues.push(new Date());
		paramCount++;

		// If nothing to update
		if (updateFields.length === 1) {
			return res.status(400).json({ msg: 'No update information provided' });
		}

		// Add the user ID to the values array
		updateValues.push(req.params.id);

		// Update user
		const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, name, email, created_at, updated_at
    `;

		const updatedUser = await db.query(updateQuery, updateValues);

		res.json(updatedUser.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router; 