/* Choose database */

USE `sneaker_nest`;

/*-- Main Categories*/
INSERT INTO Category (name, description) VALUES
('Sneakers', 'Comfortable and stylish footwear made for everyday wear, blending performance with street-ready looks.'),
('Casual', 'Easygoing and versatile pieces designed for daily comfort and effortless style.'),
('Boots', 'Durable and bold footwear built for all conditions, from urban streets to rugged paths.'),
('SlippersSandals', 'Lightweight and breathable options ideal for warm weather, home, or relaxed outings.');

/*-- Subcategories for Sneakers*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Converse', 'Classic canvas low-tops with a bold finish and timeless street style.', 1, 'conversered.jpg'),
('Nike', 'A striking mix on a skate-inspired Nike silhouette.', 1, 'dunkpurple.jpg'),
('Adidas', 'An iconic Adidas design with gum sole heritage.', 1, 'sambablack.jpg');

/*-- Subcategories for Casual*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Airforce', 'An iconic basketball-inspired sneaker, the Nike Air Force 1 has become a mainstay in casual footwear. Known for its clean design and versatility.', 2, 'Nikeairforceblack.jpeg'),
('Superstar', 'A classic shoe that has been a favorite for decades, known for its shell toe and timeless design, combining street style with comfort.', 2, 'Superstarblack.jpeg');

/*-- Subcategories for Boots*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Drmartens', 'The 1460 boot is a legendary model from Dr. Martens, known for its durability, comfort, and iconic yellow stitching.', 3, 'Drmartensblack.jpeg'),
('Timberland', 'Known for their durability and high-quality construction, Timberland’s 6-inch premium boots are often associated with workwear but are also a fashionable option for casual wear.', 3, 'Timberlandproblack.jpeg');

/*-- Subcategories for SlippersSandals*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Birkenstock', 'Minimalist comfort meets iconic style with adjustable straps and cork support.', 4, 'birkenstockarizonablack.jpg'),
('Crocs', 'Lightweight, waterproof clogs in a playful shade for all-day wear.', 4, 'crocsblue.jpg'),
('Yeezy', 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 4, 'yeezyslideblack.jpg');


/*-- Address Table*/
/*-- Address entries for customers*/
INSERT INTO Address (addressTitle, streetAddress, city, province, zipCode, country, longitude, latitude) VALUES
('Home', 'Mevlana Caddesi No:22', 'Selçuklu', 'Konya', '42060', 'Turkey', 32.4889, 37.8715), -- Customer 1
('Dorm', 'Barbaros Bulvarı No:55', 'Beşiktaş', 'İstanbul', '34353', 'Turkey', 29.0144, 41.0445), -- Customer 2
('Apartment', 'Mithatpaşa Caddesi No:88', 'Konak', 'İzmir', '35280', 'Turkey', 27.1313, 38.4037); -- Customer 3

/*-- Address entries for billing info (linked to customers)*/
INSERT INTO Address (addressTitle, streetAddress, city, province, zipCode, country, longitude, latitude) VALUES
('Customer 1 Billing 1', 'Mevlana Caddesi No:22', 'Selçuklu', 'Konya', '42060', 'Turkey', 32.4889, 37.8715),
('Customer 2 Billing 1', 'Barbaros Bulvarı No:55', 'Beşiktaş', 'İstanbul', '34353', 'Turkey', 29.0144, 41.0445),
('Customer 3 Billing 1', 'Mithatpaşa Caddesi No:88', 'Konak', 'İzmir', '35280', 'Turkey', 27.1313, 38.4037);

/*-- Address entries for couriers*/
INSERT INTO Address (addressTitle, streetAddress, city, province, zipCode, country, longitude, latitude) VALUES
('Courier 1 Depot', 'Halaskargazi Caddesi No:20', 'Şişli', 'İstanbul', '34360', 'Turkey', 28.9894, 41.0595), /*-- Courier 1 (unique address in Istanbul)*/
('Courier 2 Depot', 'Etiler Mahallesi, Nispetiye Caddesi No:85', 'Beşiktaş', 'İstanbul', '34330', 'Turkey', NULL, NULL); /*-- Courier 2 (same city, different area)*/

/*-- Address entry for supplier*/
INSERT INTO Address (addressTitle, streetAddress, city, province, zipCode, country, longitude, latitude) VALUES
('Supplier Warehouse', 'Organize Sanayi Bölgesi No:31', 'Başakşehir', 'İstanbul', '34490', 'Turkey', 28.7500, 41.0939);

INSERT INTO Supplier (name, phone, addressID) VALUES
('SneakerSupply Co.', 905551234567, 1); -- Make sure addressID=1 exists


