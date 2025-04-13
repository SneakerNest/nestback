import { fetchAllProducts, addNewProduct } from '../services/productService.js';

export const getProducts = async (req, res) => {
  try {
    const products = await fetchAllProducts();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await addNewProduct(req.body);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};