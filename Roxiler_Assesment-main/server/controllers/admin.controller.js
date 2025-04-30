import pool from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [usersResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [storesResult] = await pool.query('SELECT COUNT(*) as total FROM stores');
    const [ratingsResult] = await pool.query('SELECT COUNT(*) as total FROM ratings');
    
    res.json({
      totalUsers: usersResult[0].total,
      totalStores: storesResult[0].total,
      totalRatings: ratingsResult[0].total
    });
    
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'An error occurred while fetching dashboard data' });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const { name, email, address } = req.query;
    
    let query = `
      SELECT s.*, 
             ROUND(AVG(r.rating), 2) as average_rating,
             u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }
    
    query += ' GROUP BY s.id ORDER BY s.name';
    
    const [stores] = await pool.query(query, params);
    res.json(stores);
    
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'An error occurred while fetching stores' });
  }
};

export const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    
    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }
    
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address cannot exceed 400 characters' });
    }
    
    // If owner_id is provided, verify the user exists and is a store_owner
    if (owner_id) {
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ? AND role = ?',
        [owner_id, 'store_owner']
      );
      
      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid store owner' });
      }
    }
    
    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );
    
    const [newStore] = await pool.query(
      'SELECT * FROM stores WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newStore[0]);
    
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'An error occurred while creating store' });
  }
};