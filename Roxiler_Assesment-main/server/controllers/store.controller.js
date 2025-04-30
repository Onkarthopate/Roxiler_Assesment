import pool from '../config/database.js';

export const getAllStores = async (req, res) => {
  try {
    const { name, email, address } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT s.*, 
             ROUND(AVG(r.rating), 2) as average_rating,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [userId];
    
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

export const getStoreOwnerStore = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const query = `
      SELECT s.*, ROUND(AVG(r.rating), 2) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `;
    
    const [stores] = await pool.query(query, [ownerId]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found for this owner' });
    }
    
    res.json(stores[0]);
    
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'An error occurred while fetching store data' });
  }
};

export const getStoreOwnerRatings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const query = `
      SELECT r.*, u.name as user_name
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE s.owner_id = ?
      ORDER BY r.created_at DESC
    `;
    
    const [ratings] = await pool.query(query, [ownerId]);
    res.json(ratings);
    
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'An error occurred while fetching ratings' });
  }
};