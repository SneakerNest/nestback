import { pool } from '../config/database.js';

// Helper to format dates for queries
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Get financial report for specified date range
export const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required' 
      });
    }
    
    // Format dates if needed
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    console.log(`Generating financial report from ${formattedStartDate} to ${formattedEndDate}`);
    
    // Get all completed orders in the date range
    const [orders] = await pool.query(`
      SELECT 
        o.orderID,
        o.orderNumber,
        o.totalPrice as revenue,
        o.timeOrdered,
        o.deliveryStatus
      FROM \`Order\` o
      WHERE o.timeOrdered BETWEEN ? AND ?
        AND o.deliveryStatus NOT IN ('cancelled')
      ORDER BY o.timeOrdered
    `, [formattedStartDate, formattedEndDate]);
    
    if (orders.length === 0) {
      return res.status(200).json({
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        timeSeriesData: []
      });
    }
    
    // Get order items with purchase prices
    const orderIds = orders.map(order => order.orderID);
    const orderIdsPlaceholder = orderIds.map(() => '?').join(',');
    
    const [orderItems] = await pool.query(`
      SELECT 
        oi.orderID,
        oi.productID,
        oi.quantity,
        oi.purchasePrice,
        p.unitPrice as originalPrice
      FROM OrderOrderItemsProduct oi
      JOIN Product p ON oi.productID = p.productID
      WHERE oi.orderID IN (${orderIdsPlaceholder})
    `, [...orderIds]);
    
    // Calculate total financials
    let totalRevenue = 0;
    let totalCost = 0;
    
    // Group order items by order
    const orderItemsByOrder = orderItems.reduce((acc, item) => {
      if (!acc[item.orderID]) {
        acc[item.orderID] = [];
      }
      acc[item.orderID].push(item);
      return acc;
    }, {});
    
    // Calculate revenue and cost for each order
    orders.forEach(order => {
      const items = orderItemsByOrder[order.orderID] || [];
      
      // Revenue is the total price of the order
      order.revenue = parseFloat(order.revenue) || 0;
      totalRevenue += order.revenue;
      
      // Cost is 50% of the original price (or specific cost if available)
      let orderCost = 0;
      items.forEach(item => {
        // Get the original price before discount
        const originalItemPrice = parseFloat(item.originalPrice) || 0;
        // Calculate cost as 50% of original price
        const itemCost = (originalItemPrice * 0.5) * item.quantity;
        orderCost += itemCost;
      });
      
      order.cost = orderCost;
      totalCost += orderCost;
      
      // Calculate profit
      order.profit = order.revenue - order.cost;
    });
    
    // Group data by months for time series
    const timeSeriesData = groupOrdersByPeriod(orders, startDate, endDate);
    
    // Calculate total profit
    const totalProfit = totalRevenue - totalCost;
    
    res.status(200).json({
      totalRevenue,
      totalCost,
      totalProfit,
      timeSeriesData
    });
    
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ 
      message: 'Error generating financial report',
      error: error.message
    });
  }
};

// Helper to group orders by time periods (days, weeks, or months)
const groupOrdersByPeriod = (orders, startDate, endDate) => {
  // Determine grouping period based on date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  let groupingPeriod;
  if (diffDays <= 31) {
    groupingPeriod = 'day';
  } else if (diffDays <= 90) {
    groupingPeriod = 'week';
  } else {
    groupingPeriod = 'month';
  }
  
  // Group orders by the determined period
  const groupedData = {};
  
  orders.forEach(order => {
    const orderDate = new Date(order.timeOrdered);
    let periodKey;
    
    if (groupingPeriod === 'day') {
      periodKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupingPeriod === 'week') {
      // Get the week number
      const firstDayOfYear = new Date(orderDate.getFullYear(), 0, 1);
      const daysSinceFirstDay = Math.floor((orderDate - firstDayOfYear) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
      periodKey = `Week ${weekNumber}, ${orderDate.getFullYear()}`;
    } else {
      // Month
      periodKey = `${orderDate.toLocaleString('default', { month: 'short' })} ${orderDate.getFullYear()}`;
    }
    
    if (!groupedData[periodKey]) {
      groupedData[periodKey] = {
        period: periodKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        count: 0
      };
    }
    
    groupedData[periodKey].revenue += order.revenue;
    groupedData[periodKey].cost += order.cost;
    groupedData[periodKey].profit += order.profit;
    groupedData[periodKey].count += 1;
  });
  
  // Convert to array and sort by date
  return Object.values(groupedData).sort((a, b) => {
    // For simplicity, sort by period string (works for our naming convention)
    return a.period.localeCompare(b.period);
  });
};