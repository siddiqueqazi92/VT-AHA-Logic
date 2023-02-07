CREATE TABLE arts (
	id serial PRIMARY KEY,
	artist_id VARCHAR ( 200 ) NOT NULL,
	name VARCHAR ( 200 ) NOT NULL,
	amount NUMERIC (6, 2),
	max_quantity INT,
	description TEXT NULL,
	long_description TEXT NULL,
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

