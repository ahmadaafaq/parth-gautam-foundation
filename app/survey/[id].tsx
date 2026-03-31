import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../store/languageStore';

export default function SurveyQuestionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useLanguageStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const questions = [
    {
      id: 'q1',
      text: t('pgSurveyQ1'),
      type: 'choice',
      options: [
        { id: 'o1', text: t('pgSurveyQ1_opt1') },
        { id: 'o2', text: t('pgSurveyQ1_opt2') },
        { id: 'o3', text: t('pgSurveyQ1_opt3') },
        { id: 'o4', text: t('pgSurveyQ1_opt4') },
      ],
    },
    {
      id: 'q2',
      text: t('pgSurveyQ2'),
      type: 'choice',
      options: [
        { id: 'o1', text: t('pgSurveyQ2_opt1') },
        { id: 'o2', text: t('pgSurveyQ2_opt2') },
        { id: 'o3', text: t('pgSurveyQ2_opt3') },
        { id: 'o4', text: t('pgSurveyQ2_opt4') },
      ],
    },
    {
      id: 'q3',
      text: t('pgSurveyQ3'),
      type: 'rating',
    },
    {
      id: 'q4',
      text: t('pgSurveyQ4'),
      type: 'choice',
      options: [
        { id: 'o1', text: t('pgSurveyQ4_opt1') },
        { id: 'o2', text: t('pgSurveyQ4_opt2') },
      ],
    },
  ];

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const nextStep = () => {
    if (!answers[questions[currentStep].id]) {
        Alert.alert(t('error'), t('fillAllFieldsReport'));
        return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(t('success'), t('surveySubmitted'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  const renderQuestion = () => {
    const q = questions[currentStep];
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{q.text}</Text>
        
        {q.type === 'choice' && (
          <View style={styles.optionsContainer}>
            {q.options?.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionButton,
                  answers[q.id] === opt.text && styles.selectedOption
                ]}
                onPress={() => handleAnswer(q.id, opt.text)}
              >
                <Text style={[
                  styles.optionText,
                  answers[q.id] === opt.text && styles.selectedOptionText
                ]}>{opt.text}</Text>
                {answers[q.id] === opt.text && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {q.type === 'rating' && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleAnswer(q.id, star)}>
                <Ionicons 
                  name={star <= (answers[q.id] || 0) ? "star" : "star-outline"} 
                  size={48} 
                  color={star <= (answers[q.id] || 0) ? "#F59E0B" : "#D1D5DB"} 
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentStep + 1) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>{currentStep + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.surveyTitle}>{t('pgSurveyTitle')}</Text>
        {renderQuestion()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {currentStep === questions.length - 1 ? t('finishSurvey') : t('next')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 40,
  },
  scrollContent: {
    padding: 24,
  },
  surveyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  questionContainer: {
    marginTop: 8,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
