-- AI Scanner Fields
ALTER TABLE food_entries 
ADD COLUMN is_ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN ai_confidence TEXT CHECK (ai_confidence IN ('high', 'medium', 'low')),
ADD COLUMN food_image_url TEXT;
