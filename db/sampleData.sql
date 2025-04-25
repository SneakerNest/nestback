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
('Converse', 'Timeless canvas sneakers with a street-style heritage, known for their rubber sole and iconic star patch.', 1, 'converseblack.jpg'),
('Nike', 'Bold and energetic silhouettes blending performance with urban fashion, ideal for both sport and lifestyle.', 1, 'AirforceBlack.jpg'),
('Adidas', 'Classic athletic footwear that mixes retro style with modern comfort, featuring signature 3-stripe designs.', 1, 'Sambablack.jpeg');

/*-- Subcategories for Casual*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Balenciaga', 'Avant-garde design meets luxury fashion—oversized soles and bold aesthetics redefine everyday sneakers.', 2, 'BalenciagaPurple.jpg'),
('McQueen', 'Luxury low-top sneakers combining minimalist elegance with chunky silhouettes for statement styling.', 2, 'McqueenBlack.jpeg'),
('BossTopSider', 'Classic leather sneakers that balance professional style with casual comfort—ideal for smart-casual outfits.', 2, 'TopsiderBlack.jpg');
/*-- Subcategories for Boots*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES

('Timberland', 'Rugged and iconic boots designed for durability, featuring waterproof materials and cushioned support.', 3, 'TimberlandpremiumBrown.jpeg');


/*-- Subcategories for SlippersSandals*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Nike', 'Streamlined slides with plush cushioning and sleek straps—perfect for casual lounging or poolside vibes.', 4, 'NikevictoryBlack.jpeg'),
('Crocs', 'Ultra-light and water-friendly clogs with breathable comfort—great for active and relaxed wear alike.', 4, 'CrocsGrey.jpeg'),
('Champion', 'Slip-on sandals with soft foam and futuristic styling, offering ultimate comfort with everyday versatility.', 4, 'ChampionRed.jpeg');


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


/*-- Products for Converse/Chucks/Sneakers */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(1, 'Converse Chucks', 89.99, 0, 0, 'Classic canvas low-tops with timeless street style.','Converse', 1, 'Canvas', 12, 'SN-CONV-BLK', 80, 'Black'),
(1, 'Converse Chucks', 89.99, 0, 0, 'Classic canvas low-tops with timeless street style.','Converse', 1, 'Canvas', 12, 'SN-CONV-WHT', 80, 'White');


/*-- Products for Nike/Airforce/Sneakers */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color) 
VALUES
(0, 'Nike Airforce', 129.99, 3, 0, 'Timeless basketball-inspired sneakers known for their clean look, comfort, and everyday versatility.', 'Nike', 1, 'Leather', 12, 'SN-AF1-WHT', 90, 'White'),
(0, 'Nike Airforce', 129.99, 3, 0, 'Timeless basketball-inspired sneakers known for their clean look, comfort, and everyday versatility.', 'Nike', 1, 'Leather', 12, 'SN-AF1-BLK', 90, 'Black');


/*-- Products for Adidas/Samba/Sneakers */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
 VALUES
(50, 'Adidas Samba', 199.99, 5, 0, 'A timeless streetwear staple blending classic style with everyday comfort.', 'Adidas', 1, 'Leather', 12, 'SN-SB-B01', 70, 'Black'),
(50, 'Adidas Samba', 199.99, 5, 0, 'A timeless streetwear staple blending classic style with everyday comfort.', 'Adidas', 1, 'Leather', 12, 'SN-SB-W01', 70, 'White');

/*-- Products for  Balenciaga/Casual */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color) 
VALUES
(30, 'Balenciaga Retro', 129.99, 1, 0, 'Bold, fashion-forward sneakers combining oversized design with luxury streetwear appeal.', 'Balenciaga', 1, 'EVA', 12, 'SN-BA-RG', 50, 'Grey'),
(30, 'Balenciaga Retro', 129.99, 1, 0, 'Bold, fashion-forward sneakers combining oversized design with luxury streetwear appeal.', 'Balenciaga', 1, 'EVA', 12, 'SN-BA-RP', 50, 'Purple');


