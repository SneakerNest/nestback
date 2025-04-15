import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const getBillingInfo = async (req, res) => {
  try {
    const sql1 = 'SELECT * FROM Customer WHERE username = ?';
    const [customers] = await pool.promise().query(sql1, [req.username]);
    const customerID = customers[0].customerID;

    const sql2 = 'SELECT * FROM BillingInfo WHERE customerID = ?';
    const [billingInfos] = await pool.promise().query(sql2, [customerID]);

    billingInfos.forEach(info => delete info.creditCardNo);

    return res.status(200).json(billingInfos);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error retrieving billing information' });
  }
};

const getBillingInfoById = async (req, res) => {
  try {
    const sql1 = 'SELECT * FROM BillingInfo WHERE billingID = ?';
    const [billing] = await pool.promise().query(sql1, [req.params.id]);

    const sql2 = 'SELECT * FROM Customer WHERE customerID = ?';
    const [customer] = await pool.promise().query(sql2, [billing[0].customerID]);

    if (customer[0].username !== req.username) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    delete billing[0].creditCardNo;
    return res.status(200).json(billing[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error retrieving billing information' });
  }
};

const createBillingInfo = async (req, res) => {
  try {
    const sql1 = 'SELECT * FROM Customer WHERE username = ?';
    const [customer] = await pool.promise().query(sql1, [req.username]);
    const customerID = customer[0].customerID;

    let addressID;
    if (req.body.address) {
      const { addressTitle, country, city, zipCode, streetAddress } = req.body.address;
      const sql2 = 'INSERT INTO Address (addressTitle, country, city, zipCode, streetAddress) VALUES (?, ?, ?, ?, ?)';
      const [address] = await pool.promise().query(sql2, [addressTitle, country, city, zipCode, streetAddress]);
      addressID = address.insertId;
    } else if (req.body.addressID) {
      addressID = req.body.addressID;
    } else {
      return res.status(400).json({ msg: 'Address or addressID required' });
    }

    const cardHash = await bcrypt.hash(req.body.creditCardNo, 10);
    const sql3 = 'INSERT INTO BillingInfo (customerID, creditCardNo, creditCardEXP, addressID) VALUES (?, ?, ?, ?)';
    await pool.promise().query(sql3, [customerID, cardHash, req.body.creditCardEXP, addressID]);

    return res.status(200).json({ msg: 'Billing information created' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error creating billing information' });
  }
};

const updateBillingInfo = async (req, res) => {
  try {
    const sql1 = 'SELECT * FROM BillingInfo WHERE billingID = ?';
    const [billing] = await pool.promise().query(sql1, [req.params.id]);

    const sql2 = 'SELECT * FROM Customer WHERE customerID = ?';
    const [customer] = await pool.promise().query(sql2, [billing[0].customerID]);

    if (customer[0].username !== req.username) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (req.body.address || req.body.addressID) {
      let addressID;
      if (req.body.address) {
        const { addressTitle, country, city, zipCode, streetAddress } = req.body.address;
        const sql3 = 'INSERT INTO Address (addressTitle, country, city, zipCode, streetAddress) VALUES (?, ?, ?, ?, ?)';
        const [address] = await pool.promise().query(sql3, [addressTitle, country, city, zipCode, streetAddress]);
        addressID = address.insertId;
      } else {
        addressID = req.body.addressID;
      }

      const sql4 = 'UPDATE BillingInfo SET addressID = ? WHERE billingID = ?';
      await pool.promise().query(sql4, [addressID, req.params.id]);
    }

    if (req.body.creditCardNo && req.body.creditCardEXP) {
      const cardHash = await bcrypt.hash(req.body.creditCardNo, 10);
      const sql5 = 'UPDATE BillingInfo SET creditCardNo = ?, creditCardEXP = ? WHERE billingID = ?';
      await pool.promise().query(sql5, [cardHash, req.body.creditCardEXP, req.params.id]);
    }

    return res.status(200).json({ msg: 'Billing information updated' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error updating billing information' });
  }
};

const deleteBillingInfo = async (req, res) => {
  try {
    const sql1 = 'SELECT * FROM BillingInfo WHERE billingID = ?';
    const [billing] = await pool.promise().query(sql1, [req.params.id]);

    const sql2 = 'SELECT * FROM Customer WHERE customerID = ?';
    const [customer] = await pool.promise().query(sql2, [billing[0].customerID]);

    if (customer[0].username !== req.username) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const sql3 = 'DELETE FROM BillingInfo WHERE billingID = ?';
    await pool.promise().query(sql3, [req.params.id]);

    return res.status(200).json({ msg: 'Billing information deleted' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error deleting billing information' });
  }
};

export {
  getBillingInfo,
  getBillingInfoById,
  createBillingInfo,
  updateBillingInfo,
  deleteBillingInfo
};