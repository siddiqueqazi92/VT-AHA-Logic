
CREATE TABLE user_cards (
	id serial PRIMARY KEY,	
	user_id VARCHAR ( 200 ) NOT NULL,
	card_id VARCHAR ( 200 ) NOT NULL,	
	brand VARCHAR ( 50 ) NOT NULL,
	country VARCHAR ( 30 ) NOT NULL,
	exp_month INT NULL,
	exp_year INT  NULL,
	last4 VARCHAR ( 4 ) NULL,
	is_selected BOOLEAN DEFAULT false
);

