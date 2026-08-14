-- Seed data for Coffee Shop categories and products

-- Categories Seed Data
INSERT INTO category (id, name, description) VALUES (1, 'Hot Coffee', 'Freshly brewed hot coffee beverages') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO category (id, name, description) VALUES (2, 'Iced Coffee', 'Refreshing chilled & iced coffee drinks') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO category (id, name, description) VALUES (3, 'Tea & Non-Coffee', 'Matcha, Cocoa, and Premium Teas') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO category (id, name, description) VALUES (4, 'Bakery & Pastries', 'Freshly baked croissants, cakes, and snacks') ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Products Seed Data
INSERT INTO product (id, name, price, stock, category_id) VALUES (1, 'Espresso', 45.0, 50, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (2, 'Hot Americano', 50.0, 50, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (3, 'Hot Latte', 55.0, 40, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (4, 'Hot Cappuccino', 55.0, 40, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product (id, name, price, stock, category_id) VALUES (5, 'Iced Americano', 60.0, 60, 2) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (6, 'Iced Latte', 65.0, 50, 2) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (7, 'Iced Caramel Macchiato', 75.0, 35, 2) ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product (id, name, price, stock, category_id) VALUES (8, 'Iced Matcha Green Tea', 70.0, 40, 3) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (9, 'Iced Chocolate', 65.0, 45, 3) ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product (id, name, price, stock, category_id) VALUES (10, 'Butter Croissant', 45.0, 25, 4) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (11, 'Almond Croissant', 65.0, 20, 4) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO product (id, name, price, stock, category_id) VALUES (12, 'Chocolate Fudge Cake', 85.0, 15, 4) ON DUPLICATE KEY UPDATE name=VALUES(name);
