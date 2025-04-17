import { pool } from '../config/database.js';

const getAddressById = async (addressid) => {
  try {
    const sql = 'SELECT * FROM Address WHERE addressID = ?';
    const [results] = await pool.query(sql, [addressid]);
    if (results.length === 0) throw new Error('Address not found');
    return results;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

const getAddress = async (req, res) => {
  try {
    const addressid = req.params.addressid;
    const address = await getAddressById(addressid);
    return res.status(200).json(address[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};

const getUserAddress = async (req, res) => {
  try {
    const username = req.params.username;
    const sql = 'SELECT * FROM Customer WHERE username = ?';
    const [results] = await pool.query(sql, [username]);
    if (results.length === 0) throw new Error('User not found');
    const address = await getAddressById(results[0].addressID);
    return res.status(200).json(address[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};

const getPersonalAddress = async (req, res) => {
  try {
    const username = req.username;
    const sql = 'SELECT * FROM Customer WHERE username = ?';
    const [results] = await pool.query(sql, [username]);
    if (results.length === 0) throw new Error('User not found');
    const address = await getAddressById(results[0].addressID);
    return res.status(200).json(address[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};

const createAddress = async (req, res) => {
  try {
    const sql = `
      INSERT INTO Address 
      (addressTitle, country, city, province, zipCode, streetAddress, longitude, latitude) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [results] = await pool.query(sql, [
      req.body.addressTitle,
      req.body.country,
      req.body.city,
      req.body.province,
      req.body.zipCode,
      req.body.streetAddress,
      0, // longitude default
      0  // latitude default
    ]);

    return res.status(200).json({ message: 'Address created', addressID: results.insertId });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const updateAddress = async (req, res) => {
  try {
    const addressid = req.params.addressid;
    const { addressTitle, country, city, province, zipCode, streetAddress, longitude, latitude } = req.body;

    const fields = [];
    if (addressTitle) fields.push(`addressTitle = '${addressTitle}'`);
    if (country) fields.push(`country = '${country}'`);
    if (city) fields.push(`city = '${city}'`);
    if (province) fields.push(`province = '${province}'`);
    if (zipCode) fields.push(`zipCode = '${zipCode}'`);
    if (streetAddress) fields.push(`streetAddress = '${streetAddress}'`);
    if (longitude) fields.push(`longitude = '${longitude}'`);
    if (latitude) fields.push(`latitude = '${latitude}'`);

    const sql = `UPDATE Address SET ${fields.join(', ')} WHERE addressID = ?`;
    await pool.query(sql, [addressid]);

    return res.status(200).send('Address updated');
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressid = req.params.addressid;
    const sql = 'DELETE FROM Address WHERE addressID = ?';
    await pool.query(sql, [addressid]);
    return res.status(200).send('Address deleted');
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const getAddressWrapper = async (req) => {
  let addressData;
  const mockRes = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      addressData = data;
    },
    send(data) {
      addressData = data;
    }
  };
  await getAddress(req, mockRes);
  if (!addressData) throw new Error('No data returned from getAddress');
  return addressData;
};

export {
  getAddress,
  getUserAddress,
  getPersonalAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressWrapper
};