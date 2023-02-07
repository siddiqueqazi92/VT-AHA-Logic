
CREATE TABLE order_addresses (
	id serial PRIMARY KEY,
	order_id INT DEFAULT NULL,	
	title VARCHAR(100) NOT NULL,
	country VARCHAR(50) NOT NULL,
	state VARCHAR(50) NOT NULL,
	address VARCHAR(200) NOT NULL
		
);

