
CREATE TABLE user_addresses (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ),
	is_selected BOOLEAN DEFAULT false,
	title VARCHAR ( 100 ) NOT NULL,
	country VARCHAR ( 50 ) NOT NULL,
	state VARCHAR ( 50 ) NOT NULL,
	address VARCHAR ( 200 ) NOT NULL

);

