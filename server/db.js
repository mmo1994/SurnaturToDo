const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Use connection string if available, otherwise use individual parameters
const pool = process.env.DATABASE_URL
	? new Pool({
		connectionString: process.env.DATABASE_URL
	})
	: new Pool({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT
	});

module.exports = {
	query: (text, params) => pool.query(text, params),
}; 