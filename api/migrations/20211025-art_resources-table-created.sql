CREATE TABLE art_resources (
	id serial PRIMARY KEY,
	art_id INT NOT NULL,
	type VARCHAR ( 20 ) NOT NULL,
	uri VARCHAR ( 200 ) NOT NULL,
	thumbnail VARCHAR ( 200 ) NULL

);

