export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
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
    caloriesConsumed: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatConsumed: number;
    caloriesGoal: number;
}
