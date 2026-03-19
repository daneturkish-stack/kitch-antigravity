import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { Theme } from '../../theme';

export default function CookModeScreen({ route, navigation }) {
    const { recipe } = route.params;
    const [currentStep, setCurrentStep] = useState(0);

    const steps = recipe.steps || [
        { step_number: 1, instruction: "First, prepare your tools and clean your workspace." },
        { step_number: 2, instruction: "Follow the extracted instructions precisely." }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitBtn}>
                    <Text style={styles.exitText}>EXIT COOK MODE</Text>
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>STEP {currentStep + 1} OF {steps.length}</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.stepCard}>
                    <Text style={styles.stepNumber}>#{steps[currentStep].step_number}</Text>
                    <Text style={styles.instructionText}>{steps[currentStep].instruction}</Text>

                    {/* Simulated Voice Feedback Indicator */}
                    <View style={styles.voiceIndicator}>
                        <Text style={styles.voiceText}>🎙️ "Remi, next step"</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.navBtn, currentStep === 0 && styles.disabledBtn]}
                    onPress={handlePrev}
                    disabled={currentStep === 0}
                >
                    <Text style={styles.navBtnText}>PREV</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
                    <Text style={styles.navBtnText}>
                        {currentStep === steps.length - 1 ? 'FINISH' : 'NEXT'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000', // Immersion Mode
    },
    header: {
        padding: 20,
    },
    exitBtn: {
        alignSelf: 'flex-start',
        borderWidth: 2,
        borderColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 20,
    },
    exitText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    progressContainer: {
        width: '100%',
    },
    progressText: {
        color: '#AAA',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        width: '100%',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 3,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    stepCard: {
        backgroundColor: Theme.colors.background,
        width: '100%',
        padding: 40,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: Theme.colors.primary,
        minHeight: 300,
        justifyContent: 'center',
    },
    stepNumber: {
        fontFamily: Theme.fonts.displayBold,
        fontSize: 40,
        color: Theme.colors.primary,
        marginBottom: 20,
    },
    instructionText: {
        fontFamily: Theme.fonts.displayMedium,
        fontSize: 24,
        lineHeight: 32,
        color: Theme.colors.text,
    },
    voiceIndicator: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 8,
        borderRadius: 12,
    },
    voiceText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        justifyContent: 'space-between',
    },
    navBtn: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#000',
    },
    navBtnText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    disabledBtn: {
        backgroundColor: '#333',
        borderColor: '#444',
        opacity: 0.5,
    }
});
