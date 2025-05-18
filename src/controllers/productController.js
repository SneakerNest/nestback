import { pool } from '../config/database.js';

// Get all products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.categoryID,
                c.name as categoryName,
                GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
            FROM Product p
            INNER JOIN CategoryCategorizesProduct ccp ON p.productID = ccp.productID
            INNER JOIN Category c ON ccp.categoryID = c.categoryID
            LEFT JOIN Pictures pic ON p.productID = pic.productID
            WHERE p.showProduct = true AND p.unitPrice > 0
            GROUP BY p.productID, c.categoryID, c.name, p.name, p.unitPrice, 
                     p.description, p.brand, p.material, p.warrantyMonths, 
                     p.color, p.stock, p.discountPercentage, p.showProduct
            ORDER BY c.name, p.name
        `;

        const [products] = await pool.query(query);

        // Transform the results into a category-based structure
        const productsByCategory = products.reduce((acc, product) => {
            const {
                categoryID,
                categoryName,
                pictures,
                ...productDetails
            } = product;

            // Calculate discounted price
            const discountedPrice = (
                productDetails.unitPrice * (1 - productDetails.discountPercentage / 100)
            ).toFixed(2);

            // Format the product data
            const formattedProduct = {
                ...productDetails,
                discountedPrice,
                pictures: pictures ? pictures.split(',') : []
            };

            // Add to category group
            if (!acc[categoryID]) {
                acc[categoryID] = {
                    categoryId: categoryID,
                    categoryName: categoryName,
                    products: []
                };
            }

            acc[categoryID].products.push(formattedProduct);
            return acc;
        }, {});

        // Convert to array format
        const response = Object.values(productsByCategory);
        res.json(response);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ 
            message: 'Error fetching products by category', 
            error: error.message 
        });
    }
};

// Get products for a specific category
export const getProductsForCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const query = `
            SELECT 
                p.*,
                c.name as categoryName,
                GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
            FROM Product p
            INNER JOIN CategoryCategorizesProduct ccp ON p.productID = ccp.productID
            INNER JOIN Category c ON ccp.categoryID = c.categoryID
            LEFT JOIN Pictures pic ON p.productID = pic.productID
            WHERE c.categoryID = ? AND p.showProduct = true AND p.unitPrice > 0
            GROUP BY p.productID
            ORDER BY p.name
        `;

        const [products] = await pool.query(query, [categoryId]);

        if (products.length === 0) {
            return res.status(404).json({ 
                message: 'No products found in this category' 
            });
        }

        // Format the response
        const formattedProducts = products.map(product => ({
            ...product,
            discountedPrice: (
                product.unitPrice * (1 - product.discountPercentage / 100)
            ).toFixed(2),
            pictures: product.pictures ? product.pictures.split(',') : []
        }));

        res.json({
            categoryId,
            categoryName: products[0].categoryName,
            products: formattedProducts
        });
    } catch (error) {
        console.error('Error fetching products for category:', error);
        res.status(500).json({ 
            message: 'Error fetching products for category', 
            error: error.message 
        });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        console.log('getCategories function called');
        
        // Get all categories from database
        const query = `
            SELECT 
                categoryID,
                name,
                description,
                parentCategoryID
            FROM Category
            ORDER BY categoryID
        `;

        const [categories] = await pool.query(query);
        console.log(`Found ${categories.length} categories:`, JSON.stringify(categories));
        
        // Simply use the category name for all images - no placeholders
        for (let category of categories) {
            // For all categories, the image will be the category name
            category.image = `${category.name}.jpg`;
            
            // Find subcategories for parent categories
            if (!category.parentCategoryID) {
                const subcategories = categories.filter(
                    subcat => subcat.parentCategoryID === category.categoryID
                ).map(subcat => subcat.name);
                
                category.subcategories = subcategories;
            }
        }
        
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            message: 'Error fetching categories', 
            error: error.message 
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
            FROM Product p
            LEFT JOIN Pictures pic ON p.productID = pic.productID
            WHERE p.showProduct = true AND p.unitPrice > 0
            GROUP BY p.productID
            ORDER BY p.name
        `;

        const [products] = await pool.query(query);

        const formattedProducts = products.map(product => ({
            ...product,
            discountedPrice: (
                product.unitPrice * (1 - product.discountPercentage / 100)
            ).toFixed(2),
            pictures: product.pictures ? product.pictures.split(',') : []
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            message: 'Error fetching products', 
            error: error.message 
        });
    }
};