/*-- Products for Mcqueen/Casual */
INSERT INTO Product ( stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(20, 'McQueen Vintage', 89.99, 3, 0, 'Minimalist yet bold, McQueen casuals blend premium materials with iconic chunky soles for standout everyday wear.', 'McQueen', 1, 'Leather', 6, 'SN-MC-BLK', 50, 'Black'),
(20, 'McQueen Vintage', 89.99, 3, 0, 'Minimalist yet bold, McQueen casuals blend premium materials with iconic chunky soles for standout everyday wear.', 'McQueen', 1, 'Leather', 6, 'SN-MC-WHT', 50, 'White');



/*-- Products for Topsider/BossTopSider/Casual */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(30, 'BOSS Elegancy', 119.99, 2, 0, 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 'BossTopSider', 1, 'EVA Foam', 6, 'SN-BT-BLK', 80, 'Black'),
(30, 'BOSS Elegancy', 119.99, 2, 0, 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 'BossTopSider', 1, 'EVA Foam', 6, 'SN-BT-WHT', 80, 'White');


/*-- Products for Timberlandpremium*/
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(45, 'Timberland Premium', 99.99, 5, 0, 'A rugged, high-ankle leather boot with a padded collar and durable rubber sole designed for outdoor wear.', 'Timberland', 1, 'Leather', 12, 'SN-TP-BRN', 70, 'Brown'),
(45, 'Timberland Premium', 99.99, 5, 0, 'A rugged, high-ankle leather boot with a padded collar and durable rubber sole designed for outdoor wear.', 'Timberland', 1, 'Leather', 12, 'SN-TP-BLK', 70, 'Black');


/*-- Products for Timberlandvibram */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(40, 'Timberland Vibram', 89.99, 3, 0, 'A slip-on insulated boot with a padded, fold-over design and rugged outsole for cold-weather comfort and grip.', 'Timberland', 1, 'Leather', 12, 'SN-TV-GRY', 50, 'Grey'),
(40, 'Timberland Vibram', 89.99, 3, 0, 'A slip-on insulated boot with a padded, fold-over design and rugged outsole for cold-weather comfort and grip.', 'Timberland', 1, 'Leather', 12, 'SN-TV-WHT', 50, 'White');


/*-- Products for Timberland Heritage */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(40, 'Timberland Heritage', 149.99, 2, 0, 'A waterproof high-ankle boot featuring a textured lower shell, smooth upper panel, and rugged outsole for enhanced durability.', 'Timberland', 1, 'Leather', 12, 'SN-TH-BLK', 30, 'Black'),
(40, 'Timberland Heritage', 149.99, 2, 0, 'A waterproof high-ankle boot featuring a textured lower shell, smooth upper panel, and rugged outsole for enhanced durability.', 'Timberland', 1, 'Leather', 12, 'SN-TH-WHT', 30, 'White');

/*-- Products for Nike Victory */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(60, 'Nike Victory One Slide', 199.99, 4, 0, 'A minimalist slip-on slide featuring a cushioned footbed and wide branded strap for casual comfort.', 'Nike', 1, 'EVA', 12, 'SN-NV-BLK', 90, 'Black'),
(60, 'Nike Victory One Slide', 199.99, 4, 0, 'A minimalist slip-on slide featuring a cushioned footbed and wide branded strap for casual comfort.', 'Nike', 1, 'EVA', 12, 'SN-NV-WHT', 90, 'White');

/*-- Products for Crocs */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(50, 'Crocs Bayaband Clog', 99.99, 3, 0, 'A casual clog-style sandal featuring ventilation ports, a pivoting heel strap, and bold branding along the sole.', 'Crocs', 1, 'EVA', 12, 'SN-CB-BLK', 90, 'Black'),
(50, 'Crocs Bayaband Clog', 99.99, 3, 0, 'A casual clog-style sandal featuring ventilation ports, a pivoting heel strap, and bold branding along the sole.', 'Crocs', 1, 'EVA', 12, 'SN-CB-GRY', 90, 'Grey');

/*-- Products for Champion  */
INSERT INTO Product (stock, name, unitPrice, overallRating, discountPercentage, description, brand, supplierID, material, warrantyMonths, serialNumber, popularity, color)
VALUES
(50, 'Champion Icons Varsity', 99.99, 4, 0, 'A sporty open-toe slide sandal featuring a wide branded strap and cushioned footbed for casual wear.', 'Champion', 1, 'EVA', 12, 'SN-CH-BLK', 60, 'Black'),
(50, 'Champion Icons Varsity', 99.99, 4, 0, 'A sporty open-toe slide sandal featuring a wide branded strap and cushioned footbed for casual wear.', 'Champion', 1, 'EVA', 12, 'SN-CH-RED', 60, 'Red');

/*-- Pictures Table*/
/* Inserting three pictures for each productID*/

INSERT INTO Pictures (productID, picturePath) VALUES

/*-- Sneakers*/
(1, 'converseblack.jpg'),

(2, 'conversewhite.jpg'),


(3, 'AirforceWhite.jpg'),


(4, 'AirforceBlack.jpg'),


(5, 'SambaBlack.jpeg'),


(6, 'SambaWhite.jpeg'),

/*-- Casuals*/

(7, 'BalenciagaGrey.jpg'),


(8, 'BalenciagaPurple.jpg'),


(9, 'McqueenBlack.jpeg'),


(10, 'McqueenWhite.jpeg'),


(11, 'TopsiderBlack.jpg'),


(12, 'TopsiderWhite.jpg'),

/*-- Boots*/


(13, 'TimberlandpremiumBrown.jpeg'),


(14, 'TimberlandpremiumBlack.jpeg'),


(15, 'TimberlandVibramGrey.jpeg'),


(16, 'TimberlandVibramWhite.jpeg'),


(17, 'TimberlandHeritageBlack.jpeg'),


(18, 'TimberlandHeritageWhite.jpeg'),

/*-- SlippersSandals*/
(19, 'NikevictoryBlack.jpeg'),


(20, 'NikevictoryWhite.jpeg'),


(21, 'CrocsBlack.jpeg'),


(22, 'CrocsGrey.jpeg'),


(23, 'ChampionBlack.jpeg'),


(24, 'ChampionRed.jpeg');






/*-- CategoryCategorizesProduct Table */
/* Inserting the categories for each productID */

/*-- Sneakers*/
/* Inserting values into the CategoryCategorizesProduct table for productIDs 1-12 */

-- Converse Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(5, 1), (5, 2);

-- Nike (Sneakers) Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(6, 3), (6, 4);

-- Adidas Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(7, 5), (7, 6);

-- Balenciaga Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(8, 7), (8, 8);

-- McQueen Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(9, 9), (9, 10);

-- BossTopSider Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(10, 11), (10, 12);

-- Timberland Premium Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(11, 13), (11, 14);

-- Timberland Vibram Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(11, 15), (11, 16);

-- Timberland Heritage Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(11, 17), (11, 18);

-- Nike (Slides) Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(12, 19), (12, 20);

-- Crocs Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(13, 21), (13, 22);

-- Champion Products
INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES
(14, 23), (14, 24);




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
(1, 3),  -- Nike Airforce (used as Dunk Blue)
(1, 5);  -- Adidas Samba Black



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

INSERT INTO `Cart` (`totalPrice`, `numProducts`, `fingerprint`, `temporary`, `customerID`) VALUES
(319.97, 3, 'convAirCrocs', FALSE, 1),     -- Converse Black + Airforce Black + Crocs Grey
(399.98, 2, 'nikeSlideCombo', FALSE, 2),  -- Nike Victory Slide Black + White
(199.99, 1, 'tempSlide', TRUE, NULL);     -- Temp cart: Nike Victory Black


INSERT INTO `CartContainsProduct` (`cartID`, `productID`, `quantity`) VALUES
-- Cart 1 (convAirCrocs - Customer 1)
(1, 1, 1),   -- Converse Black (89.99)
(1, 4, 1),   -- Airforce Black (129.99)
(1, 22, 1),  -- Crocs Grey (99.99)

-- Cart 2 (nikeSlideCombo - Customer 2)
(2, 19, 1),  -- Nike Victory Slide Black (199.99)
(2, 20, 1),  -- Nike Victory Slide White (199.99)

-- Cart 3 (tempSlide - Temporary Guest Cart)
(3, 19, 1);  -- Nike Victory Slide Black (199.99)

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
-- Order 1
(1, 1, 1, 89.99),   -- Converse Black
(1, 4, 1, 129.99),  -- Airforce Black
(1, 5, 1, 199.99),  -- Samba Black

-- Order 2
(2, 19, 1, 199.99), -- Nike Slide Black
(2, 20, 1, 199.99), -- Nike Slide White
(2, 23, 1, 99.99),  -- Champion Slide Black

-- Order 3
(3, 19, 1, 199.99), -- Nike Slide Black
(3, 22, 1, 99.99),  -- Crocs Grey

-- Order 4
(4, 3, 1, 129.99),  -- Airforce White
(4, 6, 1, 199.99),  -- Samba White

-- Order 5
(5, 11, 1, 119.99), -- BOSS Elegancy Black
(5, 12, 1, 119.99), -- BOSS Elegancy White

-- Order 6
(6, 13, 1, 99.99),  -- Timberland Premium Brown
(6, 14, 1, 99.99),  -- Timberland Premium Black

-- Order 7
(7, 15, 1, 89.99),  -- Timberland Vibram Grey
(7, 16, 1, 89.99),  -- Timberland Vibram White

-- Order 8
(8, 17, 1, 149.99), -- Timberland Heritage Black

-- Order 9
(9, 18, 1, 149.99), -- Timberland Heritage White

-- Order 10
(10, 21, 1, 99.99), -- Crocs Black
(10, 22, 1, 99.99); -- Crocs Grey


INSERT INTO `ProdManagerCreatesCategory` (`productManagerUsername`, `categoryID`) VALUES
-- Main Categories
('alicejohnson', 1),  -- Sneakers
('alicejohnson', 2),  -- Casual
('alicejohnson', 3),  -- Boots
('bobsmith', 4),      -- SlippersSandals

-- Subcategories created by Alice
('alicejohnson', 5),  -- Converse
('alicejohnson', 6),  -- Nike (Sneakers)
('alicejohnson', 7),  -- Adidas
('alicejohnson', 8),  -- Balenciaga
('alicejohnson', 9),  -- McQueen
('alicejohnson', 10), -- BossTopSider

-- Subcategories created by Bob
('bobsmith', 11), -- Timberland
('bobsmith', 12), -- Nike (Slides)
('bobsmith', 13), -- Crocs
('bobsmith', 14); -- Champion

INSERT INTO `ProductManagerRestocksProduct` (`productID`, `productManagerUsername`, `quantity`) VALUES
-- Alice's products (Converse + Adidas)
(1, 'alicejohnson', 20),   -- Converse Black
(2, 'alicejohnson', 15),   -- Converse White
(5, 'alicejohnson', 30),   -- Adidas Samba Black
(6, 'alicejohnson', 10),   -- Adidas Samba White

-- Bob's products (Slides / Sandals)
(13, 'bobsmith', 25),      -- Nike Victory Slide Black
(14, 'bobsmith', 18),      -- Nike Victory Slide White
(21, 'bobsmith', 12),      -- Crocs Bayaband Clog Black
(24, 'bobsmith', 15);      -- Champion Icons Varsity Red

INSERT INTO `SalesManagerManagesPriceProduct` (`productID`, `newPrice`, `discountPercent`, `salesManagerUsername`) VALUES
-- Converse Chucks (original: 89.99)
(1, 84.99, 6, 'charliebrown'),
(2, 84.99, 6, 'charliebrown'),

-- Nike Airforce (original: 129.99)
(3, 115.69, 11, 'charliebrown'), -- White
(4, 119.59, 8, 'charliebrown'),  -- Black

-- Adidas Samba (original: 199.99)
(5, 179.99, 10, 'charliebrown'),  -- Black
(6, 183.99, 8, 'charliebrown'),   -- White

-- Birkenstock Arizona (original: 129.99)
(13, 116.99, 10, 'davidwilliams'), -- Black
(14, 119.59, 8, 'davidwilliams'),  -- Brown

-- Crocs Bayaband (original: 99.99)
(21, 89.99, 10, 'charliebrown'),  -- Black
(22, 91.99, 8, 'charliebrown'),  -- Grey

-- Yeezy Slide (Champion) (original: 99.99)
(23, 90.99, 9, 'davidwilliams'), -- Black
(24, 91.99, 8, 'davidwilliams'); -- Red



INSERT INTO `Review` (`reviewContent`, `reviewStars`, `customerID`, `productID`, `productManagerUsername`, `approvalStatus`) VALUES
-- Converse Chucks
('Classic and comfy. Love the black color!', 5, 1, 1, 'alicejohnson', 1),
('Green Converse looks great but sizing runs large.', 4, 2, 2, 'alicejohnson', 1),

-- Nike Airforce
('Amazing support and grip on the court!', 5, 1, 3, 'alicejohnson', 1),
('The black version feels a bit stiff at first.', 3, 3, 4, 'alicejohnson', 1),

-- Adidas Samba
('Perfect for everyday wear. Worth the price.', 5, 2, 5, 'alicejohnson', 1),
('Good quality but took long to arrive.', 3, 1, 6, 'alicejohnson', 2),

-- Crocs Bayaband
('Super lightweight and comfy for daily wear.', 4, 3, 21, 'bobsmith', 1),
('Color was slightly different from photos.', 2, 1, 22, 'bobsmith', 2),

-- Yeezy Slides (Champion)
('These slides are insanely comfortable!', 5, 2, 23, 'bobsmith', 1),
('Not worth the hype in my opinion.', 2, 3, 24, 'bobsmith', 2);


/*Returns Table*/
INSERT INTO `Returns` (`returnStatus`, `reason`, `orderID`, `productID`, `quantity`, `customerID`) VALUES
-- Return request for Converse Black from Order 1
('Pending', 'Product was damaged upon arrival.', 1, 1, 1, 1),

-- Return request for Yeezy Slide Black from Order 2
('Approved', 'Size was too big.', 2, 23, 1, 2);



/* SalesManagerApprovesRefundReturn Table */
INSERT INTO `SalesManagerApprovesRefundReturn` (`requestID`, `salesManagerUsername`, `approvalStatus`) VALUES
(1, 'charliebrown', 'Pending'),   -- For Return ID 1 (Converse Black), managed by charliebrown
(2, 'davidwilliams', 'Pending');  -- For Return ID 2 (Yeezy Slide Black), managed by davidwilliams


