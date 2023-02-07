CREATE TABLE communities (
	id serial PRIMARY KEY,
	profile_name VARCHAR ( 50 ) NOT NULL,
	image VARCHAR ( 200 ) NULL,
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

