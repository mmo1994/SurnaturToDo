import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
	const { user, updateUser, error, clearError, loading } = useAuth();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		password2: ''
	});
	const [formError, setFormError] = useState('');
	const [updateSuccess, setUpdateSuccess] = useState(false);
	const navigate = useNavigate();

	// Set form data from user context
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || '',
				email: user.email || '',
				password: '',
				password2: ''
			});
		}
	}, [user]);

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

		// Clear success message when user types
		if (updateSuccess) {
			setUpdateSuccess(false);
		}
	};

	const onSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		if (!name || !email) {
			setFormError('Name and email are required');
			return;
		}

		// Check if passwords match when provided
		if (password && password !== password2) {
			setFormError('Passwords do not match');
			return;
		}

		// Check password length when provided
		if (password && password.length < 6) {
			setFormError('Password must be at least 6 characters');
			return;
		}

		// Build update data (only include password if provided)
		const updateData = {
			name,
			email
		};

		if (password) {
			updateData.password = password;
		}

		// Attempt update
		const success = await updateUser(updateData);

		if (success) {
			setUpdateSuccess(true);
			// Clear password fields after successful update
			setFormData({
				...formData,
				password: '',
				password2: ''
			});
		}
	};

	if (loading) {
		return (
			<div className="profile-container">
				<div className="loader"></div>
			</div>
		);
	}

	return (
		<div className="profile-container">
			<div className="profile-card">
				<h1 className="profile-title">Your Profile</h1>
				<p className="profile-subtitle">Update your account information</p>

				{formError && (
					<div className="alert alert-danger">
						{formError}
					</div>
				)}

				{updateSuccess && (
					<div className="alert alert-success">
						Profile updated successfully!
					</div>
				)}

				<form className="profile-form" onSubmit={onSubmit}>
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

					<div className="password-section">
						<h3 className="password-title">Change Password</h3>
						<p className="password-subtitle">Leave blank to keep current password</p>

						<div className="form-group">
							<label htmlFor="password" className="form-label">New Password</label>
							<input
								type="password"
								name="password"
								id="password"
								className="form-control"
								value={password}
								onChange={onChange}
								placeholder="Enter new password"
								minLength="6"
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password2" className="form-label">Confirm New Password</label>
							<input
								type="password"
								name="password2"
								id="password2"
								className="form-control"
								value={password2}
								onChange={onChange}
								placeholder="Confirm new password"
								minLength="6"
							/>
						</div>
					</div>

					<div className="profile-actions">
						<button type="button" className="btn btn-light" onClick={() => navigate('/')}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary">
							Update Profile
						</button>
					</div>
				</form>

				<div className="account-info">
					<p>Account created: {user && new Date(user.created_at).toLocaleDateString()}</p>
				</div>
			</div>
		</div>
	);
};

export default Profile; 