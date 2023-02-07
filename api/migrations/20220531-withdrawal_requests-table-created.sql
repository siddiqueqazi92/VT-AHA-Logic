CREATE TABLE withdrawal_requests (
	id serial PRIMARY KEY,
	user_id VARCHAR ( 200 ) NOT NULL,	
	stripe_account_id varchar(100) NOT NULL,
	available_amount NUMERIC (20, 2) DEFAULT 0,
	status_id INT DEFAULT NULL,	
	
	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);
