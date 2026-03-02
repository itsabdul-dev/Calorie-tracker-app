export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    daily_calorie_goal: number;
    created_at: string;
    updated_at: string;
}

export interface FoodEntry {
    id: string;
    user_id: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_size: string | null;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string; // YYYY-MM-DD
    barcode: string | null;
    open_food_facts_id: string | null;
    is_custom: boolean;
    is_ai_generated?: boolean;
    ai_confidence?: 'high' | 'medium' | 'low';
    food_image_url?: string;
    created_at: string;
}

export interface WeightLog {
    id: string;
    user_id: string;
    weight: number;
    date: string;
    created_at: string;
}

export interface DailyStats {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    caloriesGoal: number;
}

export interface UserGoals {
    id: string;
    user_id: string;
    protein_goal: number;
    carbs_goal: number;
    fat_goal: number;
    created_at: string;
    updated_at: string;
}

export interface UserStreak {
    id: string;
    user_id: string;
    current_streak: number;
    best_streak: number;
    last_logged_date: string | null;
    created_at: string;
    updated_at: string;
}
