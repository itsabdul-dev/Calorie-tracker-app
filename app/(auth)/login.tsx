import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { Leaf } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFocused, setIsFocused] = useState({ email: false, password: false });
    const { signIn, signUp } = useAuth(); // Assuming useAuth provides these
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await signIn(email, password);
            // router.replace('/(tabs)'); // AuthContext usually handles redirect
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        // Navigate to sign up or handle it here
        router.push('/(auth)/signup');
    };

    return (
        <LinearGradient
            colors={Colors.gradients.background as any}
            style={styles.container}
        >
            {/* Floating decorative elements */}
            <MotiView
                from={{ translateY: 0, rotate: '0deg' }}
                animate={{ translateY: -20, rotate: '360deg' }}
                transition={{
                    type: 'timing',
                    duration: 20000,
                    loop: true,
                }}
                style={[styles.floatingCircle, { top: 100, left: 30, backgroundColor: Colors.primary[100], opacity: 0.2 }]}
            />
            <MotiView
                from={{ translateY: 0, scale: 1 }}
                animate={{ translateY: 30, scale: 1.2 }}
                transition={{
                    type: 'timing',
                    duration: 15000,
                    loop: true,
                }}
                style={[styles.floatingCircle, { bottom: 150, right: 40 }]}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Logo/Icon */}
                <MotiView
                    from={{ scale: 0, rotate: '-180deg' }}
                    animate={{ scale: 1, rotate: '0deg' }}
                    transition={{ type: 'spring', damping: 15, delay: 200 }}
                    style={styles.logoContainer}
                >
                    <View style={styles.logoCircle}>
                        <Leaf size={48} color={Colors.primary[500]} strokeWidth={2.5} />
                    </View>
                </MotiView>

                {/* Welcome Text */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', delay: 400 }}
                >
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Track your nutrition journey</Text>
                </MotiView>

                {/* Glassmorphic Card */}
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 600 }}
                    style={styles.formCard}
                >
                    <BlurView intensity={20} tint="light" style={styles.blurContainer}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    isFocused.email && styles.inputWrapperFocused,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="email@address.com"
                                    placeholderTextColor={Colors.neutral[400]}
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    isFocused.password && styles.inputWrapperFocused,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={Colors.neutral[400]}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        {/* Sign In Button */}
                        <Pressable style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
                            <LinearGradient
                                colors={Colors.gradients.accent as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Sign Up Link */}
                        <Pressable style={styles.signUpLink} onPress={handleSignUp}>
                            <Text style={styles.signUpText}>
                                Don't have an account?{' '}
                                <Text style={styles.signUpTextBold}>Sign Up</Text>
                            </Text>
                        </Pressable>
                    </BlurView>
                </MotiView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    floatingCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        color: '#212121',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 40,
    },
    formCard: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    blurContainer: {
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 8,
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWrapperFocused: {
        borderColor: Colors.accent[500],
        shadowColor: Colors.accent[500],
        shadowOpacity: 0.2,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#212121',
    },
    signInButton: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: Colors.accent[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
    },
    signUpLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 14,
        color: '#757575',
    },
    signUpTextBold: {
        color: '#4CAF50',
        fontWeight: '600',
    },
});
