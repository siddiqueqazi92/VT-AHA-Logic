
CREATE TABLE comment_likes (
	id serial PRIMARY KEY,	
	user_id VARCHAR ( 200 ) NOT NULL,
	comment_id INT NOT NULL	
);

