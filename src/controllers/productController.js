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
            WHERE p.showProduct = true
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
            WHERE c.categoryID = ? AND p.showProduct = true
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

// Get all categories with subcategory count
export const getCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                c1.categoryID,
                c1.name,
                c1.description,
                COUNT(c2.categoryID) as subcategoryCount
            FROM Category c1
            LEFT JOIN Category c2 ON c1.categoryID = c2.parentCategoryID
            WHERE c1.parentCategoryID = 0
            GROUP BY c1.categoryID, c1.name, c1.description
            ORDER BY c1.name
        `;

        const [categories] = await pool.query(query);
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
            WHERE p.showProduct = true
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
            LEFT JOIN Product p ON ccp.productID = p.productID AND p.showProduct = true
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
                AND p.showProduct = true
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