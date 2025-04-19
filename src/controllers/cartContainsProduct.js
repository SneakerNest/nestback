import { pool } from '../config/database.js';

// Kullanıcının sepetindeki ürünleri listele
const getCartProducts = async (req, res) => {
  try {
    const { fingerprint } = req.cookies; // Kullanıcının fingerprint'i (cookie'den alınır)

    if (!fingerprint) {
      return res.status(400).json({ error: 'No fingerprint found in cookies.' });
    }

    // Kullanıcının mevcut sepetini al
    const [cartRows] = await pool.promise().query(
      'SELECT cartID FROM Cart WHERE fingerprint = ? AND timeCreated >= NOW() - INTERVAL 7 DAY',
      [fingerprint]
    );

    if (!cartRows.length) {
      return res.status(404).json({ error: 'No active cart found for the user.' });
    }

    const cartID = cartRows[0].cartID;

    // Sepetteki ürünleri ve detaylarını al
    const [productRows] = await pool.promise().query(
      `SELECT 
        ccp.cartID,
        ccp.productID,
        ccp.quantity,
        p.name AS productName,
        p.unitPrice AS productPrice
      FROM 
        CartContainsProduct ccp
      JOIN 
        Product p ON ccp.productID = p.productID
      WHERE 
        ccp.cartID = ?`,
      [cartID]
    );

    // Sepet boş ise mesaj döndür
    if (!productRows.length) {
      return res.status(200).json({ message: 'Cart is empty.', products: [] });
    }

    // Sepet bilgilerini döndür
    res.status(200).json({
      cartID: cartID,
      products: productRows,
    });
  } catch (error) {
    console.error('Error fetching cart products:', error);
    res.status(500).json({ error: 'Failed to fetch cart products.' });
  }
};

export {
  getCartProducts
};