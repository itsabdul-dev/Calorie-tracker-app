import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductByBarcode, ProductSearchItem } from '../../lib/openFoodFacts';
import { useSearchFood } from '../../hooks/useSearchFood';
import { useFoodEntries } from '../../hooks/useFoodEntries';
import Colors from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants';
import { Search, ScanLine, Plus, X, ChevronLeft, Zap, Flame, Droplet, Coffee, Sun, Moon, Utensils, Scale } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/Button';
import { AddFoodSuccess } from '../../components/AddFoodSuccess';
import { hapticFeedback } from '../../utils/haptics';
import { FoodCardSkeleton } from '../../components/SkeletonLoader';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';

export default function AddFoodScreen() {
    const params = useLocalSearchParams();
    const initialMeal = params.meal === 'null' ? null : params.meal;
    const date = params.date || format(new Date(), 'yyyy-MM-dd');
    const router = useRouter();

    // Search & Scan State
    const [query, setQuery] = useState('');
    const { search, results, loading: searchLoading } = useSearchFood();
    const [scanning, setScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    // Food Entry State
    const { addEntry } = useFoodEntries(date as string);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Selection & Detail Modal State
    const [selectedFood, setSelectedFood] = useState<ProductSearchItem | null>(null);
    const [servingWeight, setServingWeight] = useState('100'); // Default 100g
    const [selectedMeal, setSelectedMeal] = useState<string | null>(typeof initialMeal === 'string' ? initialMeal : null);

    // Calculated Macros
    const macros = useMemo(() => {
        if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const weight = parseFloat(servingWeight) || 0;
        const ratio = weight / 100;

        return {
            calories: Math.round(selectedFood.calories * ratio),
            protein: Math.round(selectedFood.protein * ratio * 10) / 10,
            carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
            fat: Math.round(selectedFood.fat * ratio * 10) / 10,
        };
    }, [selectedFood, servingWeight]);

    const handleSearch = () => {
        hapticFeedback.selection();
        search(query);
    };

    const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;
        hapticFeedback.medium();
        setScanned(true);
        setScanning(false);
        setLoading(true);

        const product = await getProductByBarcode(data);
        if (product) {
            openFoodDetail(product);
        } else {
            Alert.alert('Not found', 'Product not found in database.');
            setScanned(false);
        }
        setLoading(false);
    };

    const openFoodDetail = (product: ProductSearchItem) => {
        setSelectedFood(product);
        setServingWeight('100'); // Reset to 100g base
        // Keep selectedMeal if already set via params, otherwise it's null
        hapticFeedback.light();
    };

    const confirmAddFood = async () => {
        if (!selectedFood) return;
        if (!selectedMeal) {
            Alert.alert('Select Meal', 'Please choose which meal to add this to.');
            return;
        }

        setLoading(true);
        hapticFeedback.medium();

        const entry = {
            food_name: selectedFood.product_name || 'Unknown Food',
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            serving_size: `${servingWeight}g`,
            meal_type: selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            open_food_facts_id: selectedFood.code,
            is_custom: selectedFood.isCustom || false
        };

        try {
            await addEntry(entry);
            setSelectedFood(null); // Close modal first
            setShowSuccess(true);
        } catch (e) {
            hapticFeedback.error();
            console.error(e);
            Alert.alert('Error', 'Failed to add food.');
        } finally {
            setLoading(false);
        }
    };

    const onSuccessComplete = () => {
        setShowSuccess(false);
        router.push('/(tabs)');
    };

    const startScanning = async () => {
        hapticFeedback.light();
        if (!permission) {
            const { status } = await requestPermission();
            if (status === 'granted') {
                setScanning(true);
                setScanned(false);
            }
        } else if (!permission.granted) {
            const { status } = await requestPermission();
            if (status === 'granted') {
                setScanning(true);
                setScanned(false);
            } else {
                Alert.alert('Permission needed', 'Camera permission is required to scan barcodes.');
            }
        } else {
            setScanning(true);
            setScanned(false);
        }
    };

    // Helper functions for UI
    const getMealColor = (m: string) => {
        switch (m) {
            case 'breakfast': return Colors.macros.carbs;
            case 'lunch': return Colors.macros.fat;
            case 'dinner': return Colors.primary[500];
            case 'snack': return Colors.macros.protein;
            default: return Colors.primary[500];
        }
    };
    const getMealIcon = (m: string) => {
        switch (m) {
            case 'breakfast': return <Coffee size={24} color={Colors.macros.carbs} />;
            case 'lunch': return <Sun size={24} color={Colors.macros.fat} />;
            case 'dinner': return <Moon size={24} color={Colors.primary[500]} />;
            case 'snack': return <Utensils size={24} color={Colors.macros.protein} />;
            default: return <Plus size={24} color={Colors.primary[500]} />;
        }
    };

    if (scanning) {
        return (
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
                    }}
                />
                <View style={styles.scannerOverlay}>
                    <BlurView intensity={20} tint="dark" style={styles.scannerHeader}>
                        <Text style={styles.scannerText}>Scan Barcode</Text>
                        <TouchableOpacity
                            onPress={() => setScanning(false)}
                            style={styles.cancelScan}
                        >
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>
                    <View style={styles.scanFrame} />
                    <Text style={styles.scanInstruction}>Point at a food barcode to scan</Text>
                </View>
            </View>
        );
    }

    const mealTitle = (typeof initialMeal === 'string' && initialMeal) ? initialMeal.charAt(0).toUpperCase() + initialMeal.slice(1) : 'Food';

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={Colors.gradients.hero as any}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.navBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ChevronLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add {mealTitle}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* Search Bar Floating */}
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchInputContainer}>
                            <Search size={20} color={Colors.neutral[500]} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search food (e.g. Banana)"
                                placeholderTextColor={Colors.neutral[400]}
                                value={query}
                                onChangeText={setQuery}
                                onSubmitEditing={handleSearch}
                                returnKeyType="search"
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery('')}>
                                    <X size={16} color={Colors.neutral[400]} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
                            <ScanLine size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.contentContainer}>
                {(loading || searchLoading) && (
                    <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                        <FoodCardSkeleton />
                        <FoodCardSkeleton />
                        <FoodCardSkeleton />
                    </View>
                )}

                <FlatList
                    data={results}
                    keyExtractor={(item, index) => item.code || index.toString()}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: index * 50 }}
                        >
                            <TouchableOpacity
                                style={styles.resultCard}
                                onPress={() => openFoodDetail(item)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName} numberOfLines={1}>{item.product_name}</Text>
                                    <View style={styles.resultMeta}>
                                        <Text style={styles.resultServing}>{item.serving_size || '100g'}</Text>
                                        <Text style={styles.resultBrand}>{item.brands}</Text>
                                    </View>

                                    {/* Base Macros Display (per 100g basically) */}
                                    <View style={styles.macroPills}>
                                        <View style={[styles.macroPill, { backgroundColor: Colors.macros.carbs + '20' }]}>
                                            <Flame size={10} color={Colors.macros.carbs} />
                                            <Text style={[styles.macroText, { color: Colors.macros.carbs }]}>{Math.round(item.calories)}</Text>
                                        </View>
                                        <View style={[styles.macroPill, { backgroundColor: Colors.macros.fat + '20' }]}>
                                            <Droplet size={10} color={Colors.macros.fat} />
                                            <Text style={[styles.macroText, { color: Colors.macros.fat }]}>{Math.round(item.protein)}g</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.addButton}>
                                    <Plus size={20} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                        </MotiView>
                    )}
                    ListEmptyComponent={
                        !searchLoading && query ? (
                            <MotiView
                                from={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={styles.emptyState}
                            >
                                <Text style={styles.emptyTitle}>No matches found</Text>
                                <Text style={styles.emptySubtitle}>Try searching for something else or scan a barcode.</Text>
                                <Button
                                    title="Create Custom Food"
                                    onPress={() => router.push('/create-food')}
                                    variant="secondary"
                                    icon={<Plus size={18} color={Colors.neutral[900]} />}
                                />
                                <View style={{ marginTop: 20 }} />
                            </MotiView>
                        ) : null
                    }
                />
            </View>

            {/* Food Detailed Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedFood}
                onRequestClose={() => setSelectedFood(null)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={() => setSelectedFood(null)}
                        activeOpacity={1}
                    >
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </TouchableOpacity>

                    <View style={styles.detailModalContent}>
                        <View style={styles.modalHandle} />

                        <View style={styles.detailHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailTitle}>{selectedFood?.product_name}</Text>
                                <Text style={styles.detailSubtitle}>{selectedFood?.brands || 'Generic'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.closeDetailButton}>
                                <X size={24} color={Colors.neutral[500]} />
                            </TouchableOpacity>
                        </View>

                        {/* Weight Input */}
                        <View style={styles.weightInputContainer}>
                            <View style={styles.weightLabelContainer}>
                                <Scale size={20} color={Colors.primary[600]} />
                                <Text style={styles.weightLabel}>Quantity (g)</Text>
                            </View>
                            <View style={styles.weightInputWrapper}>
                                <TextInput
                                    style={styles.weightInput}
                                    value={servingWeight}
                                    onChangeText={setServingWeight}
                                    keyboardType="numeric"
                                    placeholder="100"
                                    selectTextOnFocus
                                />
                                <Text style={styles.weightUnit}>g</Text>
                            </View>
                        </View>

                        {/* Live Macro Preview */}
                        <View style={styles.liveStatsRow}>
                            <View style={[styles.liveStatCard, { backgroundColor: Colors.macros.carbs + '15' }]}>
                                <Text style={[styles.liveStatValue, { color: Colors.macros.carbs }]}>{macros.calories}</Text>
                                <Text style={styles.liveStatLabel}>Calories</Text>
                            </View>
                            <View style={[styles.liveStatCard, { backgroundColor: Colors.macros.protein + '15' }]}>
                                <Text style={[styles.liveStatValue, { color: Colors.macros.protein }]}>{macros.protein}g</Text>
                                <Text style={styles.liveStatLabel}>Protein</Text>
                            </View>
                            <View style={[styles.liveStatCard, { backgroundColor: Colors.macros.fat + '15' }]}>
                                <Text style={[styles.liveStatValue, { color: Colors.macros.fat }]}>{macros.carbs}g</Text>
                                <Text style={styles.liveStatLabel}>Carbs</Text>
                            </View>
                            <View style={[styles.liveStatCard, { backgroundColor: Colors.primary[500] + '15' }]}>
                                <Text style={[styles.liveStatValue, { color: Colors.primary[700] }]}>{macros.fat}g</Text>
                                <Text style={styles.liveStatLabel}>Fat</Text>
                            </View>
                        </View>

                        {/* Meal Selection Tabs */}
                        <Text style={styles.sectionLabel}>Add to Meal</Text>
                        <View style={styles.mealTabs}>
                            {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => {
                                const isSelected = selectedMeal === m;
                                return (
                                    <TouchableOpacity
                                        key={m}
                                        onPress={() => {
                                            hapticFeedback.selection();
                                            setSelectedMeal(m);
                                        }}
                                        style={[
                                            styles.mealTab,
                                            isSelected && { backgroundColor: getMealColor(m), borderColor: getMealColor(m) }
                                        ]}
                                    >
                                        <Text style={[styles.mealTabText, isSelected && { color: '#FFF' }]}>
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={{ marginTop: 24, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}>
                            <Button
                                title={`Add Food  •  ${macros.calories} kcal`}
                                onPress={confirmAddFood}
                                disabled={loading || !selectedMeal}
                                loading={loading}
                                icon={<Plus size={20} color="#FFF" />}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <AddFoodSuccess visible={showSuccess} onComplete={onSuccessComplete} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    headerContainer: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: Colors.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    searchWrapper: {
        flexDirection: 'row',
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.neutral[900],
    },
    scanButton: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: Colors.accent[500],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.accent[700],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    contentContainer: {
        flex: 1,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[900],
        marginBottom: 4,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    resultServing: {
        fontSize: 13,
        color: Colors.neutral[500],
    },
    resultBrand: {
        fontSize: 13,
        color: Colors.neutral[400],
        fontStyle: 'italic',
    },
    macroPills: {
        flexDirection: 'row',
        gap: 8,
    },
    macroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    macroText: {
        fontSize: 11,
        fontWeight: '700',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[900],
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.neutral[500],
        textAlign: 'center',
    },
    // Scanner Styles
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingBottom: 50,
    },
    scannerHeader: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scannerText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    cancelScan: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00FF00',
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    scanInstruction: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 14,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
    // Detail Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    detailModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 24,
        minHeight: 500,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    detailTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.neutral[900],
        marginBottom: 4,
    },
    detailSubtitle: {
        fontSize: 16,
        color: Colors.neutral[500],
        fontStyle: 'italic',
    },
    closeDetailButton: {
        padding: 4,
    },
    weightInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F7F8FA',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    weightLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    weightLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[700],
    },
    weightInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ECEFF1',
        minWidth: 100,
        justifyContent: 'center',
    },
    weightInput: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.neutral[900],
        textAlign: 'center',
        width: 60,
    },
    weightUnit: {
        fontSize: 16,
        color: Colors.neutral[500],
        marginLeft: 4,
    },
    liveStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 24,
    },
    liveStatCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    liveStatValue: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    liveStatLabel: {
        fontSize: 12,
        color: Colors.neutral[600],
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[800],
        marginBottom: 12,
    },
    mealTabs: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    mealTab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ECEFF1',
        backgroundColor: '#FFFFFF',
    },
    mealTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.neutral[600],
    },
});
