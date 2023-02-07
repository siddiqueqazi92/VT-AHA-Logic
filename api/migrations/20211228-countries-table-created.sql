CREATE TABLE countries (
	id serial PRIMARY KEY,	
	country_code CITEXT DEFAULT NULL,
	alpha3 CITEXT DEFAULT NULL,
	en CITEXT DEFAULT NULL,
	ar CITEXT DEFAULT NULL,
	currency_code CITEXT DEFAULT NULL,
	dial_code varchar(10) DEFAULT NULL,
	flag varchar(255) DEFAULT NULL,

	"createdAt" TIMESTAMP NOT NULL,        
	"updatedAt" TIMESTAMP NOT NULL  
);

