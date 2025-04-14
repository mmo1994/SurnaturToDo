import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TodoContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useTodos = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
	const [todos, setTodos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filteredTodos, setFilteredTodos] = useState([]);
	const [filterCriteria, setFilterCriteria] = useState('all'); // all, completed, active
	const [sortCriteria, setSortCriteria] = useState('position'); // position, due_date, title

	const { isAuthenticated } = useAuth();

	// Filter and sort todos
	const filterAndSortTodos = useCallback(() => {
		// Filter todos
		let filtered = [...todos];

		if (filterCriteria === 'completed') {
			filtered = filtered.filter(todo => todo.completed);
		} else if (filterCriteria === 'active') {
			filtered = filtered.filter(todo => !todo.completed);
		}

		// Sort todos
		if (sortCriteria === 'position') {
			filtered.sort((a, b) => a.position - b.position);
		} else if (sortCriteria === 'due_date') {
			filtered.sort((a, b) => {
				if (!a.due_date) return 1;
				if (!b.due_date) return -1;
				return new Date(a.due_date) - new Date(b.due_date);
			});
		} else if (sortCriteria === 'title') {
			filtered.sort((a, b) => a.title.localeCompare(b.title));
		}

		setFilteredTodos(filtered);
	}, [todos, filterCriteria, sortCriteria]);

	// Get all todos - wrapped in useCallback to prevent infinite loops
	const getTodos = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${API_URL}/todos`);
			setTodos(res.data.sort((a, b) => a.position - b.position));
			setError(null);
		} catch (err) {
			setError('Error loading todos');
		}
		setLoading(false);
	}, []);

	// Get todos when authenticated
	useEffect(() => {
		if (isAuthenticated) {
			getTodos();
		} else {
			setTodos([]);
			setLoading(false);
		}
	}, [isAuthenticated, getTodos]);

	// Filter and sort todos when they change
	useEffect(() => {
		filterAndSortTodos();
	}, [filterAndSortTodos]);

	// Add todo
	const addTodo = async (todo) => {
		try {
			const res = await axios.post(`${API_URL}/todos`, todo);
			setTodos([...todos, res.data]);
			return res.data;
		} catch (err) {
			setError('Error adding todo');
			return null;
		}
	};

	// Delete todo
	const deleteTodo = async (id) => {
		try {
			await axios.delete(`${API_URL}/todos/${id}`);
			setTodos(todos.filter(todo => todo.id !== id));
			return true;
		} catch (err) {
			setError('Error deleting todo');
			return false;
		}
	};

	// Update todo
	const updateTodo = async (id, updates) => {
		try {
			const res = await axios.put(`${API_URL}/todos/${id}`, updates);
			setTodos(todos.map(todo => (todo.id === id ? res.data : todo)));
			return res.data;
		} catch (err) {
			setError('Error updating todo');
			return null;
		}
	};

	// Toggle complete
	const toggleComplete = async (id) => {
		const todo = todos.find(todo => todo.id === id);
		if (!todo) return false;

		return await updateTodo(id, { completed: !todo.completed });
	};

	// Reorder todos
	const reorderTodos = async (newOrderIds) => {
		try {
			// Create position updates with the new order
			const updates = newOrderIds.map((id, index) => ({
				id,
				position: index
			}));

			const res = await axios.put(`${API_URL}/todos/reorder`, { updates });

			// Update local state with the new order
			const updatedTodos = res.data.sort((a, b) => a.position - b.position);
			setTodos(updatedTodos);

			return true;
		} catch (err) {
			setError('Error reordering todos');
			return false;
		}
	};

	// Set filter criteria
	const setFilter = (criteria) => {
		setFilterCriteria(criteria);
	};

	// Set sort criteria
	const setSort = (criteria) => {
		setSortCriteria(criteria);
	};

	// Clear Errors
	const clearError = () => setError(null);

	return (
		<TodoContext.Provider
			value={{
				todos: filteredTodos,
				loading,
				error,
				filterCriteria,
				sortCriteria,
				getTodos,
				addTodo,
				deleteTodo,
				updateTodo,
				toggleComplete,
				reorderTodos,
				setFilter,
				setSort,
				clearError
			}}
		>
			{children}
		</TodoContext.Provider>
	);
}; 