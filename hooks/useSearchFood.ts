import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { searchFood, ProductSearchItem } from '../lib/openFoodFacts';
import { verifiedFoods } from '../constants/VerifiedFoods';

export const useSearchFood = () => {
    const { session } = useAuth();
    const [results, setResults] = useState<ProductSearchItem[]>([]);
    const [loading, setLoading] = useState(false);

    const search = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const queryLower = query.toLowerCase();

            // 1. Search Local Verified Foods (Priority)
            const matchedVerified = verifiedFoods.filter(food =>
                food.product_name.toLowerCase().includes(queryLower)
            ).map(f => ({
                ...f,
                nutriments: {}, // Dummy for types if needed, though we use flat props in UI
                isVerified: true
            }));

            // 2. Search Open Food Facts
            const offResults = await searchFood(query);

            // 3. Search Custom Foods from Supabase (if user is logged in)
            let customFoods: ProductSearchItem[] = [];
            if (session?.user) {
                const { data, error } = await supabase
                    .from('custom_foods')
                    .select('*')
                    .or(`user_id.eq.${session.user.id},is_public.eq.true`)
                    .ilike('food_name', `%${query}%`)
                    .limit(10);

                if (!error && data) {
                    customFoods = data.map((food: any) => ({
                        code: food.id,
                        product_name: food.food_name,
                        calories: food.calories,
                        protein: Number(food.protein) || 0,
                        carbs: Number(food.carbs) || 0,
                        fat: Number(food.fat) || 0,
                        serving_size: food.serving_size || '100g',
                        brands: 'Custom',
                        isCustom: true,
                    }));
                }
            }

            // 4. Combine Results: Verified -> Custom -> API
            // Filter out API results that might be duplicates of verified ones (fuzzy match)
            const cleanOffResults = offResults.filter(off => {
                const isDuplicate = matchedVerified.some(v =>
                    v.product_name.toLowerCase() === off.product_name.toLowerCase()
                );
                return !isDuplicate;
            });

            setResults([...matchedVerified, ...customFoods, ...cleanOffResults]);

        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return { search, results, loading, setResults };
};
