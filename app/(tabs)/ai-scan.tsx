import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput, Platform, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';
import { analyzeFoodImage, AIAnalysisResult } from '../../lib/gemini';
import Colors from '../../constants/Colors';
import { Button } from '../../components/Button';
import { useFoodEntries } from '../../hooks/useFoodEntries';
import { format } from 'date-fns';
import { hapticFeedback } from '../../utils/haptics';
import { Zap, Flame, Droplet, Check, RefreshCw, Image as ImageIcon, Camera } from 'lucide-react-native';

export default function AIScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AIAnalysisResult | null>(null);
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const router = useRouter();
    const { addEntry } = useFoodEntries(format(new Date(), 'yyyy-MM-dd'));

    // Edit state
    const [selectedFoodIndex, setSelectedFoodIndex] = useState(0);
    const [adjustedPortion, setAdjustedPortion] = useState('100'); // grams
    const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        (async () => {
            if (permission && !permission.granted && permission.canAskAgain) {
                await requestPermission();
            }
        })();
    }, [permission]);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            hapticFeedback.light();
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8, // Higher quality, we compress later
                    skipProcessing: true, // Faster capture
                });
                if (photo?.uri) {
                    setImage(photo.uri);
                    analyzeImage(photo.uri);
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to take photo');
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            setImage(result.assets[0].uri);
            analyzeImage(result.assets[0].uri);
        }
    };

    const analyzeImage = async (uri: string) => {
        setAnalyzing(true);
        const data = await analyzeFoodImage(uri);
        setAnalyzing(false);

        if (data) {
            if (data.error) {
                Alert.alert('AI Error', data.error);
                setImage(null);
            } else {
                setResult(data);
                if (data.foods && data.foods.length > 0) {
                    const firstFood = data.foods[0];
                    const weight = firstFood.weight_g || (firstFood.portion_size.match(/(\d+)g/)?.[1] ? parseInt(firstFood.portion_size.match(/(\d+)g/)![1]) : 100);
                    setAdjustedPortion(weight.toString());
                }
                hapticFeedback.success();
            }
        } else {
            Alert.alert('Error', 'Failed to analyze image. Check your internet or API key.');
            setImage(null);
        }
    };

    const reset = () => {
        setImage(null);
        setResult(null);
        setAdjustedPortion('100');
    };

    const confirmAddFood = async () => {
        if (!result || !result.foods[selectedFoodIndex]) return;

        const food = result.foods[selectedFoodIndex];
        const ratio = (parseFloat(adjustedPortion) || 100) / 100; // Assuming API returns per 100g or portion is roughly 100g base if not specified. 
        // NOTE: The prompt asks for "per 100g", so we assume the values in `food` are per 100g if not otherwise specified or if we treat them as such.
        // Actually, the prompt asks to "Calculate nutrition per 100g AND for the visible portion".
        // The interface defines `calories`, etc. which usually we take as the "visible portion" or we need to clarify. 
        // Let's assume the values returned are for the ESTIMATED PORTION size string. 
        // But for editing, we need a base. Let's assume user is editing grams and we scale linearly.
        // Simpler: Just rely on the returned values for the ESTIMATED portion, and if user changes "100g" we need to know what the original weight was.
        // Limitation: The AI might say "1 Apple" and give calories. If user types "200", is that 200 items or grams?
        // To be safe: We will just save the values as returned for now, or assume the "portion_size" string contains a weight. 
        // For this V1, let's just allow adding what the AI found, OR a simple multiplier if we had one.
        // Let's stick to the prompt's `calories` which are for the portion. 
        // If we want to scale, we'd need per 100g. 
        // Let's keep it simple: Add exactly what AI found. 
        // If users want to edit, they can edit in the "Add Food" screen flow? No, requirements say "User can adjust serving size".

        // Let's assume the editing just updates the TEXT for now, complex scaling requires parsing "portion_size" (e.g. "200g").
        // We will try to parse grams from `portion_size` to allow scaling.

        let multiplier = 1;
        // Use the explicit weight_g from AI if available, otherwise try to parse from string, default to 100g
        const estimatedGrams = food.weight_g || (food.portion_size.match(/(\d+)g/)?.[1] ? parseInt(food.portion_size.match(/(\d+)g/)![1]) : 100);

        const inputGrams = parseFloat(adjustedPortion);

        if (!isNaN(inputGrams) && estimatedGrams > 0) {
            multiplier = inputGrams / estimatedGrams;
        }

        const entry = {
            food_name: food.name,
            calories: Math.round(food.calories * multiplier),
            protein: Math.round(food.protein * multiplier),
            carbs: Math.round(food.carbs * multiplier),
            fat: Math.round(food.fat * multiplier),
            serving_size: `${inputGrams}g`,
            meal_type: selectedMeal,
            is_ai_generated: true,
            ai_confidence: food.confidence,
            food_image_url: image || undefined, // In a real app we'd upload this. Local URI might not persist well but works for session.
            is_custom: false,
        };

        await addEntry(entry);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            reset();
            router.push('/(tabs)');
        }, 1500);
    };

    // Helper for meal selection
    const MealSelector = () => (
        <View style={styles.mealSelector}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
                <TouchableOpacity
                    key={m}
                    onPress={() => { hapticFeedback.selection(); setSelectedMeal(m); }}
                    style={[
                        styles.mealOption,
                        selectedMeal === m && { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500] }
                    ]}
                >
                    <Text style={[styles.mealtext, selectedMeal === m && { color: '#FFF' }]}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {!image ? (
                <CameraView style={styles.camera} facing="back" flash={flash} ref={cameraRef}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={styles.topGradient}
                    >
                        <TouchableOpacity onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')} style={styles.iconButton}>
                            <Zap size={24} color={flash === 'on' ? Colors.accent[500] : '#FFF'} fill={flash === 'on' ? Colors.accent[500] : 'none'} />
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.overlay}>
                        <View style={styles.scanFrame} />
                        <Text style={styles.hintText}>Center food in frame</Text>
                    </View>

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.controls}
                    >
                        <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                            <ImageIcon size={24} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        <View style={{ width: 40 }} />
                    </LinearGradient>
                </CameraView>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />

                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    <Image source={{ uri: image }} style={styles.focusedImage} />

                    {analyzing && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={Colors.primary[500]} />
                            <Text style={styles.loadingText}>Analyzing Food...</Text>
                            <Text style={styles.loadingSub}>Identifying calories & macros</Text>
                        </View>
                    )}

                    {!analyzing && result && (
                        <MotiView
                            from={{ translateY: 300 }}
                            animate={{ translateY: 0 }}
                            style={styles.resultCard}
                        >
                            <View style={styles.resultHeader}>
                                <View>
                                    <Text style={styles.foodName}>{result.foods[selectedFoodIndex].name}</Text>
                                    <Text style={styles.confidenceText}>
                                        Confidence: <Text style={{ color: result.foods[selectedFoodIndex].confidence === 'high' ? Colors.success : Colors.warning }}>
                                            {result.foods[selectedFoodIndex].confidence.toUpperCase()}
                                        </Text>
                                    </Text>
                                </View>
                                <View style={styles.calorieBadge}>
                                    <Flame size={14} color="#FF5722" fill="#FF5722" />
                                    <Text style={styles.calorieCount}>{result.foods[selectedFoodIndex].calories}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Macro Bars */}
                            <View style={styles.macroRow}>
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroVal, { color: Colors.macros.protein }]}>{result.foods[selectedFoodIndex].protein}g</Text>
                                    <Text style={styles.macroLabel}>Protein</Text>
                                </View>
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroVal, { color: Colors.macros.carbs }]}>{result.foods[selectedFoodIndex].carbs}g</Text>
                                    <Text style={styles.macroLabel}>Carbs</Text>
                                </View>
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroVal, { color: Colors.macros.fat }]}>{result.foods[selectedFoodIndex].fat}g</Text>
                                    <Text style={styles.macroLabel}>Fat</Text>
                                </View>
                            </View>

                            {/* Edit Portion */}
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Serving Size (g)</Text>
                                <TextInput
                                    style={styles.weightInput}
                                    value={adjustedPortion}
                                    onChangeText={setAdjustedPortion}
                                    keyboardType="numeric"
                                    placeholder="100"
                                />
                            </View>

                            <MealSelector />

                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={reset} style={styles.retakeButton}>
                                    <RefreshCw size={20} color={Colors.neutral[600]} />
                                </TouchableOpacity>
                                <Button
                                    title="Add Food"
                                    onPress={confirmAddFood}
                                    style={{ flex: 1, marginLeft: 12 }}
                                    icon={<Check size={20} color="#FFF" />}
                                />
                            </View>
                        </MotiView>
                    )}
                </View>
            )}

            {showSuccess && (
                <View style={styles.successOverlay}>
                    <MotiView
                        from={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={styles.successCard}
                    >
                        <Check size={50} color="#FFF" />
                        <Text style={styles.successText}>Added!</Text>
                    </MotiView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
    },
    permissionText: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    topGradient: {
        height: 100,
        justifyContent: 'flex-start',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: Colors.primary[500],
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    hintText: {
        color: '#FFF',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    controls: {
        height: 150,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 30,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#FFF',
    },
    galleryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Preview
    previewContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    previewImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    focusedImage: {
        width: '100%',
        height: 400,
        position: 'absolute',
        top: 0,
        resizeMode: 'cover',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 10,
    },
    loadingText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginTop: 20,
    },
    loadingSub: {
        color: Colors.neutral[400],
        fontSize: 14,
        marginTop: 5,
    },
    resultCard: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    foodName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.neutral[900],
    },
    confidenceText: {
        fontSize: 12,
        color: Colors.neutral[500],
        marginTop: 4,
    },
    calorieBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    calorieCount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E65100',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 20,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    macroItem: {
        alignItems: 'center',
        flex: 1,
    },
    macroVal: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    macroLabel: {
        fontSize: 12,
        color: Colors.neutral[500],
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#F7F8FA',
        padding: 12,
        borderRadius: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[700],
    },
    weightInput: {
        backgroundColor: '#FFF',
        width: 80,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    mealSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 8,
    },
    mealOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    mealtext: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.neutral[600],
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    retakeButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 20,
    },
    successCard: {
        width: 150,
        height: 150,
        backgroundColor: Colors.success,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },
});
