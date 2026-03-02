-- Water Intake Table for tracking daily hydration

CREATE TABLE IF NOT EXISTS water_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

-- Users can only see their own water intake
CREATE POLICY "Users can view own water intake"
    ON water_intake FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own water intake
CREATE POLICY "Users can insert own water intake"
    ON water_intake FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own water intake
CREATE POLICY "Users can update own water intake"
    ON water_intake FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own water intake
CREATE POLICY "Users can delete own water intake"
    ON water_intake FOR DELETE
    USING (auth.uid() = user_id);
