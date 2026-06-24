import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// API Configurations:
// Android Emulator maps localhost to 10.0.2.2.
// iOS Simulator uses localhost (127.0.0.1).
// For real device testing, replace with your local machine's IP (e.g., http://192.168.1.50:5000/predict).
// Configure the API endpoint to your host machine's Wi-Fi IP address:
const API_URL = 'https://866df94bb2f7c6.lhr.life/predict';

export default function MobileApp() {
  // Navigation / Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Patient Profile State (Step 1)
  const [patientName, setPatientName] = useState('');
  const [patientContact, setPatientContact] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientWeight, setPatientWeight] = useState('');

  // Image Scan State (Step 2)
  const [imageUri, setImageUri] = useState<string | null>(null);

  // API Prediction Results State (Step 3)
  const [prediction, setPrediction] = useState<any>(null);

  // ==========================================
  // 📷 Image Picker Action Handlers
  // ==========================================
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (libraryStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Sorry, we need camera and library permissions to upload scan images.'
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // ==========================================
  // 🚥 Form Validation & API Request Flow
  // ==========================================
  const handleProceedToStep2 = () => {
    if (!patientName.trim() || !patientContact.trim() || !patientAge.trim() || !patientWeight.trim()) {
      Alert.alert('Validation Error', 'Please fill in all patient profile details.');
      return;
    }
    setCurrentStep(2);
  };

  const handlePredict = async () => {
    if (!imageUri) {
      Alert.alert('Selection Error', 'Please pick or capture a scan image first.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      // Determine file extension and name
      const filename = imageUri.split('/').pop() || 'scan_image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: filename,
        type: type,
      } as any);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Server prediction error');
      }

      const data = await response.json();
      if (data.success) {
        setPrediction(data);
        setCurrentStep(3);
      } else {
        throw new Error(data.error || 'An error occurred during prediction.');
      }
    } catch (error: any) {
      Alert.alert('Connection Failure', error.message || 'Could not communicate with the Flask AI backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setPatientName('');
    setPatientContact('');
    setPatientAge('');
    setPatientWeight('');
    setImageUri(null);
    setPrediction(null);
    setCurrentStep(1);
  };

  // ==========================================
  // 🎨 Custom UI Layout Renderers
  // ==========================================
  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 AI Breast Cancer Portal</Text>
        <Text style={styles.headerSubtitle}>Clinical Assistant Mobile Dashboard</Text>
      </View>

      {/* Steps Indicator */}
      <View style={styles.stepperContainer}>
        <View style={styles.step}>
          <View style={[styles.stepNum, currentStep >= 1 ? styles.stepNumActive : null]}>
            <Text style={styles.stepNumText}>1</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 1 ? styles.stepLabelActive : null]}>Info</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 2 ? styles.stepLineActive : null]} />
        <View style={styles.step}>
          <View style={[styles.stepNum, currentStep >= 2 ? styles.stepNumActive : null]}>
            <Text style={styles.stepNumText}>2</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 2 ? styles.stepLabelActive : null]}>Scan</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 3 ? styles.stepLineActive : null]} />
        <View style={styles.step}>
          <View style={[styles.stepNum, currentStep >= 3 ? styles.stepNumActive : null]}>
            <Text style={styles.stepNumText}>3</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 3 ? styles.stepLabelActive : null]}>Report</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ==========================================
            STEP 1: Patient Information Inputs
            ========================================== */}
        {currentStep === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Patient Information</Text>
            <Text style={styles.cardSubtitle}>Enter patient baseline profile parameters.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Enter patient full name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={patientContact}
                onChangeText={setPatientContact}
                keyboardType="phone-pad"
                placeholder="e.g. +1 555-0199"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1, { marginRight: 12 }]}>
                <Text style={styles.label}>Age (Years)</Text>
                <TextInput
                  style={styles.input}
                  value={patientAge}
                  onChangeText={setPatientAge}
                  keyboardType="numeric"
                  placeholder="e.g. 45"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={patientWeight}
                  onChangeText={setPatientWeight}
                  keyboardType="numeric"
                  placeholder="e.g. 62.5"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleProceedToStep2}>
              <Text style={styles.btnText}>Proceed to Scan ➡️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==========================================
            STEP 2: Scan Upload & Photo Library
            ========================================== */}
        {currentStep === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📷 Scan Selection</Text>
            <Text style={styles.cardSubtitle}>Provide tissue histopathology or ultrasound image.</Text>
            
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.btnRemoveImage} onPress={() => setImageUri(null)}>
                  <Text style={styles.btnRemoveText}>❌ Clear Selection</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Text style={styles.pickerIcon}>📤</Text>
                <Text style={styles.pickerText}>Select scan image to analyze</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity style={styles.btnPicker} onPress={pickImage}>
                    <Text style={styles.btnPickerText}>Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnPicker} onPress={takePhoto}>
                    <Text style={styles.btnPickerText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Analyzing Scan & Estimating Features...</Text>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setCurrentStep(1)}>
                  <Text style={styles.btnSecondaryText}>⬅️ Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnPrimary, styles.flex1, { marginTop: 0 }]}
                  onPress={handlePredict}
                >
                  <Text style={styles.btnText}>Run AI Detection 🚀</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ==========================================
            STEP 3: Scan Diagnostic Report
            ========================================== */}
        {currentStep === 3 && prediction && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Diagnosis Report</Text>
            <Text style={styles.cardSubtitle}>Generated dynamically by Clinical AI model.</Text>

            {/* Patient Summary Card */}
            <View style={styles.reportSectionCard}>
              <Text style={styles.sectionHeader}>👤 Patient Profile</Text>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Name:</Text>
                <Text style={styles.profileValue}>{patientName}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Contact:</Text>
                <Text style={styles.profileValue}>{patientContact}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Age:</Text>
                <Text style={styles.profileValue}>{patientAge} Years</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Weight:</Text>
                <Text style={styles.profileValue}>{patientWeight} kg</Text>
              </View>
            </View>

            {/* Classification Outcome */}
            <View style={styles.reportSectionCard}>
              <Text style={styles.sectionHeader}>🔬 AI Diagnostic Classification</Text>
              <View style={[
                styles.outcomeBox,
                prediction.classification_type === 'benign' ? styles.outcomeBenign : styles.outcomeMalignant
              ]}>
                <Text style={[
                  styles.outcomeText,
                  prediction.classification_type === 'benign' ? styles.textBenign : styles.textMalignant
                ]}>
                  {prediction.classification}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Model Confidence:</Text>
                <Text style={styles.statsVal}>{prediction.confidence}%</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Cancer Risk Rating:</Text>
                <Text style={styles.statsVal}>
                  {prediction.risk_icon} {prediction.risk_level} ({prediction.risk_percent}%)
                </Text>
              </View>
            </View>

            {/* Automatically Extracted Clinical Measurements */}
            {prediction.clinical_features && (
              <View style={styles.reportSectionCard}>
                <Text style={styles.sectionHeader}>🔬 Extracted Clinical Measurements</Text>
                <Text style={styles.sectionCaption}>Estimated dynamically from image structures</Text>
                
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Tumor Radius</Text>
                    <Text style={styles.gridVal}>{prediction.clinical_features.radius}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Texture</Text>
                    <Text style={styles.gridVal}>{prediction.clinical_features.texture}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Perimeter</Text>
                    <Text style={styles.gridVal}>{prediction.clinical_features.perimeter}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Area Size</Text>
                    <Text style={styles.gridVal}>{prediction.clinical_features.area}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Smoothness</Text>
                    <Text style={styles.gridVal}>{prediction.clinical_features.smoothness}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Compactness</Text>
                    <Text style={styles.gridVal}>{prediction.clinical_features.compactness}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Definitions */}
            <View style={styles.reportSectionCard}>
              <Text style={styles.sectionHeader}>📚 Terms Definitions</Text>
              <View style={styles.defItem}>
                <Text style={styles.defTitle}>🟢 Benign</Text>
                <Text style={styles.defText}>Non-cancerous tissue. Poses no tumor threat, cells grow normally.</Text>
              </View>
              <View style={styles.defItem}>
                <Text style={styles.defTitle}>🔴 Malignant</Text>
                <Text style={styles.defText}>Cancerous tissue. Fast multiplying abnormal cell nuclei requiring clinical intervention.</Text>
              </View>
            </View>

            {/* Bottom Actions */}
            <TouchableOpacity style={styles.btnPrimary} onPress={resetFlow}>
              <Text style={styles.btnText}>🔄 New Patient Diagnostic</Text>
            </TouchableOpacity>
          </View>
        )}
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: '#111327',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  step: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumActive: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  stepNumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#818cf8',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#334155',
    marginHorizontal: 10,
    marginTop: -14,
  },
  stepLineActive: {
    backgroundColor: '#6366f1',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    color: '#818cf8',
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: '#f8fafc',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  btnSecondaryText: {
    color: '#818cf8',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePickerPlaceholder: {
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    marginBottom: 20,
  },
  pickerIcon: {
    fontSize: 35,
    marginBottom: 8,
  },
  pickerText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPicker: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  btnPickerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnRemoveImage: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  btnRemoveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  reportSectionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionCaption: {
    color: '#64748b',
    fontSize: 11,
    marginTop: -8,
    marginBottom: 12,
    fontWeight: '500',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  profileLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  profileValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  outcomeBox: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  outcomeBenign: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  outcomeMalignant: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  outcomeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  textBenign: {
    color: '#10b981',
  },
  textMalignant: {
    color: '#ef4444',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statsLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  statsVal: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  gridLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  gridVal: {
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    color: '#818cf8',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  defItem: {
    marginBottom: 10,
  },
  defTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  defText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  }
});
