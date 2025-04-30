import pool from '../config/database.js';

export const submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id;
    
    if (!store_id || !rating) {
      return res.status(400).json({ message: 'Store ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const [stores] = await pool.query('SELECT * FROM stores WHERE id = ?', [store_id]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const [existingRating] = await pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );
    
    if (existingRating.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, user_id, store_id]
      );
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [user_id, store_id, rating]
      );
    }
    
    res.json({ message: 'Rating submitted successfully' });
    
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'An error occurred while submitting rating' });
  }
};