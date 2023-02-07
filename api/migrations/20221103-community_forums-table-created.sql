CREATE TABLE community_forums (
	id serial PRIMARY KEY,		
	community_id INT NOT NULL,
	title CITEXT NOT NULL,			
	description CITEXT NULL,			
	media_uri VARCHAR(300) NULL,			
	media_type VARCHAR(20) NULL,			
	thumbnail VARCHAR(300) NULL,			
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);
