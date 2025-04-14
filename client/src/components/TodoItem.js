import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useTodos } from '../context/TodoContext';
import TodoForm from './TodoForm';
import './TodoItem.css';

const TodoItem = ({ todo, index }) => {
	const { title, description, due_date, completed, id } = todo;
	const { deleteTodo, toggleComplete } = useTodos();
	const [showDetails, setShowDetails] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false);

	const handleToggleComplete = async () => {
		await toggleComplete(id);
	};

	const handleDelete = async () => {
		if (window.confirm('Are you sure you want to delete this task?')) {
			await deleteTodo(id);
		}
	};

	const handleEdit = () => {
		setShowEditForm(true);
	};

	const handleShowDetails = () => {
		setShowDetails(!showDetails);
	};

	// Format the due date for display
	const formatDueDate = () => {
		if (!due_date) return null;

		const dueDate = new Date(due_date);
		const now = new Date();
		const isToday = dueDate.toDateString() === now.toDateString();
		const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === dueDate.toDateString();

		const formattedDate = dueDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
		});

		const formattedTime = dueDate.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});

		if (isToday) {
			return `Today at ${formattedTime}`;
		} else if (isTomorrow) {
			return `Tomorrow at ${formattedTime}`;
		} else {
			return `${formattedDate} at ${formattedTime}`;
		}
	};

	if (showEditForm) {
		return <TodoForm todoToEdit={todo} onComplete={() => setShowEditForm(false)} />;
	}

	return (
		<Draggable draggableId={id.toString()} index={index}>
			{(provided, snapshot) => (
				<div
					className={`todo-item ${completed ? 'completed' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					<div className="todo-header">
						<div className="todo-status">
							<input
								type="checkbox"
								className="todo-checkbox"
								checked={completed}
								onChange={handleToggleComplete}
								title={completed ? 'Mark as incomplete' : 'Mark as completed'}
							/>
						</div>

						<div className="todo-content" onClick={handleShowDetails}>
							<h3 className={`todo-title ${completed ? 'completed' : ''}`}>{title}</h3>

							{due_date && (
								<span className={`todo-due-date ${isOverdue(due_date) && !completed ? 'overdue' : ''}`}>
									{formatDueDate()}
								</span>
							)}
						</div>

						<div className="todo-actions">
							<button className="todo-action-btn edit-btn" onClick={handleEdit} title="Edit">
								<i className="edit-icon">✎</i>
							</button>
							<button className="todo-action-btn delete-btn" onClick={handleDelete} title="Delete">
								<i className="delete-icon">×</i>
							</button>
						</div>
					</div>

					{(showDetails && description) && (
						<div className="todo-details">
							<p className="todo-description">{description}</p>
						</div>
					)}
				</div>
			)}
		</Draggable>
	);
};

// Helper function to check if a due date is overdue
const isOverdue = (dueDate) => {
	return new Date(dueDate) < new Date();
};

export default TodoItem; 