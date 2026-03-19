import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../../theme';
import { usePantry } from '../context/PantryContext';

export default function RemiAIScreen() {
    const { pantryItems } = usePantry();
    const [messages, setMessages] = useState([
        { id: '1', text: "Hi! I am Remi, your cheeky British sous chef. I've had a look at your pantry... looks like we've got some work to do! How can I help today?", sender: 'remi' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef();

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('https://remi-engine-v2-r7irowrevq-uc.a.run.app/api/remy/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputText,
                    user_id: 'test_user_123',
                    pantry_items: pantryItems.map(i => i.name),
                    dietary_dna: { vegetarian: false, gluten_free: true }, // Mocked from Profile UI
                    history: messages.slice(-5).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
                })
            });

            const data = await response.json();
            const remiMsg = {
                id: Date.now().toString(),
                text: data.text || "Sorry, I'm a bit tied up in the kitchen. Try again!",
                sender: 'remi'
            };
            setMessages(prev => [...prev, remiMsg]);
        } catch (error) {
            console.error(error);
            Alert.alert("Kitchen Malfunction", "Remi couldn't respond right now.");
        }
        setIsLoading(true);
        setIsLoading(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Remi AI</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Online & Ready</Text>
                    </View>
                </View>

                {/* Chat Area */}
                <ScrollView
                    style={styles.chatArea}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map(msg => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.sender === 'user' ? styles.userBubble : styles.remiBubble
                            ]}
                        >
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'user' ? styles.userText : styles.remiText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}
                    {isLoading && (
                        <View style={[styles.messageBubble, styles.remiBubble, { width: 60 }]}>
                            <ActivityIndicator size="small" color="#000" />
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask Remi anything..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 32,
        color: Theme.colors.text,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    statusText: {
        fontFamily: Theme.fonts.body,
        fontSize: 12,
        color: '#666',
    },
    chatArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: Theme.colors.surface,
        borderBottomRightRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    remiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: Theme.colors.primary,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontFamily: Theme.fonts.body,
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: Theme.colors.text,
    },
    remiText: {
        color: Theme.colors.text,
        fontWeight: '500',
    },
    inputArea: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: Theme.colors.background,
        borderTopWidth: 2,
        borderTopColor: '#000',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: 20,
        padding: 12,
        paddingTop: 12,
        fontSize: 16,
        fontFamily: Theme.fonts.body,
        maxHeight: 100,
        borderWidth: 2,
        borderColor: '#000',
    },
    sendButton: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginLeft: 12,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