/*-- Products for Converse */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(60, 'Converse Black', 89.99, 0, 5, 'Classic canvas low-tops with timeless street style.','Converse', 1, 'Canvas', 12, 'SN-CONV-BLK', 80, 'Black'),
(45, 'Converse Green', 89.99, 0, 5, 'Classic canvas low-tops with timeless street style.','Converse', 1, 'Canvas', 12, 'SN-CONV-GRN', 75, 'Green'),
(55, 'Converse Red', 89.99, 0, 5, 'Classic canvas low-tops with timeless street style.', 'Converse', 1, 'Canvas', 12, 'SN-CONV-RED', 85, 'Red'),
(55, 'Converse White', 89.99, 0, 5, 'Classic canvas low-tops with timeless street style.', 'Converse', 1, 'Canvas', 12, 'SN-CONV-WHT', 70, 'White');

/*-- Products for Dunk */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color) 
VALUES
(50, 'Dunk Blue', 129.99, 0, 10, 'Bold, versatile, and made for both comfort and street performance.', 'Nike', 1, 'Leather', 12, 'SN-DK-B01', 82, 'Blue'),
(40, 'Dunk Green', 129.99, 0, 12, 'Bold, versatile, and made for both comfort and street performance.', 'Nike', 1, 'Leather', 12, 'SN-DK-G01', 76, 'Green'),
(45, 'Dunk Purple', 129.99, 0, 15, 'Bold, versatile, and made for both comfort and street performance.', 'Nike', 1, 'Leather', 12, 'SN-DK-P01', 88, 'Purple'),
(35, 'Dunk Yellow', 129.99, 0, 8, 'Bold, versatile, and made for both comfort and street performance.', 'Nike', 1, 'Leather', 12, 'SN-DK-Y01', 73, 'Yellow');

/*-- Products for Samba */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
 VALUES
(60, 'Samba Black', 199.99, 0, 10, 'A timeless streetwear staple blending classic style with everyday comfort.', 'Adidas', 1, 'Leather', 12, 'SN-SB-B01', 90, 'Black'),
(50, 'Samba Navy', 199.99, 0, 8, 'A timeless streetwear staple blending classic style with everyday comfort.', 'Adidas', 1, 'Leather', 12, 'SN-SB-N01', 85, 'Navy'),
(40, 'Samba Pink', 199.99, 0, 12, 'A timeless streetwear staple blending classic style with everyday comfort.', 'Adidas', 1, 'Leather', 12, 'SN-SB-P01', 78, 'Pink'),
(55, 'Samba White', 199.99, 0, 5, 'A timeless streetwear staple blending classic style with everyday comfort.', 'Adidas', 1, 'Leather', 12, 'SN-SB-W01', 88, 'White');

/*-- Products for Birkenstock */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color) 
VALUES
(50, 'Birkenstock Arizona Black', 129.99, 0, 10, 'Minimalist comfort meets iconic style with adjustable straps and cork support.', 'Birkenstock', 1, 'EVA', 12, 'SN-BA-B01', 82, 'Black'),
(45, 'Birkenstock Arizona Brown', 129.99, 0, 8, 'Minimalist comfort meets iconic style with adjustable straps and cork support.', 'Birkenstock', 1, 'EVA', 12, 'SN-BA-BR01', 78, 'Brown'),
(40, 'Birkenstock Arizona Khaki', 129.99, 0, 12, 'Minimalist comfort meets iconic style with adjustable straps and cork support.', 'Birkenstock', 1, 'EVA', 12, 'SN-BA-K01', 74, 'Khaki'),
(42, 'Birkenstock Arizona Navy', 129.99, 0, 9, 'Minimalist comfort meets iconic style with adjustable straps and cork support.', 'Birkenstock', 1, 'EVA', 12, 'SN-BA-N01', 80, 'Navy');

