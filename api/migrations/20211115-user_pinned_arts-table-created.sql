CREATE TABLE user_pinned_arts (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) NOT NULL,
	art_id INT,
	collection_id INT NULL
);

