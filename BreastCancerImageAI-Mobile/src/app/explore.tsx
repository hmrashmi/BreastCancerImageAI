import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 About This App</Text>
        <Text style={styles.headerSubtitle}>AI-Based Breast Cancer Detection</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔬 What Does This App Do?</Text>
          <Text style={styles.cardBody}>
            This application uses a Convolutional Neural Network (CNN) trained on breast tissue histopathology images to classify scan samples as either <Text style={styles.highlightGreen}>Benign (non-cancerous)</Text> or <Text style={styles.highlightRed}>Malignant (cancerous)</Text>.
          </Text>
          <Text style={styles.cardBody}>
            It also automatically extracts clinical measurements such as tumor radius, texture, perimeter, area, smoothness, and compactness from the uploaded image using computer vision techniques.
          </Text>
        </View>

        {/* How It Works Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ How It Works</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
            <Text style={styles.stepText}>Enter patient information (Name, Contact, Age, Weight).</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
            <Text style={styles.stepText}>Upload or capture a breast tissue histopathology or ultrasound scan image.</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
            <Text style={styles.stepText}>The AI model classifies the image and generates a detailed diagnosis report with clinical measurements.</Text>
          </View>
        </View>

        {/* Technology Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧠 Technology Stack</Text>
          <View style={styles.techGrid}>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>AI Model</Text>
              <Text style={styles.techValue}>TensorFlow CNN</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Backend</Text>
              <Text style={styles.techValue}>Flask (Python)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Mobile</Text>
              <Text style={styles.techValue}>React Native / Expo</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techLabel}>Image Analysis</Text>
              <Text style={styles.techValue}>SciPy / NumPy</Text>
            </View>
          </View>
        </View>

        {/* Definitions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Medical Terms</Text>
          <View style={styles.defItem}>
            <Text style={styles.defTitle}>🟢 Benign</Text>
            <Text style={styles.defText}>Non-cancerous tissue. The cells grow normally and do not spread to other parts of the body. Poses no tumor threat.</Text>
          </View>
          <View style={styles.defItem}>
            <Text style={styles.defTitle}>🔴 Malignant</Text>
            <Text style={styles.defText}>Cancerous tissue. Abnormal cells that multiply uncontrollably and can infiltrate nearby tissue. Requires immediate clinical intervention.</Text>
          </View>
        </View>

        {/* Clinical Features Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📏 Clinical Measurements Explained</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Tumor Radius</Text>
            <Text style={styles.featureDesc}>Mean distance from center to boundary of the cell nucleus.</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Texture</Text>
            <Text style={styles.featureDesc}>Standard deviation of gray-scale intensity values in the nucleus region.</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Perimeter</Text>
            <Text style={styles.featureDesc}>Total boundary length of the cell nucleus outline.</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Area</Text>
            <Text style={styles.featureDesc}>Total pixel area of the segmented cell nucleus region.</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Smoothness</Text>
            <Text style={styles.featureDesc}>Local variation in boundary pixel intensity, measuring edge regularity.</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureLabel}>Compactness</Text>
            <Text style={styles.featureDesc}>Ratio of perimeter² to area, reflecting shape irregularity.</Text>
          </View>
        </View>

        {/* Disclaimer Card */}
        <View style={[styles.card, styles.disclaimerCard]}>
          <Text style={styles.cardTitle}>⚠️ Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This AI tool is for <Text style={styles.bold}>educational and preliminary screening purposes only</Text>. It must not replace professional clinical diagnosis. Always consult a qualified oncologist or medical professional for definitive diagnosis and treatment.
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Breast Cancer Detection AI</Text>
          <Text style={styles.footerText}>Clinical Assistant Mobile Portal</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#111327',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#818cf8',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111327',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    color: '#818cf8',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardBody: {
    color: '#cbd5e1',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 10,
  },
  highlightGreen: {
    color: '#10b981',
    fontWeight: '700',
  },
  highlightRed: {
    color: '#ef4444',
    fontWeight: '700',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    color: '#cbd5e1',
    fontSize: 13.5,
    lineHeight: 20,
    flex: 1,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  techItem: {
    width: '50%',
    padding: 6,
  },
  techLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  techValue: {
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
  },
  defItem: {
    marginBottom: 14,
  },
  defTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  defText: {
    color: '#94a3b8',
    fontSize: 12.5,
    lineHeight: 18,
  },
  featureItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
  },
  featureLabel: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  featureDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
  },
  disclaimerCard: {
    borderColor: 'rgba(234, 179, 8, 0.2)',
    backgroundColor: 'rgba(234, 179, 8, 0.04)',
  },
  disclaimerText: {
    color: '#fbbf24',
    fontSize: 12.5,
    lineHeight: 19,
  },
  bold: {
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
});
