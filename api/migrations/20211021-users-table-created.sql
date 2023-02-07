CREATE TABLE users (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) UNIQUE,
	is_artist BOOLEAN NOT NULL ,
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