// Get footwear categories
export const getFootwearCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                c1.categoryID,
                c1.name,
                c1.description,
                COUNT(c2.categoryID) as subcategoryCount
            FROM Category c1
            LEFT JOIN Category c2 ON c1.categoryID = c2.parentCategoryID
            WHERE c1.name IN ('Sneakers', 'Casual', 'Boots', 'SlippersSandals')
            GROUP BY c1.categoryID, c1.name, c1.description
            ORDER BY 
                CASE c1.name
                    WHEN 'Sneakers' THEN 1
                    WHEN 'Casual' THEN 2
                    WHEN 'Boots' THEN 3
                    WHEN 'SlippersSandals' THEN 4
                END
        `;

        const [categories] = await pool.query(query);

        if (categories.length === 0) {
            return res.status(404).json({ 
                message: 'No footwear categories found' 
            });
        }

        res.json(categories);
    } catch (error) {
        console.error('Error fetching footwear categories:', error);
        res.status(500).json({ 
            message: 'Error fetching footwear categories', 
            error: error.message 
        });
    }
};

// Get subcategory products
export const getSubcategoryProducts = async (req, res) => {
    try {
        const { parentId } = req.params;

        const query = `
            SELECT 
                c.categoryID,
                c.name as subcategoryName,
                c.description as subcategoryDescription,
                c.image as subcategoryImage,
                p.*,
                GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
            FROM Category c
            LEFT JOIN CategoryCategorizesProduct ccp ON c.categoryID = ccp.categoryID
            LEFT JOIN Product p ON ccp.productID = p.productID AND p.showProduct = true AND p.unitPrice > 0
            LEFT JOIN Pictures pic ON p.productID = pic.productID
            WHERE c.parentCategoryID = ?
            GROUP BY 
                c.categoryID, 
                c.name, 
                c.description, 
                c.image,
                p.productID
            ORDER BY c.name, p.name
        `;

        const [results] = await pool.query(query, [parentId]);

        if (results.length === 0) {
            return res.status(404).json({ 
                message: 'No subcategories or products found for this parent category' 
            });
        }

        // Transform the results into subcategory-based structure
        const subcategoriesMap = results.reduce((acc, row) => {
            if (!row.categoryID) return acc;

            if (!acc[row.categoryID]) {
                acc[row.categoryID] = {
                    subcategoryId: row.categoryID,
                    name: row.subcategoryName,
                    description: row.subcategoryDescription,
                    image: row.subcategoryImage,
                    products: []
                };
            }

            if (row.productID) {
                const product = {
                    productID: row.productID,
                    name: row.name,
                    unitPrice: row.unitPrice,
                    description: row.description,
                    brand: row.brand,
                    color: row.color,
                    stock: row.stock,
                    discountPercentage: row.discountPercentage,
                    discountedPrice: (
                        row.unitPrice * (1 - row.discountPercentage / 100)
                    ).toFixed(2),
                    pictures: row.pictures ? row.pictures.split(',') : []
                };
                acc[row.categoryID].products.push(product);
            }

            return acc;
        }, {});

        const response = Object.values(subcategoriesMap);
        res.json(response);
    } catch (error) {
        console.error('Error fetching subcategory products:', error);
        res.status(500).json({ 
            message: 'Error fetching subcategory products', 
            error: error.message 
        });
    }
};

// Get parent category products
export const getParentCategoryProducts = async (req, res) => {
    try {
        const { parentId } = req.params;

        const query = `
            SELECT DISTINCT
                p.*,
                GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
            FROM Product p
            INNER JOIN CategoryCategorizesProduct ccp ON p.productID = ccp.productID
            INNER JOIN Category subcat ON ccp.categoryID = subcat.categoryID
            LEFT JOIN Pictures pic ON p.productID = pic.productID
            WHERE subcat.parentCategoryID = ?
                AND p.showProduct = true AND p.unitPrice > 0
            GROUP BY 
                p.productID, 
                p.name,
                p.stock,
                p.unitPrice,
                p.overallRating,
                p.discountPercentage,
                p.description,
                p.timeListed,
                p.brand,
                p.color,
                p.showProduct,
                p.supplierID,
                p.material,
                p.warrantyMonths,
                p.serialNumber,
                p.popularity
            ORDER BY p.name
        `;

        const [products] = await pool.query(query, [parentId]);

        if (products.length === 0) {
            return res.status(404).json({ 
                message: 'No products found in this category' 
            });
        }

        // Format products with discounted prices and pictures
        const formattedProducts = products.map(product => ({
            ...product,
            discountedPrice: (
                product.unitPrice * (1 - product.discountPercentage / 100)
            ).toFixed(2),
            pictures: product.pictures ? product.pictures.split(',') : []
        }));

        res.json({
            categoryId: parseInt(parentId),
            productCount: products.length,
            products: formattedProducts
        });
    } catch (error) {
        console.error('Error fetching parent category products:', error);
        res.status(500).json({ 
            message: 'Error fetching parent category products', 
            error: error.message 
        });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const query = `
            SELECT 
                p.*,
                s.name as supplierName,
                GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
            FROM Product p
            LEFT JOIN Pictures pic ON p.productID = pic.productID
            LEFT JOIN Supplier s ON p.supplierID = s.supplierID
            WHERE p.productID = ? AND p.showProduct = true
            GROUP BY 
                p.productID, 
                p.name,
                p.stock,
                p.unitPrice,
                p.overallRating,
                p.discountPercentage,
                p.description,
                p.timeListed,
                p.brand,
                p.color,
                p.showProduct,
                p.supplierID,
                p.material,
                p.warrantyMonths,
                p.serialNumber,
                p.popularity,
                s.name
        `;

        const [products] = await pool.query(query, [productId]);

        if (products.length === 0) {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }

        const product = products[0];
        const formattedProduct = {
            ...product,
            discountedPrice: (
                product.unitPrice * (1 - product.discountPercentage / 100)
            ).toFixed(2),
            pictures: product.pictures ? product.pictures.split(',') : []
        };

        res.json(formattedProduct);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ 
            message: 'Error fetching product', 
            error: error.message 
        });
    }
};

// Get product category
export const getProductCategory = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT c.name as categoryName 
            FROM Category c
            JOIN CategoryCategorizesProduct ccp ON c.categoryID = ccp.categoryID
            WHERE ccp.productID = ?
        `, [req.params.productId]);

        if (result.length === 0) {
            return res.status(404).json({ msg: 'Category not found for this product' });
        }

        res.json({ categoryName: result[0].categoryName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error retrieving product category' });
    }
};

