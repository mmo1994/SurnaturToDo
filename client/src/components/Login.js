import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	const [formError, setFormError] = useState('');
	const { login, error, clearError, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// Redirect if authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/');
		}
	}, [isAuthenticated, navigate]);

	// Set form error from auth context
	useEffect(() => {
		if (error) {
			setFormError(error);
		}
	}, [error]);

	const { email, password } = formData;

	const onChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		// Clear errors when user types
		if (formError) {
			setFormError('');
			clearError();
		}
	};

	const onSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		if (!email || !password) {
			setFormError('Please fill in all fields');
			return;
		}

		// Attempt login
		const success = await login(formData);

		if (success) {
			navigate('/');
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-form-container">
				<h1 className="auth-title">Welcome Back</h1>
				<p className="auth-subtitle">Sign in to access your todos</p>

				{formError && (
					<div className="alert alert-danger">
						{formError}
					</div>
				)}

				<form className="auth-form" onSubmit={onSubmit}>
					<div className="form-group">
						<label htmlFor="email" className="form-label">Email</label>
						<input
							type="email"
							name="email"
							id="email"
							className="form-control"
							value={email}
							onChange={onChange}
							placeholder="Enter your email"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password" className="form-label">Password</label>
						<input
							type="password"
							name="password"
							id="password"
							className="form-control"
							value={password}
							onChange={onChange}
							placeholder="Enter your password"
							required
						/>
					</div>

					<button type="submit" className="btn btn-primary btn-block">
						Sign In
					</button>
				</form>

				<div className="auth-footer">
					<p>
						Don't have an account? <Link to="/register" className="animated-border">Sign Up</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login; 