import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Save, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { hapticFeedback } from '../utils/haptics';

export default function CreateFoodScreen() {
    const router = useRouter();
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [servingSize, setServingSize] = useState('100g');

    const handleCreate = async () => {
        hapticFeedback.light();
        if (!foodName || !calories) {
            hapticFeedback.error();
            Alert.alert('Missing Info', 'Please enter a food name and calories.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('custom_foods').insert({
                user_id: session?.user?.id,
                food_name: foodName,
                calories: parseInt(calories),
                protein: parseFloat(protein) || 0,
                carbs: parseFloat(carbs) || 0,
                fat: parseFloat(fat) || 0,
                serving_size: servingSize,
                is_public: false
            });

            if (error) throw error;

            setSuccess(true);
            hapticFeedback.success();

            // Wait for animation
            setTimeout(() => {
                router.back();
            }, 1000);

        } catch (error) {
            console.error('Error creating food:', error);
            hapticFeedback.error();
            Alert.alert('Error', 'Failed to create food. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.successContainer}>
                <MotiView
                    from={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    style={styles.successIcon}
                >
                    <Check size={64} color="#FFF" />
                </MotiView>
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 200 }}
                >
                    <Text style={styles.successText}>Food Created!</Text>
                </MotiView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={[Colors.primary[800], Colors.primary[600]]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.navBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ChevronLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>New Custom Food</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </LinearGradient>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 100 }}
                        style={styles.card}
                    >
                        <Text style={styles.sectionTitle}>Basic Info</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Food Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Grandma's Apple Pie"
                                value={foodName}
                                onChangeText={setFoodName}
                                placeholderTextColor="#90A4AE"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Calories</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={calories}
                                        onChangeText={setCalories}
                                        keyboardType="numeric"
                                        placeholderTextColor="#90A4AE"
                                    />
                                    <Text style={styles.unitText}>kcal</Text>
                                </View>
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Serving Size</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 100g"
                                    value={servingSize}
                                    onChangeText={setServingSize}
                                    placeholderTextColor="#90A4AE"
                                />
                            </View>
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200 }}
                        style={styles.card}
                    >
                        <Text style={styles.sectionTitle}>Macros (Optional)</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Protein</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={protein}
                                    onChangeText={setProtein}
                                    keyboardType="numeric"
                                    placeholderTextColor="#90A4AE"
                                />
                                <Text style={[styles.macroUnit, { color: Colors.macros.protein }]}>g</Text>
                            </View>

                            <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 4 }]}>
                                <Text style={styles.label}>Carbs</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={carbs}
                                    onChangeText={setCarbs}
                                    keyboardType="numeric"
                                    placeholderTextColor="#90A4AE"
                                />
                                <Text style={[styles.macroUnit, { color: Colors.macros.carbs }]}>g</Text>
                            </View>

                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Fat</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={fat}
                                    onChangeText={setFat}
                                    keyboardType="numeric"
                                    placeholderTextColor="#90A4AE"
                                />
                                <Text style={[styles.macroUnit, { color: Colors.macros.fat }]}>g</Text>
                            </View>
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 300 }}
                    >
                        <TouchableOpacity
                            style={[styles.createButton, loading && styles.disabledButton]}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[Colors.primary[600], Colors.primary[500]]}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.createButtonText}>{loading ? 'Saving...' : 'Save Food'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </MotiView>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    // Header
    headerContainer: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: Colors.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        zIndex: 10,
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
    // Content
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 30,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#263238',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#546E7A',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F7F9FA',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#263238',
        borderWidth: 1,
        borderColor: '#ECEFF1',
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    unitText: {
        position: 'absolute',
        right: 16,
        color: '#90A4AE',
        fontSize: 14,
    },
    macroUnit: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        fontSize: 12,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        marginBottom: -16, // Offset the last margin
    },
    // Button
    createButton: {
        borderRadius: 20,
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginTop: 10,
    },
    buttonGradient: {
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    disabledButton: {
        opacity: 0.7,
    },
    // Success Screen
    successContainer: {
        flex: 1,
        backgroundColor: Colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