// Update product stock
export const updateProductStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;

        // Validate stock value
        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                message: 'Invalid stock value. Must be a number greater than or equal to 0'
            });
        }

        const query = `
            UPDATE Product 
            SET stock = ?
            WHERE productID = ?
        `;

        await pool.query(query, [stock, productId]);

        res.status(200).json({
            message: 'Stock updated successfully',
            productId,
            newStock: stock
        });
    } catch (error) {
        console.error('Error updating product stock:', error);
        res.status(500).json({ 
            message: 'Error updating product stock', 
            error: error.message 
        });
    }
};

export const createPendingProduct = async (req, res) => {
  try {
    const { name, categoryID, subcategory, description, stock } = req.body;
    
    // Validate required fields
    if (!name || !categoryID || !stock) {
      return res.status(400).json({ message: 'Name, category, and stock are required' });
    }
    
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Add showProduct=false
      const [productResult] = await conn.query(
        `INSERT INTO Product 
         (name, description, stock, brand, supplierID, material, 
          warrantyMonths, serialNumber, popularity, overallRating, 
          unitPrice, discountPercentage, color, showProduct) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          description || '',
          stock,
          subcategory || 'Generic',  // Use subcategory as brand if provided
          1,                         // Default supplierID
          'Leather',                 // Default material
          6,                         // Default warranty months
          `SN-FB-${Math.floor(Math.random() * 10000)}`, // Random serial number
          0,                         // Default popularity
          0,                         // Default rating
          0,                         // Default price (will be set by sales manager)
          0,                         // Default discount
          'Default',                 // Default color
          0                          // Not visible to customers
        ]
      );
      
      const productId = productResult.insertId;
      
      // Connect product to category
      await conn.query(
        'INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES (?, ?)',
        [categoryID, productId]
      );
      
      // Handle image upload
      if (req.file) {
        const imageName = `product_${productId}_${Date.now()}${path.extname(req.file.originalname)}`;
        const imagePath = path.join(__dirname, '../../public/uploads/products', imageName);
        
        // Create directory if it doesn't exist
        fs.mkdirSync(path.dirname(imagePath), { recursive: true });
        
        // Save image
        fs.writeFileSync(imagePath, req.file.buffer);
        
        // Save image reference in database
        await conn.query(
          'INSERT INTO Pictures (productID, picturePath) VALUES (?, ?)',
          [productId, imageName]
        );
      }
      
      await conn.commit();
      
      return res.status(201).json({
        message: 'Product created and pending approval',
        productId
      });
      
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) conn.release();
    }
    
  } catch (error) {
    console.error('Error creating pending product:', error);
    return res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

export const getPendingProducts = async (req, res) => {
  try {
    console.log('getPendingProducts controller called - using debug approach');
    
    // Use the exact same query that works in debug endpoint
    const [products] = await pool.query('SELECT * FROM Product WHERE unitPrice < 0.01');
    
    console.log(`Found ${products.length} pending products with price < 0.01`);
    
    // Now get pictures for each product
    for (let product of products) {
      // Get product images
      const [pictures] = await pool.query(
        'SELECT picturePath FROM Pictures WHERE productID = ?',
        [product.productID]
      );
      
      // Add image URL directly to product
      if (pictures && pictures.length > 0) {
        product.pictures = pictures.map(pic => pic.picturePath);
        product.imageUrl = `/api/v1/store/images/${pictures[0].picturePath}`;
      } else {
        product.pictures = [];
        product.imageUrl = '/placeholder.jpg';
      }
      
      // Get category name
      const [categoryResults] = await pool.query(
        `SELECT c.name as categoryName 
         FROM Category c
         JOIN CategoryCategorizesProduct ccp ON c.categoryID = ccp.categoryID
         WHERE ccp.productID = ?
         LIMIT 1`,
        [product.productID]
      );
      
      product.categoryName = categoryResults.length > 0 ? 
                            categoryResults[0].categoryName : 
                            'Uncategorized';
    }
    
    return res.status(200).json(products);
    
  } catch (error) {
    console.error('Error in getPendingProducts:', error);
    return res.status(500).json({ 
      message: 'Error fetching pending products', 
      error: error.message 
    });
  }
};

export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, discountPercentage = 0 } = req.body;
    
    if (!price) {
      return res.status(400).json({ message: 'Price is required' });
    }
    
    await pool.query(
      `UPDATE Product 
       SET unitPrice = ?, discountPercentage = ?, status = 'active', showProduct = true 
       WHERE productID = ?`,
      [price, discountPercentage, id]
    );
    
    return res.status(200).json({ message: 'Product approved and price set' });
  } catch (error) {
    console.error('Error approving product:', error);
    return res.status(500).json({ message: 'Error approving product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if product exists
    const [product] = await pool.query('SELECT * FROM Product WHERE productID = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log(`Attempting to delete product ID ${id}`);
    
    // Try to delete all related records first using simple queries without transaction
    try {
      // Disable foreign key checks temporarily to force deletion
      await pool.query('SET FOREIGN_KEY_CHECKS=0');
      
      // Delete all related records
      await pool.query('DELETE FROM CategoryCategorizesProduct WHERE productID = ?', [id]);
      await pool.query('DELETE FROM Pictures WHERE productID = ?', [id]);
      await pool.query('DELETE FROM CartContainsProduct WHERE productID = ?', [id]);
      await pool.query('DELETE FROM WishlistItems WHERE productID = ?', [id]);
      await pool.query('DELETE FROM OrderOrderItemsProduct WHERE productID = ?', [id]);
      
      // Finally delete the product itself
      await pool.query('DELETE FROM Product WHERE productID = ?', [id]);
      
      // Re-enable foreign key checks
      await pool.query('SET FOREIGN_KEY_CHECKS=1');
      
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (innerError) {
      console.error('Error in deletion process:', innerError);
      
      // Re-enable foreign key checks in case of error
      await pool.query('SET FOREIGN_KEY_CHECKS=1');
      throw innerError;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      message: 'Error deleting product - will try direct deletion', 
      error: error.message 
    });
  }
};