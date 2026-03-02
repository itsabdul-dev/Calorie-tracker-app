export interface ProductSearchItem {
    code: string;
    product_name: string;
    brands?: string;
    image_url?: string;
    serving_size?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    nutrition_grade?: string;
    isCustom?: boolean; // Flag for custom foods
    isVerified?: boolean; // Flag for verified common foods
}

const BASE_URL = 'https://world.openfoodfacts.org';

export const searchFood = async (query: string, limit = 20): Promise<ProductSearchItem[]> => {
    try {
        // Use v1 API for full-text search with better filtering
        const response = await fetch(
            `${BASE_URL}/cgi/search.pl?` +
            `search_terms=${encodeURIComponent(query)}&` +
            `search_simple=1&` +
            `action=process&` +
            `json=1&` +
            `page_size=${limit}&` +
            `fields=code,product_name,brands,nutriments,nutrition_grades,serving_size,countries_tags&` +
            `sort_by=unique_scans_n&` + // Sort by popularity
            `tagtype_0=countries&` +
            `tag_contains_0=contains&` +
            `tag_0=south-africa` // Prioritize South African products
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Filter and sort results
        // Use explicit any for product to avoid strict type issues with raw API data
        const products = (data.products || [])
            .filter((product: any) => {
                // Filter out products without essential data
                if (!product.product_name || !product.nutriments) return false;

                // Filter out products with non-Latin scripts (Arabic, Chinese, etc.)
                const name = product.product_name.toLowerCase();
                const hasNonLatin = /[\u0600-\u06FF\u4E00-\u9FFF\u0400-\u04FF]/.test(name);
                if (hasNonLatin) return false;

                // Must have calorie data
                const hasCalories = product.nutriments['energy-kcal_100g'] ||
                    product.nutriments['energy-kcal'] ||
                    product.nutriments['energy_100g'];
                return hasCalories;
            })
            .map((product: any) => {
                // Normalize the product data
                const nutriments = product.nutriments || {};

                return {
                    code: product.code,
                    product_name: product.product_name,
                    brands: product.brands || '',
                    serving_size: product.serving_size || '100g',
                    calories: Math.round(nutriments['energy-kcal_100g'] ||
                        nutriments['energy-kcal'] ||
                        (nutriments['energy_100g'] || 0) / 4.184),
                    protein: Number(nutriments['proteins_100g']) || 0,
                    carbs: Number(nutriments['carbohydrates_100g']) || 0,
                    fat: Number(nutriments['fat_100g']) || 0,
                    nutrition_grade: product.nutrition_grades || null,
                    isCustom: false
                };
            })
            // Sort by relevance: prioritize exact/partial matches
            .sort((a: ProductSearchItem, b: ProductSearchItem) => {
                const queryLower = query.toLowerCase();
                const aName = a.product_name.toLowerCase();
                const bName = b.product_name.toLowerCase();

                // Exact match first
                if (aName === queryLower) return -1;
                if (bName === queryLower) return 1;

                // Starts with query
                if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
                if (!aName.startsWith(queryLower) && bName.startsWith(queryLower)) return 1;

                // Shorter names first (usually more generic/common)
                return aName.length - bName.length;
            });

        return products;

    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};

export const getProductByBarcode = async (barcode: string): Promise<ProductSearchItem | null> => {
    try {
        const response = await fetch(
            `${BASE_URL}/api/v2/product/${barcode}?fields=code,product_name,brands,nutriments,nutrition_grades,serving_size`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 0 || !data.product) {
            return null;
        }

        const product = data.product;
        const nutriments = product.nutriments || {};

        return {
            code: product.code,
            product_name: product.product_name || 'Unknown Product',
            brands: product.brands || '',
            serving_size: product.serving_size || '100g',
            calories: Math.round(nutriments['energy-kcal_100g'] ||
                nutriments['energy-kcal'] ||
                (nutriments['energy_100g'] || 0) / 4.184),
            protein: Number(nutriments['proteins_100g']) || 0,
            carbs: Number(nutriments['carbohydrates_100g']) || 0,
            fat: Number(nutriments['fat_100g']) || 0,
            nutrition_grade: product.nutrition_grades || null,
            isCustom: false
        };

    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }
};
