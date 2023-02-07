CREATE TABLE community_followers (
	id serial PRIMARY KEY,
	community_id INT NOT NULL,
	follower_id VARCHAR (200) NOT NULL
	
);

