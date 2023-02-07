
CREATE TABLE artist_addresses (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ),	

	country VARCHAR ( 50 ) NOT NULL,
	state VARCHAR ( 50 ) NOT NULL,
	city VARCHAR ( 50 ) NOT NULL
	

);

