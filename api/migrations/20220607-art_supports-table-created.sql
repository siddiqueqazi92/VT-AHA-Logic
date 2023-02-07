CREATE TABLE art_supports (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) NOT NULL,	
	art_id INT NOT NULL,
	card varchar(100) NOT NULL,
	amount NUMERIC (20, 2) DEFAULT 0,
		
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);