/*-- Products for Crocs */
INSERT INTO Product ( stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(40, 'Crocs Classic', 89.99, 0, 10, 'Lightweight, waterproof clogs designed for everyday comfort and casual wear.', 'Crocs', 1, 'Rubber', 6, 'SN-CR-BL', 80, 'Blue'),
(35, 'Crocs Classic', 89.99, 0, 10, 'Lightweight, waterproof clogs designed for everyday comfort and casual wear.', 'Crocs', 1, 'Rubber', 6, 'SN-CR-NV', 75, 'Navy'),
(50, 'Crocs Classic', 89.99, 0, 10, 'Lightweight, waterproof clogs designed for everyday comfort and casual wear.', 'Crocs', 1, 'Rubber', 6, 'SN-CR-PK', 82, 'Pink'),
(45, 'Crocs Classic', 89.99, 0, 10, 'Lightweight, waterproof clogs designed for everyday comfort and casual wear.', 'Crocs', 1, 'Rubber', 6, 'SN-CR-RD', 77, 'Red');

/*-- Products for Yeezy */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(35, 'Yeezy Slide', 119.99, 0, 15, 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 'Yeezy', 1, 'EVA Foam', 6, 'SN-YS-BLK', 85, 'Black'),
(30, 'Yeezy Slide', 119.99, 0, 15, 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 'Yeezy', 1, 'EVA Foam', 6, 'SN-YS-BNE', 80, 'Bone'),
(40, 'Yeezy Slide', 119.99, 0, 15, 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 'Yeezy', 1, 'EVA Foam', 6, 'SN-YS-BRN', 78, 'Brown'),
(25, 'Yeezy Slide', 119.99, 0, 15, 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 'Yeezy', 1, 'EVA Foam', 6, 'SN-YS-NVY', 72, 'Navy');

/*-- Products for Airforce */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(50, 'Air Force 1 White', 99.99, 0, 10, 'A classic and timeless sneaker that combines style and comfort with a clean, all-white design.', 'Airforce', 1, 'Leather', 12, 'SN-AF1-WHT', 95, 'Red'),
(40, 'Air Force 1 Navy', 99.99, 0, 10, 'A classic and timeless sneaker that combines style and comfort with a sleek, all-black design.', 'Airforce', 1, 'Leather', 12, 'SN-AF1-NAVY', 85, 'Navy'),
(45, 'Air Force 1 Black', 99.99, 0, 12, 'A classic and timeless sneaker that combines style and comfort with a sleek, all-black design.', 'Airforce', 1, 'Leather', 12, 'SN-AF1-BLK', 90, 'Black');

/*-- Products for Superstar */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(50, 'Superstar White', 89.99, 0, 10, 'A classic sneaker with a timeless design featuring a shell toe and three stripes.', 'Superstar', 1, 'Leather', 12, 'SN-SP-WHT', 92, 'White'),
(40, 'Superstar Black', 89.99, 0, 10, 'A classic sneaker with a timeless design featuring a shell toe and three stripes.', 'Superstar', 1, 'Leather', 12, 'SN-SP-BLK', 88, 'Black'),
(45, 'Superstar Red', 89.99, 0, 12, 'A classic sneaker with a timeless design featuring a shell toe and three stripes.', 'Superstar', 1, 'Leather', 12, 'SN-SP-RED', 85, 'Red');

/*-- Products for Drmartens */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(50, 'Dr. Martens 1460 Black', 149.99, 0, 10, 'The iconic 1460 boot with a classic black finish and yellow stitching.', 'Drmartens', 1, 'Leather', 12, 'SN-DM-BLK', 95, 'Black'),
(40, 'Dr. Martens 1460 White', 149.99, 0, 10, 'The iconic 1460 boot with a classic brown finish and yellow stitching.', 'Drmartens', 1, 'Leather', 12, 'SN-DM-BRN', 90, 'White');

/*-- Products for Timberland */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(50, 'Timberland 6-Inch Premium Black', 199.99, 0, 10, 'The classic Timberland boot with premium leather and waterproof construction.', 'Timberland', 1, 'Leather', 12, 'SN-TB-BLK', 98, 'Black'),
(40, 'Timberland 6-Inch Premium Brown', 199.99, 0, 10, 'The classic Timberland boot with premium leather and waterproof construction.', 'Timberland', 1, 'Leather', 12, 'SN-TB-BRN', 95, 'Grey'),
(45, 'Timberland 6-Inch Premium Tan', 199.99, 0, 12, 'The classic Timberland boot with premium leather and waterproof construction.', 'Timberland', 1, 'Leather', 12, 'SN-TB-TAN', 90, 'White');

/*-- Pictures Table*/
/* Inserting three pictures for each productID*/
/*-- Sneakers*/
INSERT INTO Pictures (productID, picturePath) VALUES
(1, 'converseblack.jpg'),

(2, 'conversegreen.jpg'),


(3, 'conversered.jpg'),


(4, 'conversewhite.jpg'),


(5, 'dunkblue.jpg'),


(6, 'dunkgreen.jpg'),


(7, 'dunkpurple.jpg'),


(8, 'dunkyellow.jpg'),


(9, 'sambablack.jpg'),


(10, 'sambanavy.jpg'),


(11, 'samabpink.jpg'),


(12, 'sambawhite.jpg'),


/*-- SlippersSandals*/

(13, 'birkenstockarizonablack.jpg'),


(14, 'birkenstockarizonabrown.jpg'),


(15, 'birkenstockarizonakhaki.jpg'),


(16, 'birkenstockarizanavy.jpg'),


(17, 'crocsblue.jpg'),


(18, 'crocsnavy.jpg'),


(19, 'crocsclassicpink.jpg'),


(20, 'crocsred.jpg'),


(21, 'yeezyslideblack.jpg'),


(22, 'yeezyslidebone.jpg'),


(23, 'yeezyslidebrown.jpg'),


(24, 'yeezyslidenavy.jpg'),

/*-- Casual*/
(25, 'Nikeairforcewhite.jpeg'),

(26, 'Nikeairforceblack.jpeg'),

(27, 'Nikeairforcenavy.jpeg'),

(28, 'Superstarwhite.jpeg'),

(29, 'Superstarblack.jpeg'),

(30, 'Superstarred.jpeg'),

/*-- Boots*/
(31, 'Drmartensblack.jpeg'),

(32, 'Drmartenswhite.jpeg'),

(33, 'Timberlandproblack.jpeg'),

(34, 'Timberlandprogrey.jpeg'),

(35, 'Timberlandprowhite.jpeg');

/*-- CategoryCategorizesProduct Table */
/* Inserting the categories for each productID */

/*-- Sneakers*/
/* Inserting values into the CategoryCategorizesProduct table for productIDs 1-12 */

-- Converse Products (productID 1–4)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(5, 1), (5, 2), (5, 3), (5, 4);

-- Nike / Dunks (productID 5–8)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(6, 5), (6, 6), (6, 7), (6, 8);

-- Adidas / Sambas (productID 9–12)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(7, 9), (7, 10), (7, 11), (7, 12);

-- Airforce Products (productID 25–27)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(11, 25), (11, 26), (11, 27);

-- Superstar Products (productID 28–30)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(12, 28), (12, 29), (12, 30); 

-- Drmartens Products (productID 31–32)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(13, 31), (13, 32);

-- Timberland Products (productID 33–35)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(14, 33), (14, 34), (14, 35); 

-- Birkenstock (productID 13–16)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(8, 13), (8, 14), (8, 15), (8, 16);

-- Crocs (productID 17–20)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(9, 17), (9, 18), (9, 19), (9, 20);

-- Yeezy (productID 21–24)
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(10, 21), (10, 22), (10, 23), (10, 24);




/* -- User Table */
/*-- Inserting 6 users (2 Product Managers, 2 Sales Managers, and 3 Customers)*/
insert into `USERS` (`name`, `email`, `username`, `password`) values
('Alice Johnson', 'alice.product@company.com', 'alicejohnson', '$2b$12$EGE5qYOuRRHhMujtiaAq/emPDYdnTip.wRFWevb56Yn1fyT.X.eZK'), /*password: AJ123*/
('Bob Smith', 'bob.product@company.com', 'bobsmith', '$2b$12$XazL/WqkSUkcKc9eVNBbqeWEsDmiJjSEUER/ojrgMJPpX8NT.dXCu'), /*password: BS123*/

('Charlie Brown', 'charlie.sales@company.com', 'charliebrown', '$2b$12$B23U7bCQBQgH48XYdMXAw.mbKvbI/xPS2WrDc6fK3V74uxfXdMgWG'), /*password: CB123*/
('David Williams', 'david.sales@company.com', 'davidwilliams', '$2b$12$pTJ2KOQlyXFEJkcV8RnL6OlWVvl.xekWmt1GkZG29QIWJ6ZGvsvmq'), /*password: DW123*/

('Guanghui', 'guanghui.ma@sabanciuniv.edu', 'guang', '$2b$12$toNVmS8LZn2OrEI5nS23x.lLBQmjK89s3mgTb0LnSszoN37y6uSrG'), /*password: guang*/
('Frank Miller', 'frank.miller@yahoo.com', 'frankmiller', '$2b$12$4ttyt.gmQi6Ov3sG4TbI2ulaeDfcA7PaudhIcVyNi/oNRQR0zKFky'), /*password: FM123*/
('Eve Green', 'eve.green@gmail.com', 'evegreen', '$2b$12$4Awi28tlIbNQ2nt15DDAZ.WJdxHPGXpaS7X6Z/1Lxm5ojBQxK2LYO'); /*password: EG123*/




/*ProductManager Table*/
insert into `ProductManager` (`username`, `supplierID`) values
('alicejohnson', 1), /* Assuming supplierID 1 for Alice Johnson */
('bobsmith', 1); /* Assuming supplierID 2 for Bob Smith */




/*SalesManager Table*/
insert into `SalesManager` (`username`, `supplierID`) values
('charliebrown', 1),
('davidwilliams', 1);

/*-- Courier Table*/
INSERT INTO `Courier` (`name`, `phone`, `email`, `capacity`, `addressID`) VALUES
('Fast Express', 904500123456, 'contact@fastexpress.com', 3000, 7),
('Speedy Delivery', 904600789012, 'info@speedydelivery.com', 3500, 8);

/* ProductManagerContactsCourier Table */
INSERT INTO `ProdManagerContactsCourier` (`deliveryAddressID`, `capacityPoints`, `productManagerUsername`, `courierID`) VALUES
(7, 50, 'alicejohnson', 1),
(7, 60, 'bobsmith', 1),
(8, 75, 'alicejohnson', 2),
(8, 80, 'bobsmith', 2);

/* Customer Table */
insert into `Customer` (`username`, `addressID`, `phone`, `taxID`) values 
('guang', 1, 90689837852, 123),
('frankmiller', 2, 90457822013, 234),
('evegreen', 3, 90586735267, 345);

/*Wishlist Table*/
insert into `Wishlist` (`customerID`) values 
(1),
(2),
(3);

INSERT INTO `WishlistItems` (`wishlistID`, `productID`) VALUES 
(1, 1),  -- Converse Black
(1, 5),  -- Dunk Blue
(1, 9);  -- Samba Black



/*BillingInfo Table*/
INSERT INTO `BillingInfo` (`customerID`, `creditCardNo`, `creditCardEXP`, `addressID`) VALUES
(1, SHA2('4111111111111111', 256), '12/25', 4),
(2, SHA2('5500000000000004', 256), '11/25', 5),
(3, SHA2('340000000000009', 256), '10/25', 6);

/*DeliveryRegion Table*/
INSERT INTO `DeliveryRegion` (`name`, `population`, `SEIFA`) VALUES
('Beşiktaş', 200000, 110),
('Kadıköy', 450000, 120),
('Şişli', 300000, 130),
('Üsküdar', 350000, 140),
('Fatih', 400000, 150),
('Bakırköy', 250000, 160),
('Beyoğlu', 250000, 170);

/*CourierDeliversToDeliveryRegion Table*/
INSERT INTO `CourierDeliversToDeliveryRegion` (`courierID`, `regionID`, `deliveryCost`) VALUES
(1, 1, 100),
(1, 2, 150),
(1, 3, 200),
(1, 5, 300),
(1, 6, 350),
(2, 1, 120),
(2, 2, 170),
(2, 3, 220),
(2, 4, 270),
(2, 5, 320),
(2, 6, 370),
(2, 7, 420);

/*-- Cart Table (3 examples: 2 tied to customers, 1 temporary) */
INSERT INTO `Cart` (`totalPrice`, `numProducts`, `fingerprint`, `temporary`, `customerID`) VALUES
(269.97, 3, 'convDunk', FALSE, 1),     -- Converse Black + Dunk Green + Crocs Red
(519.96, 4, 'yeezyPack', FALSE, 2),    -- Yeezy Slide (Black, Bone, Brown, Navy)
(129.99, 1, 'birkyTemp', TRUE, NULL);  -- Temp cart: 1x Birkenstock Arizona Black


INSERT INTO `CartContainsProduct` (`cartID`, `productID`, `quantity`) VALUES
-- Cart 1 (convDunk - Customer 1)
(1, 1, 1),   -- Converse Black (89.99)
(1, 6, 1),   -- Dunk Green (129.99)
(1, 20, 1),  -- Crocs Red (89.99)  --> Total = 309.97, Discounted to ~269.97

-- Cart 2 (yeezyPack - Customer 2)
(2, 21, 1),  -- Yeezy Slide Black (119.99)
(2, 22, 1),  -- Yeezy Slide Bone (119.99)
(2, 23, 1),  -- Yeezy Slide Brown (119.99)
(2, 24, 1),  -- Yeezy Slide Navy (119.99)  --> Total = 479.96, rounded or discounted to 519.96

-- Cart 3 (birkyTemp - Temporary Guest Cart)
(3, 13, 1);  -- Birkenstock Arizona Black (129.99)

/*Sample values for graph*/
INSERT INTO `Order` (`orderNumber`, `totalPrice`, `deliveryID`, `deliveryStatus`, `deliveryAddressID`, `estimatedArrival`, `courierID`, `customerID`, `timeOrdered`) VALUES
(1001, 234.97, 123134, 'Delivered', 4, '2023-12-10', 1, 1, '2023-12-05 14:30:00'),
(1002, 580.97, 324234, 'Delivered', 5, '2023-12-02', 2, 2, '2023-11-25 10:15:00'),
(1003, 234.97, 123135, 'Delivered', 4, '2023-11-20', 1, 1, '2023-11-15 09:00:00'),
(1004, 150.00, 324235, 'Delivered', 5, '2023-11-18', 2, 2, '2023-11-10 16:45:00'),
(1005, 170.99, 123136, 'Delivered', 4, '2023-11-25', 1, 1, '2023-11-05 11:30:00'),
(1006, 99.98, 324236, 'Delivered', 5, '2023-11-22', 2, 2, '2023-10-30 13:20:00'),
(1007, 184.98, 123137, 'Delivered', 4, '2023-11-30', 1, 1, '2023-10-25 15:10:00'),
(1008, 229.99, 324237, 'Delivered', 5, '2023-11-28', 2, 2, '2023-10-20 17:00:00'),
(1009, 170.99, 123138, 'Delivered', 4, '2023-11-26', 1, 1, '2023-10-15 12:00:00'),
(1010, 99.98, 324238, 'Delivered', 5, '2023-11-24', 2, 2, '2023-10-10 14:45:00'),
(1011, 184.98, 123139, 'Delivered', 4, '2023-11-22', 1, 1, '2023-10-05 09:30:00'),
(1012, 229.99, 324239, 'Delivered', 5, '2023-11-20', 2, 2, '2023-09-30 11:15:00'),
(1013, 170.99, 123140, 'Delivered', 4, '2023-11-18', 1, 1, '2023-09-25 13:00:00'),
(1014, 99.98, 324240, 'Delivered', 5, '2023-11-16', 2, 2, '2023-09-20 15:45:00'),
(1015, 269.97, 123141, 'Delivered', 4, '2023-11-14', 1, 1, '2023-09-15 10:30:00'),
(1016, 229.99, 324241, 'Delivered', 5, '2023-11-12', 2, 2, '2023-09-10 12:15:00'),
(1017, 170.99, 123142, 'Delivered', 4, '2023-11-10', 1, 1, '2023-09-05 14:00:00'),
(1018, 99.98, 324242, 'Delivered', 5, '2023-11-08', 2, 2, '2023-08-30 16:45:00'),
(1019, 184.98, 123143, 'Delivered', 4, '2023-11-06', 1, 1, '2023-08-25 09:30:00'),
(1020, 429.97, 324243, 'Delivered', 5, '2023-11-04', 2, 2, '2023-08-20 11:15:00'),
(1021, 234.97, 123144, 'Delivered', 4, '2023-12-15', 1, 1, '2023-12-01 14:30:00'),
(1022, 580.97, 324244, 'Delivered', 5, '2023-12-20', 2, 2, '2023-12-05 10:15:00'),
(1023, 234.97, 123145, 'Delivered', 4, '2023-12-25', 1, 1, '2023-12-10 09:00:00'),
(1024, 150.00, 324245, 'Delivered', 5, '2024-01-10', 2, 2, '2024-01-01 16:45:00'),
(1025, 170.99, 123146, 'Delivered', 4, '2024-01-15', 1, 1, '2024-01-05 11:30:00'),
(1026, 99.98, 324246, 'Delivered', 5, '2024-01-20', 2, 2, '2024-01-10 13:20:00'),
(1027, 184.98, 123147, 'Delivered', 4, '2024-02-01', 1, 1, '2024-01-20 15:10:00'),
(1028, 229.99, 324247, 'Delivered', 5, '2024-02-10', 2, 2, '2024-01-25 17:00:00'),
(1029, 170.99, 123148, 'Delivered', 4, '2024-02-15', 1, 1, '2024-02-01 12:00:00'),
(1030, 99.98, 324248, 'Delivered', 5, '2024-02-20', 2, 2, '2024-02-05 14:45:00'),
(1031, 184.98, 123149, 'Delivered', 4, '2024-03-01', 1, 1, '2024-02-15 09:30:00'),
(1032, 229.99, 324249, 'Delivered', 5, '2024-03-10', 2, 2, '2024-02-25 11:15:00'),
(1033, 170.99, 123150, 'Delivered', 4, '2024-03-15', 1, 1, '2024-03-01 13:00:00'),
(1034, 99.98, 324250, 'Delivered', 5, '2024-03-20', 2, 2, '2024-03-05 15:45:00'),
(1035, 269.97, 123151, 'Delivered', 4, '2024-04-01', 1, 1, '2024-03-15 10:30:00'),
(1036, 229.99, 324251, 'Delivered', 5, '2024-04-10', 2, 2, '2024-03-25 12:15:00'),
(1037, 170.99, 123152, 'Delivered', 4, '2024-04-15', 1, 1, '2024-04-01 14:00:00'),
(1038, 99.98, 324252, 'Delivered', 5, '2024-04-20', 2, 2, '2024-04-05 16:45:00'),
(1039, 184.98, 123153, 'Delivered', 4, '2024-05-01', 1, 1, '2024-04-15 09:30:00'),
(1040, 429.97, 324253, 'Delivered', 5, '2024-05-10', 2, 2, '2024-04-25 11:15:00'),
(1041, 234.97, 123154, 'Delivered', 4, '2024-05-15', 1, 1, '2024-05-01 14:30:00'),
(1042, 580.97, 324254, 'Delivered', 5, '2024-05-20', 2, 2, '2024-05-05 10:15:00'),
(1043, 234.97, 123155, 'Delivered', 4, '2024-06-01', 1, 1, '2024-05-15 09:00:00'),
(1044, 150.00, 324255, 'Delivered', 5, '2024-06-10', 2, 2, '2024-05-25 16:45:00'),
(1045, 170.99, 123156, 'Delivered', 4, '2024-06-15', 1, 1, '2024-06-01 11:30:00'),
(1046, 99.98, 324256, 'Delivered', 5, '2024-06-20', 2, 2, '2024-06-05 13:20:00'),
(1047, 184.98, 123157, 'Delivered', 4, '2024-07-01', 1, 1, '2024-06-15 15:10:00'),
(1048, 229.99, 324257, 'Delivered', 5, '2024-07-10', 2, 2, '2024-06-25 17:00:00'),
(1049, 170.99, 123158, 'Delivered', 4, '2024-07-15', 1, 1, '2024-07-01 12:00:00'),
(1050, 99.98, 324258, 'Delivered', 5, '2024-07-20', 2, 2, '2024-07-05 14:45:00'),
(1051, 184.98, 123159, 'Delivered', 4, '2024-08-01', 1, 1, '2024-07-15 09:30:00'),
(1052, 220.98, 324259, 'Delivered', 5, '2024-08-10', 2, 2, '2024-07-25 11:15:00'),
(1053, 234.97, 123160, 'Delivered', 4, '2024-08-15', 1, 1, '2024-08-01 13:00:00'),
(1054, 150.00, 324260, 'Delivered', 5, '2024-08-20', 2, 2, '2024-08-05 15:45:00'),
(1055, 170.99, 123161, 'Delivered', 4, '2024-09-01', 1, 1, '2024-08-15 10:30:00'),
(1056, 99.98, 324261, 'Delivered', 5, '2024-09-10', 2, 2, '2024-08-25 12:15:00'),
(1057, 184.98, 123162, 'Delivered', 4, '2024-09-15', 1, 1, '2024-09-01 14:00:00'),
(1058, 229.99, 324262, 'Delivered', 5, '2024-09-20', 2, 2, '2024-09-05 16:45:00'),
(1059, 170.99, 123163, 'Delivered', 4, '2024-10-01', 1, 1, '2024-09-15 09:30:00'),
(1060, 99.98, 324263, 'Delivered', 5, '2024-10-10', 2, 2, '2024-09-25 11:15:00'),
(1061, 184.98, 123164, 'Delivered', 4, '2024-10-15', 1, 1, '2024-10-01 14:30:00'),
(1062, 229.99, 324264, 'Delivered', 5, '2024-10-20', 2, 2, '2024-10-05 10:15:00'),
(1063, 170.99, 123165, 'Delivered', 4, '2024-11-01', 1, 1, '2024-10-15 09:00:00'),
(1064, 99.98, 324265, 'Delivered', 5, '2024-11-15', 2, 2, '2024-11-01 07:30:00'),
(1065, 184.98, 123166, 'Delivered', 4, '2024-11-10', 1, 1, '2024-11-01 09:30:00'),
(1066, 229.99, 324266, 'Delivered', 5, '2024-11-20', 2, 2, '2024-11-05 13:20:00'),
(1067, 170.99, 123167, 'Delivered', 4, '2024-12-01', 1, 1, '2024-11-15 15:10:00'),
(1068, 99.98, 324267, 'Delivered', 5, '2024-12-10', 2, 2, '2024-11-25 17:00:00'),
(1069, 184.98, 123168, 'Delivered', 4, '2024-12-15', 1, 1, '2024-12-01 12:00:00'),
(1070, 229.99, 324268, 'In-transit', 5, '2024-12-20', 2, 2, '2024-12-05 14:45:00'),
(1071, 65.99, 123169, 'Delivered', 4, '2025-01-01', 1, 1, '2024-12-15 09:30:00'),
(1072, 76.70, 123170, 'In-transit', 4, '2025-01-01', 1, 1, '2024-12-16 09:31:00'),
(1077, 67.05, 123171, 'Processing', 4, '2025-01-01', 1, 1, '2024-12-17 09:32:00');

/*OrderOrderItemsProduct Table*/
INSERT INTO `OrderOrderItemsProduct` (`orderID`, `productID`, `quantity`, `purchasePrice`) VALUES
(1, 1, 1, 85.49),   -- Converse Black
(1, 5, 1, 116.99),  -- Dunk Blue
(1, 9, 1, 179.99),  -- Samba Black
(2, 21, 1, 119.99), -- Yeezy Slide Black
(2, 22, 1, 119.99), -- Yeezy Slide Bone
(2, 24, 1, 119.99), -- Yeezy Slide Navy
(3, 13, 1, 116.99), -- Birkenstock Arizona Black
(3, 14, 1, 119.59), -- Birkenstock Arizona Brown
(3, 17, 1, 80.99),  -- Crocs Classic Blue
(4, 5, 1, 114.39),  -- Dunk Green
(4, 6, 1, 110.49),  -- Dunk Purple
(4, 10, 1, 183.99), -- Samba Navy
(5, 28, 1, 80.99),  -- Superstar White
(5, 29, 1, 80.99),  -- Superstar Black
(5, 30, 1, 79.19),  -- Superstar Red
(6, 31, 1, 134.99), -- Dr. Martens 1460 Black
(6, 32, 1, 134.99), -- Dr. Martens 1460 White
(7, 33, 1, 179.99), -- Timberland 6-Inch Premium Black
(7, 34, 1, 179.99), -- Timberland 6-Inch Premium Brown
(8, 13, 1, 116.99), -- Birkenstock Arizona Black
(9, 17, 1, 80.99),  -- Crocs Classic Blue
(10, 9, 1, 179.99), -- Samba Black
(10, 24, 1, 101.99), -- Yeezy Slide Navy
(11, 5, 1, 85.49),  -- Converse Black
(11, 10, 1, 189.99), -- Samba White
(12, 22, 1, 101.99), -- Yeezy Slide Bone
(12, 7, 1, 119.59),  -- Dunk Yellow
(13, 31, 1, 134.99), -- Dr. Martens 1460 Black
(14, 24, 1, 101.99), -- Yeezy Slide Navy
(14, 21, 1, 101.99); -- Yeezy Slide Black


INSERT INTO `ProdManagerCreatesCategory` (`productManagerUsername`, `categoryID`) VALUES
('alicejohnson', 1),  -- Sneakers
('alicejohnson', 2),  -- Casual
('alicejohnson', 3),  -- Boots
('bobsmith', 4),      -- SlippersSandals

-- Subcategories created by Alice
('alicejohnson', 5),  -- Converse
('alicejohnson', 6),  -- Nike
('alicejohnson', 7),  -- Adidas

-- Subcategories created by Bob
('bobsmith', 8),  -- Birkenstock
('bobsmith', 9),  -- Crocs
('bobsmith', 10); -- Yeezy

INSERT INTO `ProductManagerRestocksProduct` (`productID`, `productManagerUsername`, `quantity`) VALUES
(1, 'alicejohnson', 20),   -- Converse Black
(2, 'alicejohnson', 15),   -- Converse Green
(5, 'alicejohnson', 30),   -- Dunk Blue
(6, 'alicejohnson', 10),   -- Dunk Green

(13, 'bobsmith', 25),      -- Birkenstock Arizona Black
(14, 'bobsmith', 18),      -- Birkenstock Arizona Brown
(21, 'bobsmith', 12),      -- Yeezy Slide Black
(24, 'bobsmith', 15);      -- Yeezy Slide Navy

INSERT INTO `SalesManagerManagesPriceProduct` (`productID`, `newPrice`, `discountPercent`, `salesManagerUsername`) VALUES
-- Converse Collection (original: 89.99)
(1, 84.99, 6, 'charliebrown'),
(2, 84.99, 6, 'charliebrown'),
(3, 79.99, 11, 'charliebrown'),
(4, 82.99, 8, 'charliebrown'),

-- Dunk Collection (original: 129.99)
(5, 119.99, 8, 'davidwilliams'),
(6, 114.99, 12, 'davidwilliams'),
(7, 109.99, 15, 'davidwilliams'),
(8, 124.99, 4, 'davidwilliams'),

-- Samba Collection (original: 199.99)
(9, 179.99, 10, 'charliebrown'),
(10, 183.99, 8, 'charliebrown'),
(11, 175.99, 12, 'charliebrown'),
(12, 189.99, 5, 'charliebrown'),

-- Birkenstock (original: 129.99)
(13, 119.99, 8, 'davidwilliams'),
(14, 124.99, 4, 'davidwilliams'),
(15, 115.99, 11, 'davidwilliams'),
(16, 121.99, 6, 'davidwilliams'),

-- Crocs (original: 89.99)
(17, 84.99, 6, 'charliebrown'),
(18, 82.99, 8, 'charliebrown'),
(19, 79.99, 11, 'charliebrown'),
(20, 85.99, 4, 'charliebrown'),

-- Yeezy (original: 119.99)
(21, 109.99, 8, 'davidwilliams'),
(22, 101.99, 15, 'davidwilliams'),
(23, 104.99, 12, 'davidwilliams'),
(24, 113.99, 5, 'davidwilliams');



INSERT INTO `Review` (`reviewContent`, `reviewStars`, `customerID`, `productID`, `productManagerUsername`, `approvalStatus`) VALUES
-- Converse Reviews
('Classic and comfy. Love the black color!', 5, 1, 1, 'alicejohnson', 1),
('Green Converse looks great but sizing runs large.', 4, 2, 2, 'bobsmith', 1),

-- Dunk Reviews
('Amazing support and grip on the court!', 5, 1, 5, 'alicejohnson', 1),
('The yellow color is too bright for my taste.', 3, 3, 8, 'bobsmith', 1),

-- Samba Reviews
('Perfect for everyday wear. Worth the price.', 5, 2, 9, 'alicejohnson', 1),
('Good quality but took long to arrive.', 3, 1, 10, 'bobsmith', 2),

-- Crocs Reviews
('Super lightweight and comfy for daily wear.', 4, 3, 17, 'bobsmith', 1),
('Color was slightly different from photos.', 2, 1, 18, 'alicejohnson', 2),

-- Yeezy Reviews
('These slides are insanely comfortable!', 5, 2, 21, 'bobsmith', 1),
('Not worth the hype in my opinion.', 2, 3, 24, 'alicejohnson', 2);


/*Returns Table*/
INSERT INTO `Returns` (`returnStatus`, `reason`, `orderID`, `productID`, `quantity`, `customerID`) VALUES
('Pending', 'Product was damaged upon arrival.', 1, 1, 1, 1),
('Approved', 'Size was too big.', 2, 21, 1, 2);



/* SalesManagerApprovesRefundReturn Table */
INSERT INTO `SalesManagerApprovesRefundReturn` (`requestID`, `salesManagerUsername`, `approvalStatus`) VALUES
(1, 'davidwilliams', 'Pending'),
(2, 'charliebrown', 'Pending');


