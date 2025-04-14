const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/todos
// @desc    Get all todos for a user
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const todos = await db.query(
			'SELECT * FROM todos WHERE user_id = $1 ORDER BY position ASC, created_at DESC',
			[req.user.id]
		);

		res.json(todos.rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/todos
// @desc    Create a todo
// @access  Private
router.post('/', auth, async (req, res) => {
	const { title, description, due_date } = req.body;

	try {
		// Get the highest position value for user's todos
		const positionResult = await db.query(
			'SELECT COALESCE(MAX(position), 0) as max_position FROM todos WHERE user_id = $1',
			[req.user.id]
		);

		const position = parseInt(positionResult.rows[0].max_position) + 1;

		const newTodo = await db.query(
			`INSERT INTO todos (user_id, title, description, due_date, position) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
			[req.user.id, title, description, due_date, position]
		);

		res.json(newTodo.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   GET api/todos/:id
// @desc    Get todo by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const todo = await db.query(
			'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
			[req.params.id, req.user.id]
		);

		if (todo.rows.length === 0) {
			return res.status(404).json({ msg: 'Todo not found or not authorized' });
		}

		res.json(todo.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   PUT api/todos/:id
// @desc    Update a todo
// @access  Private
router.put('/:id', auth, async (req, res) => {
	const { title, description, due_date, is_completed } = req.body;

	try {
		// Check if todo exists and belongs to user
		const todoCheck = await db.query(
			'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
			[req.params.id, req.user.id]
		);

		if (todoCheck.rows.length === 0) {
			return res.status(404).json({ msg: 'Todo not found or not authorized' });
		}

		// Build update object
		const updateFields = [];
		const updateValues = [];
		let paramCount = 1;

		if (title !== undefined) {
			updateFields.push(`title = $${paramCount}`);
			updateValues.push(title);
			paramCount++;
		}

		if (description !== undefined) {
			updateFields.push(`description = $${paramCount}`);
			updateValues.push(description);
			paramCount++;
		}

		if (due_date !== undefined) {
			updateFields.push(`due_date = $${paramCount}`);
			updateValues.push(due_date);
			paramCount++;
		}

		if (is_completed !== undefined) {
			updateFields.push(`is_completed = $${paramCount}`);
			updateValues.push(is_completed);
			paramCount++;
		}

		// Add updated_at timestamp
		updateFields.push(`updated_at = $${paramCount}`);
		updateValues.push(new Date());
		paramCount++;

		// Add todo ID and user ID to the values array
		updateValues.push(req.params.id);
		updateValues.push(req.user.id);

		// Update todo
		const updateQuery = `
      UPDATE todos 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

		const updatedTodo = await db.query(updateQuery, updateValues);

		res.json(updatedTodo.rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   DELETE api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
	try {
		// Check if todo exists and belongs to user
		const result = await db.query(
			'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
			[req.params.id, req.user.id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ msg: 'Todo not found or not authorized' });
		}

		res.json({ msg: 'Todo removed' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   PUT api/todos/reorder
// @desc    Reorder todos
// @access  Private
router.put('/reorder', auth, async (req, res) => {
	const { todoIds } = req.body;

	if (!Array.isArray(todoIds) || todoIds.length === 0) {
		return res.status(400).json({ msg: 'Invalid todo order data' });
	}

	try {
		// Start a transaction for reordering
		await db.query('BEGIN');

		// Update positions for all provided todo IDs
		for (let i = 0; i < todoIds.length; i++) {
			const result = await db.query(
				'UPDATE todos SET position = $1, updated_at = $2 WHERE id = $3 AND user_id = $4 RETURNING id',
				[i + 1, new Date(), todoIds[i], req.user.id]
			);

			if (result.rows.length === 0) {
				// If any todo is not found or doesn't belong to the user, rollback
				await db.query('ROLLBACK');
				return res.status(404).json({
					msg: `Todo with ID ${todoIds[i]} not found or not authorized`
				});
			}
		}

		// Commit the transaction
		await db.query('COMMIT');

		// Get all updated todos
		const todos = await db.query(
			'SELECT * FROM todos WHERE user_id = $1 ORDER BY position ASC',
			[req.user.id]
		);

		res.json(todos.rows);
	} catch (err) {
		// Rollback on error
		await db.query('ROLLBACK');
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router; 