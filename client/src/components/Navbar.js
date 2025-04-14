import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();
	const [greeting, setGreeting] = useState('');
	const [isScrolled, setIsScrolled] = useState(false);

	// Set greeting based on time of day
	useEffect(() => {
		const hour = new Date().getHours();
		let greetingText = '';

		if (hour < 12) {
			greetingText = 'Good Morning';
		} else if (hour < 18) {
			greetingText = 'Good Afternoon';
		} else {
			greetingText = 'Good Evening';
		}

		setGreeting(greetingText);
	}, []);

	// Add shadow to navbar on scroll
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
			<div className="navbar-container">
				<Link to="/" className="navbar-logo animated-border">
					<span className="logo-text">SurnaturToDo</span>
				</Link>

				<div className="navbar-menu">
					{isAuthenticated ? (
						<>
							<div className="navbar-greeting typing-animation">
								<span>{greeting}, {user && user.name}</span>
							</div>
							<ul className="navbar-links">
								<li>
									<Link to="/" className="navbar-link animated-border">Dashboard</Link>
								</li>
								<li>
									<Link to="/profile" className="navbar-link animated-border">Profile</Link>
								</li>
								<li>
									<button onClick={handleLogout} className="btn btn-light">Logout</button>
								</li>
							</ul>
						</>
					) : (
						<ul className="navbar-links">
							<li>
								<Link to="/login" className="navbar-link animated-border">Login</Link>
							</li>
							<li>
								<Link to="/register" className="btn btn-primary">Sign Up</Link>
							</li>
						</ul>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar; 