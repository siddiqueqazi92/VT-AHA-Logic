
CREATE TABLE artist_collections (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ),	

	title VARCHAR ( 100 ) NOT NULL,
	image VARCHAR ( 200 ) NOT NULL,
	is_public BOOLEAN NOT NULL

);

