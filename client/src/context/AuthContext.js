import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if user is already logged in
	useEffect(() => {
		const checkLoggedIn = async () => {
			if (localStorage.getItem('token')) {
				setAuthToken(localStorage.getItem('token'));

				try {
					const res = await axios.get(`${API_URL}/auth`);
					setUser(res.data);
					setIsAuthenticated(true);
				} catch (err) {
					localStorage.removeItem('token');
					setAuthToken(null);
				}
			}

			setLoading(false);
		};

		checkLoggedIn();
	}, []);

	// Set Auth Token
	const setAuthToken = (token) => {
		if (token) {
			axios.defaults.headers.common['x-auth-token'] = token;
		} else {
			delete axios.defaults.headers.common['x-auth-token'];
		}
	};

	// Register User
	const register = async (formData) => {
		try {
			const res = await axios.post(`${API_URL}/auth/register`, formData);

			localStorage.setItem('token', res.data.token);
			setAuthToken(res.data.token);

			// Get user data
			const userRes = await axios.get(`${API_URL}/auth`);
			setUser(userRes.data);
			setIsAuthenticated(true);
			setError(null);

			return true;
		} catch (err) {
			setError(err.response.data.msg || 'Registration failed');
			return false;
		}
	};

	// Login User
	const login = async (formData) => {
		try {
			const res = await axios.post(`${API_URL}/auth/login`, formData);

			localStorage.setItem('token', res.data.token);
			setAuthToken(res.data.token);

			// Get user data
			const userRes = await axios.get(`${API_URL}/auth`);
			setUser(userRes.data);
			setIsAuthenticated(true);
			setError(null);

			return true;
		} catch (err) {
			setError(err.response.data.msg || 'Login failed');
			return false;
		}
	};

	// Logout User
	const logout = () => {
		localStorage.removeItem('token');
		setAuthToken(null);
		setUser(null);
		setIsAuthenticated(false);
	};

	// Update User
	const updateUser = async (formData) => {
		try {
			const res = await axios.put(`${API_URL}/users/${user.id}`, formData);
			setUser(res.data);
			setError(null);
			return true;
		} catch (err) {
			setError(err.response.data.msg || 'Update failed');
			return false;
		}
	};

	// Clear Errors
	const clearError = () => setError(null);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				loading,
				error,
				register,
				login,
				logout,
				updateUser,
				clearError
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}; 