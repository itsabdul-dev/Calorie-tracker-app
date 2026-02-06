
export interface ProductSearchItem {
    code: string;
    product_name: string;
    brands?: string;
    image_url?: string;
    nutriments: {
        'energy-kcal_100g'?: number;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
    };
    serving_size?: string;
}

export const searchFood = async (query: string, page = 1): Promise<ProductSearchItem[]> => {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
                query
            )}&json=true&page=${page}&page_size=20`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('Error searching food:', error);
        return [];
    }
};

export const getProductByBarcode = async (barcode: string): Promise<ProductSearchItem | null> => {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.status === 1) {
            return data.product;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }
};
