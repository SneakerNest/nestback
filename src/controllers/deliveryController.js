import { pool } from '../config/database.js';

const getEstimatedTimeById = async (req, res) => {
  try {
    // only returns the id numbers and estimated arrival time
    let id = req.params.id;
    let sql = 'SELECT orderID, deliveryID, estimatedArrival FROM `Order` WHERE orderID = ?';
    const [results, fields] = await pool.query(sql, [id]);
    res.status(200).json(results[0]);}
  catch(err)  {
    console.log(err);
    res.status(500).json({msg: "Error retrieving estimated delivery times"});
  }
}

const checkDate = async (date) => {
  //use regex
  if (date.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)) {
    return true;
  }
  return false;
}

const updateEstimatedTime = async (req, res) => {
  try {
    //some sort of check here
    if (!checkDate(req.body.estimatedArrival)) {
      res.status(400).json({msg: "Invalid Date"});
      return
    }

    let sql = 'UPDATE `Order` SET estimatedArrival = ? WHERE orderID = ?';
    const [results, fields] = await pool.query(sql, [req.body.estimatedArrival, req.params.id]);
    res.status(200).json({msg: "Estimated Time updated"});
  } catch(err) {
    console.log(err);
    res.status(500).json({msg: "Error updating Estimated Time"});
  }
}

const getOrderByCourierId = async (req, res) => {
  try {
    let id = req.params.courierid;
    let sql = 'SELECT * FROM `Order` WHERE courierID = ?';
    const [results, fields] = await pool.query(sql, [id]);
    res.status(200).json(results);}
  catch(err)  {
    console.log(err);
    res.status(500).json({msg: "Error retrieving order"});
  }
}

const getOrderById = async (req, res) => {
    try {
      const id = req.params.id;  // Added const declaration
      let sql = 'SELECT orderID, deliveryID, deliveryStatus, deliveryAddressID, estimatedArrival, courierID FROM `Order` WHERE orderID = ?';
      const [results, fields] = await pool.query(sql, [id]);
      if (results.length === 0) {
        res.status(404).json({msg: "Order not found"});
        return;
      }

      //get the delivery address
      let sql2 = 'SELECT * FROM Address WHERE addressID = ?';
      const [results2, fields2] = await pool.query(sql2, [results[0].deliveryAddressID]);

      res.status(200).json({order: results[0], deliveryAddress: results2[0]});
  }
    catch(err)  {
      console.log(err);
      res.status(500).json({msg: "Error retrieving order"});
    }
  }

const updateDeliveryStatus = async (req, res) => {
  try {
    let sql = 'UPDATE `Order` SET deliveryStatus = ? WHERE orderID = ?';
    const [results, fields] = await pool.query(sql, [req.body.deliveryStatus, req.params.id]);
    res.status(200).json({msg: "Delivery Status updated"});
  } catch(err) {
    console.log(err);
    res.status(500).json({msg: "Error updating Delivery Status"});
  }
}

const getDeliveryStatus = async (req, res) => {
    try {
      const id = req.params.id;  // Added const declaration
      let sql = 'SELECT deliveryStatus FROM `Order` WHERE orderID = ?';
      const [results, fields] = await pool.query(sql, [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ msg: "Order not found" });
      }
      
      res.status(200).json(results[0]);
    } catch(err) {
      console.error(err);  // Changed to console.error for better error logging
      res.status(500).json({ msg: "Error retrieving delivery status" });
    }
};

export {
  getEstimatedTimeById,
  updateEstimatedTime,
  getOrderByCourierId,
  getOrderById,
  updateDeliveryStatus,
  getDeliveryStatus
};