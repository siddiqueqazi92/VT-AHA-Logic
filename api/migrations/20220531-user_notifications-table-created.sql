CREATE TABLE user_notifications (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) NOT NULL,	
	title varchar(255) DEFAULT NULL,
	body varchar(255) DEFAULT NULL,
	extra_data text,
	notification_type varchar(50) DEFAULT NULL,		
	is_read BOOLEAN DEFAULT FALSE,
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);
