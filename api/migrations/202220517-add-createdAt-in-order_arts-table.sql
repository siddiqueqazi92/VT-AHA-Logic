ALTER TABLE order_arts 
ADD COLUMN "createdAt" TIMESTAMP  DEFAULT NOW(),        
ADD COLUMN	"updatedAt" TIMESTAMP  DEFAULT NOW();
