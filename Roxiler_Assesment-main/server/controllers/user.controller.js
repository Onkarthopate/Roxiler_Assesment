import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'An error occurred while fetching user data' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];
    
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY name';
    
    const [users] = await pool.query(query, params);
    res.json(users);
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'An error occurred while fetching users' });
  }
};

// Function to add a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validate input
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email is already registered
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'An error occurred while creating the user' });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // Query user details including their role and ratings if they are a store owner
    const [userDetails] = await pool.query(`
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at, s.rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.user_id
      WHERE u.id = ?
    `, [userId]);

    if (userDetails.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userDetails[0]);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'An error occurred while fetching user details' });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, address, role } = req.body;

  try {
    // Check if user exists
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user
    await pool.query(
      'UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?',
      [name, email, address, role, userId]
    );

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};
