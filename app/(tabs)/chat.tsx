import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Send, Bot, User, Sparkles, MessageCircle } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { hapticFeedback } from '../../utils/haptics';
import { sendNutritionChatMessage, ChatMessage } from '../../lib/nutritionChat';
import { useFoodEntries } from '../../hooks/useFoodEntries';
import { useGoals } from '../../hooks/useGoals';
import { format } from 'date-fns';

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const { stats } = useFoodEntries(format(new Date(), 'yyyy-MM-dd'));
    const { goals } = useGoals();

    const sendMessage = async () => {
        if (!inputText.trim() || loading) return;

        hapticFeedback.light();
        const userMessage: ChatMessage = { role: 'user', content: inputText.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputText('');
        setLoading(true);

        try {
            const response = await sendNutritionChatMessage(newMessages, {
                stats,
                goals: goals ? {
                    protein: goals.protein_goal,
                    carbs: goals.carbs_goal,
                    fat: goals.fat_goal,
                } : undefined,
            });

            const assistantMessage: ChatMessage = { role: 'assistant', content: response };
            setMessages([...newMessages, assistantMessage]);
            hapticFeedback.success();
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: "Sorry, I couldn't process that. Please try again."
            };
            setMessages([...newMessages, errorMessage]);
            hapticFeedback.error();
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isUser = item.role === 'user';
        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50 }}
                style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}
            >
                <View style={[styles.avatarSmall, isUser ? styles.userAvatar : styles.assistantAvatar]}>
                    {isUser ? (
                        <User size={16} color="#FFF" />
                    ) : (
                        <Bot size={16} color="#FFF" />
                    )}
                </View>
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
            </MotiView>
        );
    };

    const suggestedQuestions = [
        "What should I eat for dinner?",
        "How much protein do I need?",
        "Give me a healthy snack idea",
        "Am I on track today?",
    ];

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={[Colors.primary[800], Colors.primary[600], Colors.primary[500]]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <MotiView
                        from={{ scale: 0.8, rotate: '0deg' }}
                        animate={{ scale: 1, rotate: '360deg' }}
                        transition={{ type: 'timing', duration: 1000 }}
                        style={styles.headerIcon}
                    >
                        <Sparkles size={28} color="#FFF" />
                    </MotiView>
                    <View>
                        <Text style={styles.headerTitle}>Nutrition AI</Text>
                        <Text style={styles.headerSubtitle}>Your personal nutrition assistant</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.chatContainer}
                keyboardVerticalOffset={100}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MotiView
                            from={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={styles.emptyIcon}
                        >
                            <MessageCircle size={48} color={Colors.primary[300]} />
                        </MotiView>
                        <Text style={styles.emptyTitle}>Start a Conversation</Text>
                        <Text style={styles.emptySubtitle}>Ask me about nutrition, meal ideas, or your progress</Text>

                        <View style={styles.suggestions}>
                            {suggestedQuestions.map((q, i) => (
                                <Pressable
                                    key={i}
                                    style={styles.suggestionChip}
                                    onPress={() => { setInputText(q); hapticFeedback.selection(); }}
                                >
                                    <Text style={styles.suggestionText}>{q}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(_, i) => i.toString()}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Input Bar */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about nutrition..."
                        placeholderTextColor={Colors.neutral[400]}
                        multiline
                        maxLength={500}
                        editable={!loading}
                    />
                    <Pressable
                        style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send size={20} color="#FFF" />
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral[50],
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: Colors.primary[900],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        gap: 16,
    },
    headerIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    chatContainer: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 3,
        borderColor: Colors.primary[100],
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.neutral[900],
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: Colors.neutral[500],
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    suggestions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    suggestionChip: {
        backgroundColor: '#FFF',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: Colors.primary[200],
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    suggestionText: {
        fontSize: 14,
        color: Colors.primary[700],
        fontWeight: '600',
    },
    messagesList: {
        padding: 20,
        gap: 16,
    },
    messageBubble: {
        flexDirection: 'row',
        gap: 12,
        maxWidth: '88%',
        alignItems: 'flex-start',
    },
    userBubble: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    assistantBubble: {
        alignSelf: 'flex-start',
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userAvatar: {
        backgroundColor: Colors.primary[600],
    },
    assistantAvatar: {
        backgroundColor: Colors.accent[600],
    },
    messageText: {
        flex: 1,
        fontSize: 15,
        color: Colors.neutral[800],
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        borderTopLeftRadius: 6,
        lineHeight: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    userMessageText: {
        backgroundColor: Colors.primary[600],
        color: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        paddingBottom: 32,
        gap: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.neutral[100],
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        maxHeight: 120,
        color: Colors.neutral[900],
        borderWidth: 1,
        borderColor: Colors.neutral[200],
    },
    sendButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary[700],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.neutral[300],
        shadowOpacity: 0,
    },
});
