
CREATE TABLE artist_wallet_history (
	id serial PRIMARY KEY,	
	artist_id VARCHAR ( 200 ) NOT NULL,	
	order_id INT NOT NULL,
	art_id INT NOT NULL,
	title VARCHAR(50),
	amount INT NOT NULL	
);

