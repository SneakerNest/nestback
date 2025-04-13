import { getAllProducts, getProductById, createProduct } from '../db/productQueries.js';

export const fetchAllProducts = async () => {
  return getAllProducts();
};

export const addNewProduct = async (productData) => {
  const {
    name,
    model,
    serialNumber,
    description,
    quantityInStock,
    price,
    warrantyStatus,
    distributorInfo
  } = productData;

  if (
    !name || !model || !serialNumber || quantityInStock == null ||
    price == null || !warrantyStatus || !distributorInfo
  ) {
    throw new Error('Missing required product fields');
  }

  return createProduct({
    name,
    model,
    serialNumber,
    description,
    quantityInStock,
    price,
    warrantyStatus,
    distributorInfo
  });
};
