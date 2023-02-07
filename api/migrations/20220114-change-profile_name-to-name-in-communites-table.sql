ALTER TABLE communities 
RENAME COLUMN profile_name TO name;

ALTER TABLE communities 
ADD COLUMN artist_id VARCHAR(200) NOT NULL;