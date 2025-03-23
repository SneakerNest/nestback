/* Choose database */

USE `sneaker_nest`;

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
insert into `ProductManager` (`username`) values
('alicejohnson'), /* Assuming supplierID 1 for Alice Johnson */
('bobsmith'); /* Assuming supplierID 2 for Bob Smith */

/*SalesManager Table*/
insert into `SalesManager` (`username`) values
('charliebrown'),
('davidwilliams');
