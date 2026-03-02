import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert, TextInput, Image, ActivityIndicator, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { User, Target, Calendar, LogOut, Camera, Edit2, Flame, Zap, Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { hapticFeedback } from '../../utils/haptics';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import Colors from '../../constants/Colors';
import { useGoals } from '../../hooks/useGoals';
import { useStreaks } from '../../hooks/useStreaks';
import { useProfileStats } from '../../hooks/useProfileStats';
import { requestNotificationPermission, scheduleDailyTipNotification, cancelAllNotifications } from '../../lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AvatarFrame, LevelProgressBar, ProfileStats, AchievementBadges } from '../../components/profile';

export default function ProfileScreen() {
    const { profile, signOut, refreshProfile } = useAuth();
    const { goals, updateGoals } = useGoals();
    const { streak } = useStreaks();
    const { stats } = useProfileStats();
    const [goal, setGoal] = useState('2000');
    const [proteinGoal, setProteinGoal] = useState('150');
    const [carbsGoal, setCarbsGoal] = useState('200');
    const [fatGoal, setFatGoal] = useState('65');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingGoal, setEditingGoal] = useState(false);
    const [editingMacros, setEditingMacros] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Load notification preference on mount
    useEffect(() => {
        const loadNotificationPref = async () => {
            const enabled = await AsyncStorage.getItem('@notifications_enabled');
            setNotificationsEnabled(enabled === 'true');
        };
        loadNotificationPref();
    }, []);

    const toggleNotifications = async (value: boolean) => {
        hapticFeedback.selection();
        setNotificationsEnabled(value);

        if (value) {
            const granted = await requestNotificationPermission();
            if (granted) {
                await scheduleDailyTipNotification(10, 0); // 10:00 AM daily
                await AsyncStorage.setItem('@notifications_enabled', 'true');
                Alert.alert('Notifications Enabled', 'You will receive daily nutrition tips at 10:00 AM.');
            } else {
                setNotificationsEnabled(false);
                Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
            }
        } else {
            await cancelAllNotifications();
            await AsyncStorage.setItem('@notifications_enabled', 'false');
        }
    };

    useEffect(() => {
        if (profile?.daily_calorie_goal) {
            setGoal(profile.daily_calorie_goal.toString());
        }
        if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
            // If avatar_url is a path (not full URL), try to sign it (if private) or get public url
            // Assuming public bucket for avatars or signed url logic. 
            // For simplicity, let's assume we store the public URL or we need to download it.
            // If we store just the path (e.g. "avatars/my-image.png"), we need to getFromStorage.
            if (!profile.avatar_url.startsWith('http')) {
                downloadImage(profile.avatar_url);
            }
        }
    }, [profile]);

    // Sync macro goals from database
    useEffect(() => {
        if (goals) {
            setProteinGoal(goals.protein_goal?.toString() || '150');
            setCarbsGoal(goals.carbs_goal?.toString() || '200');
            setFatGoal(goals.fat_goal?.toString() || '65');
        }
    }, [goals]);

    const downloadImage = async (path: string) => {
        try {
            // Use Signed URL to bypass "Public Bucket" issues
            const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60 * 24 * 365); // 1 Year validity
            if (error) throw error;
            if (data?.signedUrl) {
                setAvatarUrl(data.signedUrl);
            }
        } catch (error) {
            console.log('Error downloading image: ', error);
        }
    }

    const pickImage = async () => {
        hapticFeedback.light();
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // Use the literal string array
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true, // Needed for supabase upload in Expo without blobs sometimes, but FileSystem is better
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                uploadAvatar(asset);
            }
        } catch (e: any) {
            Alert.alert('Error picking image', e.message);
        }
    };

    const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!profile?.id) return;
        if (!asset.base64) {
            Alert.alert("Error", "Could not process image (no base64)");
            return;
        }

        setUploading(true);
        try {
            const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
            const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const arrayBuffer = decode(asset.base64);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: asset.mimeType ?? 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Save the FILE PATH (not the full URL) to the database
            // This allows us to use createSignedUrl later
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: filePath })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            // Immediately display the new image
            downloadImage(filePath);

            hapticFeedback.success();
            refreshProfile();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Upload Failed', error.message);
            hapticFeedback.error();
        } finally {
            setUploading(false);
        }
    };

    const updateGoal = async () => {
        if (!profile) return;
        hapticFeedback.medium();

        // Toggle edit mode if not editing
        if (!editingGoal) {
            setEditingGoal(true);
            return;
        }

        setLoading(true);
        const newGoal = parseInt(goal, 10);

        if (isNaN(newGoal) || newGoal <= 0) {
            Alert.alert('Invalid Goal', 'Please enter a valid daily calorie goal.');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('users')
            .update({ daily_calorie_goal: newGoal })
            .eq('id', profile.id);

        if (error) {
            hapticFeedback.error();
            Alert.alert('Error', error.message);
        } else {
            hapticFeedback.success();
            refreshProfile();
            setEditingGoal(false);
        }
        setLoading(false);
    };

    const saveMacroGoals = async () => {
        hapticFeedback.medium();
        setLoading(true);
        try {
            await updateGoals({
                protein_goal: parseInt(proteinGoal, 10) || 0,
                carbs_goal: parseInt(carbsGoal, 10) || 0,
                fat_goal: parseInt(fatGoal, 10) || 0,
            });
            hapticFeedback.success();
            setEditingMacros(false);
        } catch (error: any) {
            hapticFeedback.error();
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    const handleSignOut = () => {
        hapticFeedback.warning();
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => {
                        hapticFeedback.medium();
                        signOut();
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} bounces={false}>
            {/* Hero Section with Parallax-like Gradient */}
            <View style={styles.heroContainer}>
                <LinearGradient
                    colors={[Colors.primary[800], Colors.primary[600], Colors.primary[500]]}
                    style={styles.heroSection}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Premium Avatar Frame */}
                    <Pressable onPress={pickImage}>
                        <AvatarFrame
                            avatarUrl={avatarUrl}
                            streak={streak?.current_streak || 0}
                            size={100}
                            uploading={uploading}
                        />
                        <View style={styles.editBadge}>
                            <Camera size={14} color="#FFF" />
                        </View>
                    </Pressable>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                        style={{ alignItems: 'center', paddingBottom: 10 }}
                    >
                        <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
                        <Text style={styles.userEmail}>{profile?.email}</Text>

                        {/* Streak Badge */}
                        {streak && streak.current_streak > 0 && (
                            <MotiView
                                from={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                                transition={{
                                    type: 'timing',
                                    duration: 1500,
                                    loop: true,
                                    repeatReverse: true,
                                    delay: 500
                                }}
                                style={styles.streakBadge}
                            >
                                <Flame size={20} color="#FF5722" fill="#FF5722" />
                                <Text style={styles.streakText}>{streak.current_streak} Day Streak! 🔥</Text>
                            </MotiView>
                        )}
                    </MotiView>

                    {/* Level Progress Bar */}
                    <LevelProgressBar
                        mealsLogged={stats.mealsLogged}
                        currentStreak={streak?.current_streak || 0}
                        daysActive={stats.daysActive}
                    />
                </LinearGradient>
            </View>

            <View style={styles.contentContainer}>
                {/* Quick Stats Summary */}
                <ProfileStats
                    mealsLogged={stats.mealsLogged}
                    daysActive={stats.daysActive}
                    currentStreak={streak?.current_streak || 0}
                />

                {/* Achievement Badges */}
                <AchievementBadges
                    mealsLogged={stats.mealsLogged}
                    currentStreak={streak?.current_streak || 0}
                    daysActive={stats.daysActive}
                    goalsMet={stats.goalsMet}
                />

                {/* Daily Goals Card */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 400 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#F0F4C3' }]}>
                            <Target size={24} color={Colors.primary[700]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Daily Calorie Goal</Text>
                            <Text style={styles.cardSubtitle}>Target for your nutrition</Text>
                        </View>
                        <Pressable onPress={() => { setEditingGoal(!editingGoal); hapticFeedback.selection(); }}>
                            <Edit2 size={18} color={Colors.neutral[400]} />
                        </Pressable>
                    </View>

                    <View style={styles.goalInputContainer}>
                        {editingGoal ? (
                            <TextInput
                                value={goal}
                                onChangeText={setGoal}
                                keyboardType="numeric"
                                autoFocus
                                style={styles.goalInput}
                            />
                        ) : (
                            <Text style={styles.goalValue}>{goal}</Text>
                        )}
                        <Text style={styles.goalUnit}>kcal</Text>
                    </View>

                    {editingGoal && (
                        <Pressable style={styles.saveButton} onPress={updateGoal}>
                            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save New Goal'}</Text>
                        </Pressable>
                    )}
                </MotiView>

                {/* Macro Goals Card */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 450 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                            <Zap size={24} color={Colors.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Macro Goals</Text>
                            <Text style={styles.cardSubtitle}>Daily protein, carbs & fat targets</Text>
                        </View>
                        <Pressable onPress={() => { setEditingMacros(!editingMacros); hapticFeedback.selection(); }}>
                            <Edit2 size={18} color={Colors.neutral[400]} />
                        </Pressable>
                    </View>

                    <View style={styles.macroGoalsRow}>
                        <View style={styles.macroGoalItem}>
                            {editingMacros ? (
                                <TextInput
                                    value={proteinGoal}
                                    onChangeText={setProteinGoal}
                                    keyboardType="numeric"
                                    style={styles.macroGoalInput}
                                />
                            ) : (
                                <Text style={[styles.macroGoalValue, { color: Colors.macros.protein }]}>{proteinGoal}g</Text>
                            )}
                            <Text style={styles.macroGoalLabel}>Protein</Text>
                        </View>
                        <View style={styles.macroGoalItem}>
                            {editingMacros ? (
                                <TextInput
                                    value={carbsGoal}
                                    onChangeText={setCarbsGoal}
                                    keyboardType="numeric"
                                    style={styles.macroGoalInput}
                                />
                            ) : (
                                <Text style={[styles.macroGoalValue, { color: Colors.macros.carbs }]}>{carbsGoal}g</Text>
                            )}
                            <Text style={styles.macroGoalLabel}>Carbs</Text>
                        </View>
                        <View style={styles.macroGoalItem}>
                            {editingMacros ? (
                                <TextInput
                                    value={fatGoal}
                                    onChangeText={setFatGoal}
                                    keyboardType="numeric"
                                    style={styles.macroGoalInput}
                                />
                            ) : (
                                <Text style={[styles.macroGoalValue, { color: Colors.macros.fat }]}>{fatGoal}g</Text>
                            )}
                            <Text style={styles.macroGoalLabel}>Fat</Text>
                        </View>
                    </View>

                    {editingMacros && (
                        <Pressable style={styles.saveButton} onPress={saveMacroGoals}>
                            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Macro Goals'}</Text>
                        </Pressable>
                    )}
                </MotiView>

                {/* Account Info Card */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 500 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#E1F5FE' }]}>
                            <Calendar size={24} color="#0288D1" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Member Details</Text>
                            <Text style={styles.cardSubtitle}>Your journey stats</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{profile?.email}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Joined</Text>
                        <Text style={styles.infoValue}>{new Date(profile?.created_at || Date.now()).toLocaleDateString()}</Text>
                    </View>
                </MotiView>

                {/* Notifications Card */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 550 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                            <Bell size={24} color="#FF5722" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Daily Tips</Text>
                            <Text style={styles.cardSubtitle}>Get nutrition reminders at 10 AM</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: Colors.neutral[200], true: Colors.primary[400] }}
                            thumbColor={notificationsEnabled ? Colors.primary[600] : '#f4f3f4'}
                        />
                    </View>
                </MotiView>

                {/* Sign Out Button */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 600 }}
                >
                    <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                        <LogOut size={20} color="#EF5350" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </Pressable>
                </MotiView>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    heroContainer: {
        overflow: 'hidden',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    heroSection: {
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    avatarWrapper: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    avatarImage: {
        width: 102,
        height: 102,
        borderRadius: 51,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.accent[500],
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500'
    },
    contentContainer: {
        padding: 24,
        marginTop: -20, // Slight overlap visual if we wanted, but let's keep it safe
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        shadowColor: Colors.primary[800],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(46, 125, 50, 0.04)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[900],
    },
    cardSubtitle: {
        fontSize: 13,
        color: Colors.neutral[500],
    },
    goalInputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 10,
    },
    goalValue: {
        fontSize: 42,
        fontWeight: '800',
        color: Colors.primary[700],
        letterSpacing: -1,
    },
    goalInput: {
        fontSize: 42,
        fontWeight: '800',
        color: Colors.primary[700],
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary[500],
        minWidth: 100,
        textAlign: 'center',
        paddingVertical: 0,
    },
    goalUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[400],
        marginLeft: 8,
    },
    saveButton: {
        backgroundColor: Colors.primary[500],
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.neutral[500],
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.neutral[800],
    },
    divider: {
        height: 1,
        backgroundColor: Colors.neutral[100],
        marginVertical: 12,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFEBEE',
        borderRadius: 16,
        padding: 16,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D32F2F',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 87, 34, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        gap: 6,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF5722',
    },
    macroGoalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    macroGoalItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 16,
    },
    macroGoalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.neutral[900],
    },
    macroGoalInput: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.neutral[900],
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary[500],
        width: 60,
        paddingVertical: 0,
    },
    macroGoalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.neutral[500],
        marginTop: 4,
    },
});
