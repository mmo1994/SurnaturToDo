import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

// Context
import { useAuth } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';

// Private Route component
const PrivateRoute = ({ children }) => {
	const { isAuthenticated } = useAuth();

	return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
	return (
		<Router>
			<div className="app">
				<Navbar />
				<div className="container">
					<Routes>
						<Route path="/" element={
							<PrivateRoute>
								<TodoProvider>
									<Dashboard />
								</TodoProvider>
							</PrivateRoute>
						} />
						<Route path="/profile" element={
							<PrivateRoute>
								<Profile />
							</PrivateRoute>
						} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App; 