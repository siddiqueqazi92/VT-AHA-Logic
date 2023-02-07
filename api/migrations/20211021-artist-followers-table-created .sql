CREATE TABLE artist_followers (
	id serial PRIMARY KEY,
	artist_id VARCHAR (200) NOT NULL,
	follower_id VARCHAR (200) NOT NULL
);

