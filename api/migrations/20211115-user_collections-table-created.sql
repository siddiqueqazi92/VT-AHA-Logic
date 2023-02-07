CREATE TABLE user_collections (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) NOT NULL,
	name VARCHAR ( 100 ) NOT NULL,
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

