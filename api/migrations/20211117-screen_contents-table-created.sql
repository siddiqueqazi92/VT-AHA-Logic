
CREATE TABLE screen_contents (
	id serial PRIMARY KEY,
	key VARCHAR ( 50 ) UNIQUE,
	en TEXT,	
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

