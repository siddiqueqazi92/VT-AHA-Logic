CREATE TABLE vibes (
	id serial PRIMARY KEY,
	title VARCHAR ( 50 ) NOT NULL,
	image VARCHAR ( 200 ) NULL,
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

