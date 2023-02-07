
CREATE TABLE comments (
	id serial PRIMARY KEY,	
	user_id VARCHAR ( 200 ) NOT NULL,
	parent_id INT NULL,
	art_id INT NULL,
	collection_id INT NULL,
	body CITEXT NOT NULL,
		
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

