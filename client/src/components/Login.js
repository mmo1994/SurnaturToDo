import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		rememberMe: false
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

	const { email, password, rememberMe } = formData;

	const onChange = (e) => {
		const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
		setFormData({ ...formData, [e.target.name]: value });
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
				<div className="auth-header">
					<h1 className="auth-title">Welcome Back</h1>
					<p className="auth-subtitle">Sign in to access your todos</p>
				</div>

				{formError && (
					<div className="alert alert-danger">
						<i className="fas fa-exclamation-circle"></i> {formError}
					</div>
				)}

				<form className="auth-form" onSubmit={onSubmit}>
					<div className="form-group">
						<label htmlFor="email" className="form-label">Email Address</label>
						<div className="input-icon-wrapper">
							<i className="fas fa-envelope input-icon"></i>
							<input
								type="email"
								name="email"
								id="email"
								className="form-control"
								value={email}
								onChange={onChange}
								placeholder="name@example.com"
								required
							/>
						</div>
						<small className="form-text">We'll never share your email with anyone else</small>
					</div>

					<div className="form-group">
						<div className="password-header">
							<label htmlFor="password" className="form-label">Password</label>
							<Link to="/forgot-password" className="forgot-password">
								Forgot Password?
							</Link>
						</div>
						<div className="input-icon-wrapper">
							<i className="fas fa-lock input-icon"></i>
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
					</div>

					<div className="form-group remember-me">
						<label className="checkbox-container">
							<input
								type="checkbox"
								name="rememberMe"
								checked={rememberMe}
								onChange={onChange}
							/>
							<span className="checkmark"></span>
							Remember me
						</label>
					</div>

					<button type="submit" className="btn btn-primary btn-block">
						<i className="fas fa-sign-in-alt"></i> Sign In
					</button>
				</form>

				<div className="auth-divider">
					<span>OR</span>
				</div>

				<div className="social-login">
					<button className="btn btn-outline btn-google">
						<i className="fab fa-google"></i> Sign in with Google
					</button>
				</div>

				<div className="auth-footer">
					<p>
						Don't have an account? <Link to="/register" className="animated-border">Sign Up</Link>
					</p>
					<p className="terms-text">
						By signing in, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login; 