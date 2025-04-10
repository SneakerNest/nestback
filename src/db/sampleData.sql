/* Choose database */

USE `sneaker_nest`;

/*-- Main Categories*/
INSERT INTO Category (name, description) VALUES
('Sneakers', 'Comfortable and stylish footwear made for everyday wear, blending performance with street-ready looks.'),
('Casual', 'Easygoing and versatile pieces designed for daily comfort and effortless style.'),
('Boots', 'Durable and bold footwear built for all conditions, from urban streets to rugged paths.'),
('SlippersSandals', 'Lightweight and breathable options ideal for warm weather, home, or relaxed outings.'),

/*-- Subcategories for Sneakers*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Converse Red', 'Classic canvas low-tops with a bold red finish and timeless street style.', 1, 'conversered.jpg'),
('Dunk Purple', 'A striking mix of purple and red suede on a skate-inspired Nike silhouette.', 1, 'dunkpurple.jpg'),
('Samba Black', 'An iconic Adidas design with black leather, white stripes, and gum sole heritage.', 1, 'sambablack.jpg'),

/*-- Subcategories for Casual*/
/*-- INSERT INTO Category (name, description, parentCategoryID, image) VALUES */


/*-- Subcategories for Boots*/
/*-- INSERT INTO Category (name, description, parentCategoryID, image) VALUES */



/*-- Subcategories for SlippersSandals*/
INSERT INTO Category (name, description, parentCategoryID, image) VALUES
('Birkenstock Arizona Black', 'Minimalist comfort meets iconic style with adjustable straps and cork support.', 4, 'birkenstockarizonablack.jpg'),
('Crocs Blue', 'Lightweight, waterproof clogs in a playful blue shade for all-day wear.', 4, 'crocsblue.jpg'),
('Yeezy Slide Black', 'Sleek, futuristic comfort with a soft foam build and serrated sole.', 4, 'yeezyslideblack.jpg'),

