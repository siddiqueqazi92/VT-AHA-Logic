
CREATE TABLE order_arts (
	id serial PRIMARY KEY,
	order_id INT NOT NULL,
	art_id INT NOT NULL,
	title VARCHAR ( 200 ) NOT NULL,
	price NUMERIC (10, 2),	
	size VARCHAR ( 30 ) NOT NULL,
	description TEXT NULL,
	thumbnail VARCHAR ( 200 ) NULL
);

