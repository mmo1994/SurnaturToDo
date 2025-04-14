import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import { useTodos } from '../context/TodoContext';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import './Dashboard.css';

const Dashboard = () => {
	const { user } = useAuth();
	const {
		todos,
		loading,
		error,
		filterCriteria,
		sortCriteria,
		getTodos,
		setFilter,
		setSort,
		reorderTodos
	} = useTodos();

	const [showForm, setShowForm] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredTodos, setFilteredTodos] = useState([]);

	// Load todos on component mount - getTodos is memoized in the context
	useEffect(() => {
		getTodos();
	}, [getTodos]); // This is now safe because getTodos is wrapped in useCallback

	// Apply search filter
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredTodos(todos);
		} else {
			const filtered = todos.filter(todo =>
				todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
			);
			setFilteredTodos(filtered);
		}
	}, [todos, searchTerm]);

	// Handle drag and drop
	const handleDragEnd = async (result) => {
		const { destination, source } = result;

		// Return if dropped outside the list or no movement
		if (!destination ||
			(destination.droppableId === source.droppableId &&
				destination.index === source.index)) {
			return;
		}

		// Create a copy of the todos array
		const todosCopy = Array.from(todos);

		// Get the dragged item
		const [draggedItem] = todosCopy.splice(source.index, 1);

		// Insert the item at the destination position
		todosCopy.splice(destination.index, 0, draggedItem);

		// Create an array of todo IDs in the new order
		const todoIds = todosCopy.map(todo => todo.id);

		// Update the todo positions in the backend
		await reorderTodos(todoIds);
	};

	// Toggle the form visibility
	const toggleForm = () => {
		setShowForm(!showForm);
	};

	return (
		<div className="dashboard">
			<div className="dashboard-header">
				<div className="welcome-message">
					<h1 className="welcome-title typing-animation">Hello, {user && user.name}</h1>
					<p className="welcome-subtitle">Manage your tasks and stay organized</p>
				</div>

				<button className="btn btn-primary add-todo-btn" onClick={toggleForm}>
					{showForm ? 'Cancel' : 'Add New Task'}
				</button>
			</div>

			{showForm && <TodoForm onComplete={() => setShowForm(false)} />}

			<div className="dashboard-controls">
				<div className="search-container">
					<input
						type="text"
						className="search-input form-control"
						placeholder="Search tasks..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="filter-sort-container">
					<div className="filter-container">
						<label htmlFor="filter" className="filter-label">Filter:</label>
						<select
							id="filter"
							className="filter-select form-control"
							value={filterCriteria}
							onChange={(e) => setFilter(e.target.value)}
						>
							<option value="all">All Tasks</option>
							<option value="active">Active</option>
							<option value="completed">Completed</option>
						</select>
					</div>

					<div className="sort-container">
						<label htmlFor="sort" className="sort-label">Sort by:</label>
						<select
							id="sort"
							className="sort-select form-control"
							value={sortCriteria}
							onChange={(e) => setSort(e.target.value)}
						>
							<option value="position">Custom Order</option>
							<option value="due_date">Due Date</option>
							<option value="title">Title</option>
						</select>
					</div>
				</div>
			</div>

			{error && <div className="alert alert-danger">{error}</div>}

			{loading ? (
				<div className="loader-container">
					<div className="loader"></div>
				</div>
			) : (
				<div className="todos-container">
					{filteredTodos.length === 0 ? (
						<div className="no-todos">
							<p>No tasks found. {searchTerm ? 'Try a different search term.' : 'Create a new task to get started!'}</p>
						</div>
					) : (
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="todos">
								{(provided) => (
									<div
										className="todos-list"
										{...provided.droppableProps}
										ref={provided.innerRef}
									>
										{filteredTodos.map((todo, index) => (
											<TodoItem
												key={todo.id}
												todo={todo}
												index={index}
											/>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					)}
				</div>
			)}

			<div className="dashboard-footer">
				<p className="todo-count">
					{todos.length} task{todos.length !== 1 && 's'} total •
					{todos.filter(t => t.completed).length} completed
				</p>
			</div>
		</div>
	);
};

export default Dashboard;