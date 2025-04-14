import React, { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import './TodoForm.css';

const TodoForm = ({ onComplete, todoToEdit }) => {
	const isEditing = !!todoToEdit;
	const [formData, setFormData] = useState({
		title: todoToEdit ? todoToEdit.title : '',
		description: todoToEdit ? todoToEdit.description || '' : '',
		due_date: todoToEdit && todoToEdit.due_date ? new Date(todoToEdit.due_date).toISOString().substring(0, 16) : ''
	});
	const [error, setError] = useState('');
	const { addTodo, updateTodo } = useTodos();

	const { title, description, due_date } = formData;

	const onChange = e => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		// Clear error when user types
		if (error) setError('');
	};

	const onSubmit = async e => {
		e.preventDefault();

		// Validate form
		if (!title.trim()) {
			setError('Title is required');
			return;
		}

		// Format data for API
		const todoData = {
			title: title.trim(),
			description: description.trim() || null,
			due_date: due_date || null
		};

		let success;

		if (isEditing) {
			// Update existing todo
			success = await updateTodo(todoToEdit.id, todoData);
		} else {
			// Add new todo
			success = await addTodo(todoData);
		}

		if (success && onComplete) {
			onComplete();
		}
	};

	return (
		<div className="todo-form-container">
			<form className="todo-form" onSubmit={onSubmit}>
				{error && <div className="alert alert-danger">{error}</div>}

				<div className="form-group">
					<label htmlFor="title" className="form-label">Title</label>
					<input
						type="text"
						name="title"
						id="title"
						className="form-control"
						value={title}
						onChange={onChange}
						placeholder="What needs to be done?"
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="description" className="form-label">Description (optional)</label>
					<textarea
						name="description"
						id="description"
						className="form-control"
						value={description}
						onChange={onChange}
						placeholder="Add details about this task..."
						rows="3"
					></textarea>
				</div>

				<div className="form-group">
					<label htmlFor="due_date" className="form-label">Due Date (optional)</label>
					<input
						type="datetime-local"
						name="due_date"
						id="due_date"
						className="form-control"
						value={due_date}
						onChange={onChange}
					/>
				</div>

				<div className="form-actions">
					<button type="button" className="btn btn-light" onClick={onComplete}>
						Cancel
					</button>
					<button type="submit" className="btn btn-primary">
						{isEditing ? 'Update Task' : 'Add Task'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default TodoForm; 