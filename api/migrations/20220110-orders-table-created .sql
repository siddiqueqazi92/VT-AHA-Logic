
CREATE TABLE orders (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) NOT NULL,
	status_id INT DEFAULT NULL,	
	invoice_id INT DEFAULT NULL,
	subtotal NUMERIC (10, 2) NOT NULL,
	total NUMERIC (10, 2) NOT NULL,
	shipment_charges NUMERIC (6, 2) DEFAULT 0,
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL,
	"deletedAt" TIMESTAMP NULL
);

