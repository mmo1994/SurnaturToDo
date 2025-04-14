import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		password2: ''
	});
	const [formError, setFormError] = useState('');
	const { register, error, clearError, isAuthenticated } = useAuth();
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

	const { name, email, password, password2 } = formData;

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
		if (!name || !email || !password) {
			setFormError('Please fill in all required fields');
			return;
		}

		if (password !== password2) {
			setFormError('Passwords do not match');
			return;
		}

		if (password.length < 6) {
			setFormError('Password must be at least 6 characters');
			return;
		}

		// Remove password2 from data sent to API
		const registerData = {
			name,
			email,
			password
		};

		// Attempt register
		const success = await register(registerData);

		if (success) {
			navigate('/');
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-form-container">
				<h1 className="auth-title">Create Account</h1>
				<p className="auth-subtitle">Sign up to start organizing your tasks</p>

				{formError && (
					<div className="alert alert-danger">
						{formError}
					</div>
				)}

				<form className="auth-form" onSubmit={onSubmit}>
					<div className="form-group">
						<label htmlFor="name" className="form-label">Name</label>
						<input
							type="text"
							name="name"
							id="name"
							className="form-control"
							value={name}
							onChange={onChange}
							placeholder="Enter your name"
							required
						/>
					</div>

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
							minLength="6"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password2" className="form-label">Confirm Password</label>
						<input
							type="password"
							name="password2"
							id="password2"
							className="form-control"
							value={password2}
							onChange={onChange}
							placeholder="Confirm your password"
							minLength="6"
							required
						/>
					</div>

					<button type="submit" className="btn btn-primary btn-block">
						Sign Up
					</button>
				</form>

				<div className="auth-footer">
					<p>
						Already have an account? <Link to="/login" className="animated-border">Sign In</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register; 