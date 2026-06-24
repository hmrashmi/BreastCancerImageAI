// ==========================================
// 📲 PWA Service Worker & Install Logic
// ==========================================
// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[Service Worker] Registered successfully with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('[Service Worker] Registration failed:', error);
            });
    });
}

// Handle Install Prompt (PWA Installation)
let deferredPrompt;
const installAppBtn = document.getElementById('installAppBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    if (installAppBtn) {
        installAppBtn.style.display = 'flex';
    }
});

if (installAppBtn) {
    installAppBtn.addEventListener('click', () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            // Hide the install button since it's already triggered
            installAppBtn.style.display = 'none';
        });
    });
}

// Hide install button when app is successfully installed
window.addEventListener('appinstalled', (evt) => {
    console.log('Breast Cancer Detection AI App was successfully installed!');
    if (installAppBtn) {
        installAppBtn.style.display = 'none';
    }
});

// 🩺 State Management & Global Variables
let currentStep = 1;
let patientName = '';
let patientContact = '';
let patientAge = '';
let patientWeight = '';

// Clinical details state (automatically populated from scan image detection)
let clinicalRadius = '';
let clinicalTexture = '';
let clinicalPerimeter = '';
let clinicalArea = '';
let clinicalSmoothness = '';
let clinicalCompactness = '';

// DOM Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toggleIcon = themeToggleBtn ? themeToggleBtn.querySelector('.toggle-icon') : null;

const step1Indicator = document.getElementById('step1Indicator');
const step2Indicator = document.getElementById('step2Indicator');
const step3Indicator = document.getElementById('step3Indicator');

const step1Section = document.getElementById('step1Section');
const step2Section = document.getElementById('step2Section');
const resultsSection = document.getElementById('resultsSection');

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// ==========================================
// 🌓 Theme Toggling (Light / Dark Mode)
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (toggleIcon) {
        toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}
initTheme();


// ==========================================
// 🚥 Step / Multi-page Navigation Logic
// ==========================================
function goToStep(step) {
    currentStep = step;
    
    // Hide all step sections
    step1Section.style.display = 'none';
    step2Section.style.display = 'none';
    resultsSection.style.display = 'none';
    
    // Reset indicators
    step1Indicator.classList.remove('active', 'completed');
    step2Indicator.classList.remove('active', 'completed');
    step3Indicator.classList.remove('active', 'completed');
    
    if (step === 1) {
        step1Section.style.display = 'block';
        step1Indicator.classList.add('active');
    } else if (step === 2) {
        step2Section.style.display = 'block';
        step1Indicator.classList.add('completed');
        step2Indicator.classList.add('active');
        
        // Hide preview during upload page unless an image was selected
        if (fileInput.files.length > 0) {
            previewSection.style.display = 'block';
        } else {
            previewSection.style.display = 'none';
        }
    } else if (step === 3) {
        resultsSection.style.display = 'block';
        step1Indicator.classList.add('completed');
        step2Indicator.classList.add('completed');
        step3Indicator.classList.add('active');
        previewSection.style.display = 'none';
    }
    
    // Scroll to top of the step card
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateAndGoToStep2() {
    const nameVal = document.getElementById('patientName').value.trim();
    const contactVal = document.getElementById('patientContact').value.trim();
    const ageVal = document.getElementById('patientAge').value.trim();
    const weightVal = document.getElementById('patientWeight').value.trim();

    if (!nameVal || !contactVal || !ageVal || !weightVal) {
        showError('Please fill in all patient profile details.');
        return;
    }

    patientName = nameVal;
    patientContact = contactVal;
    patientAge = ageVal;
    patientWeight = weightVal;

    goToStep(2);
}

function resetToStep1() {
    // Reset Form fields
    document.getElementById('patientForm').reset();
    
    // Reset variables
    patientName = '';
    patientContact = '';
    patientAge = '';
    patientWeight = '';

    clinicalRadius = '';
    clinicalTexture = '';
    clinicalPerimeter = '';
    clinicalArea = '';
    clinicalSmoothness = '';
    clinicalCompactness = '';
    
    // Reset Upload
    fileInput.value = '';
    previewImage.src = '';
    previewSection.style.display = 'none';
    errorMessage.style.display = 'none';
    
    goToStep(1);
}


// ==========================================
// 📤 File Upload & Drag/Drop Logic (Step 2)
// ==========================================
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-hover)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.15))';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-color)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(129, 140, 248, 0.04))';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-color)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(129, 140, 248, 0.04))';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function handleFileUpload(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showError('Invalid file type. Please upload PNG or JPG image.');
        return;
    }

    if (file.size > 16 * 1024 * 1024) {
        showError('File size exceeds 16MB limit.');
        return;
    }

    // Display image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewSection.style.display = 'block';
        errorMessage.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Send payload to backend
    sendPredictionRequest(file);
}

function sendPredictionRequest(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Toggle view elements for loading state
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    resultsSection.style.display = 'none';

    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || errData.error || 'Server error');
            });
        }
        return response.json();
    })
    .then(data => {
        loadingSpinner.style.display = 'none';
        if (data.success) {
            displayResults(data);
        } else {
            showError(data.error || 'An error occurred during prediction.');
        }
    })
    .catch(error => {
        loadingSpinner.style.display = 'none';
        showError('Error: ' + error.message);
    });
}


// ==========================================
// 📊 Display Results (Step 3)
// ==========================================
function displayResults(data) {
    // Populate Patient Profile Summary Cards
    document.getElementById('reportPatientName').textContent = patientName;
    document.getElementById('reportPatientContact').textContent = patientContact;
    document.getElementById('reportPatientAge').textContent = patientAge;
    document.getElementById('reportPatientWeight').textContent = patientWeight;
    document.getElementById('reportDate').textContent = new Date().toLocaleString();

    // Map automatically detected clinical features from response
    if (data.clinical_features) {
        clinicalRadius = data.clinical_features.radius;
        clinicalTexture = data.clinical_features.texture;
        clinicalPerimeter = data.clinical_features.perimeter;
        clinicalArea = data.clinical_features.area;
        clinicalSmoothness = data.clinical_features.smoothness;
        clinicalCompactness = data.clinical_features.compactness;
    }

    // Populate Clinical Measurements
    document.getElementById('reportClinicalRadius').textContent = clinicalRadius;
    document.getElementById('reportClinicalTexture').textContent = clinicalTexture;
    document.getElementById('reportClinicalPerimeter').textContent = clinicalPerimeter;
    document.getElementById('reportClinicalArea').textContent = clinicalArea;
    document.getElementById('reportClinicalSmoothness').textContent = clinicalSmoothness;
    document.getElementById('reportClinicalCompactness').textContent = clinicalCompactness;

    // Classification Result
    const classificationResult = document.getElementById('classificationResult');
    classificationResult.textContent = data.classification;
    classificationResult.className = `classification ${data.classification_type}`;

    // Confidence Level
    const confidence = parseFloat(data.confidence);
    document.getElementById('confidenceValue').textContent = data.confidence + '%';
    document.getElementById('confidenceFill').style.width = confidence + '%';

    // Cancer Risk Assessment Percentage
    const riskPercent = parseFloat(data.risk_percent);
    document.getElementById('riskPercent').textContent = data.risk_percent + '%';
    
    const riskLevelEl = document.getElementById('riskLevel');
    riskLevelEl.textContent = data.risk_icon + ' ' + data.risk_level;

    // Apply color accents dynamically based on risk level
    let riskDesc = '';
    if (data.risk_level === 'High Risk') {
        riskDesc = '⚠️ This scan shows high likelihood of malignant tissue. Immediate consultation with an oncologist is recommended.';
        riskLevelEl.style.background = 'rgba(239, 68, 68, 0.15)';
        riskLevelEl.style.color = 'var(--malignant-text)';
    } else if (data.risk_level === 'Medium Risk') {
        riskDesc = '⚠️ This scan shows moderate characteristics of concern. Further medical screening/biopsy is recommended.';
        riskLevelEl.style.background = 'rgba(245, 158, 11, 0.15)';
        riskLevelEl.style.color = '#d97706';
    } else {
        riskDesc = '✅ This scan indicates low risk characteristics. Routine clinical observation is suggested.';
        riskLevelEl.style.background = 'rgba(16, 185, 129, 0.15)';
        riskLevelEl.style.color = 'var(--benign-text)';
    }
    document.getElementById('riskDescription').textContent = riskDesc;

    // Detailed Probability values
    document.getElementById('malignantProb').textContent = data.malignant_prob + '%';
    document.getElementById('benignProb').textContent = data.benign_prob + '%';

    // Transition to Step 3
    goToStep(3);
}

function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    loadingSpinner.style.display = 'none';
    resultsSection.style.display = 'none';
    window.scrollTo({ top: errorMessage.offsetTop, behavior: 'smooth' });
}


// ==========================================
// 📥 Download Clinical report text format
// ==========================================
function downloadResults() {
    const classification = document.getElementById('classificationResult').textContent;
    const confidence = document.getElementById('confidenceValue').textContent;
    const riskPercent = document.getElementById('riskPercent').textContent;
    const riskLevel = document.getElementById('riskLevel').textContent;
    const malignantProb = document.getElementById('malignantProb').textContent;
    const benignProb = document.getElementById('benignProb').textContent;

    const report = `
============================================================
       CLINICAL ASSISTANT: BREAST CANCER DIAGNOSIS REPORT
============================================================
Report Generated: ${new Date().toLocaleString()}

PATIENT PROFILE INFORMATION:
----------------------------
Patient Name   : ${patientName}
Contact Number : ${patientContact}
Age            : ${patientAge} Years
Weight         : ${patientWeight} kg

SCAN-EXTRACTED CLINICAL MEASUREMENTS (AUTOMATIC):
-------------------------------------------------
Tumor Radius   : ${clinicalRadius}
Texture        : ${clinicalTexture}
Perimeter      : ${clinicalPerimeter}
Area           : ${clinicalArea}
Smoothness     : ${clinicalSmoothness}
Compactness    : ${clinicalCompactness}

SCAN ANALYSIS RESULTS:
----------------------
Classification       : ${classification}
Model Confidence     : ${confidence}
Overall Cancer Risk  : ${riskPercent} (${riskLevel})

DETAILED PROBABILITIES:
-----------------------
Malignant Probability: ${malignantProb}
Benign Probability   : ${benignProb}

============================================================
DISCLAIMER:
This report was generated using a computer-aided deep learning
model. It is intended for educational and preliminary screening 
purposes only. It must NOT be used as a stand-alone substitute 
for professional pathological diagnosis. Please consult with 
qualified medical practitioners for final diagnosis and care.
============================================================
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClinicalReport_${patientName.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function createReportPrintElement() {
    const classification = document.getElementById('classificationResult').textContent;
    const confidence = document.getElementById('confidenceValue').textContent;
    const riskPercent = document.getElementById('riskPercent').textContent;
    const riskLevel = document.getElementById('riskLevel').textContent;
    
    // Check classification type
    const isMalignant = classification.toLowerCase().includes('malignant');
    
    // Risk icon determination
    let riskIcon = '🟢';
    if (riskLevel.includes('🔴') || riskLevel.toLowerCase().includes('high')) riskIcon = '🔴';
    else if (riskLevel.includes('🟡') || riskLevel.toLowerCase().includes('medium')) riskIcon = '🟡';

    const cleanRiskLevel = riskLevel.replace(/🟢|🔴|🟡/g, '').trim();

    const printEl = document.createElement('div');
    printEl.style.width = '700px';
    printEl.style.padding = '30px';
    printEl.style.background = '#ffffff';
    printEl.style.color = '#000000';
    printEl.style.fontFamily = "'Outfit', 'Segoe UI', sans-serif";
    printEl.style.boxSizing = 'border-box';

    printEl.innerHTML = `
        <div style="border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="color: #6366f1; font-size: 24px; margin: 0; font-weight: 700;">🏥 Breast Cancer Detection AI</h1>
                <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Clinical Assistant & Diagnostic Report</p>
            </div>
            <div style="text-align: right;">
                <p style="color: #64748b; margin: 0; font-size: 12px;">Generated: ${new Date().toLocaleString()}</p>
                <p style="color: #64748b; margin: 2px 0 0 0; font-size: 12px;">ID: BC-${new Date().getTime().toString().slice(-6)}</p>
            </div>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <h3 style="color: #3b82f6; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-weight: 700;">👤 Patient Profile</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 25%;">Patient Name:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${patientName}</td>
                    <td style="padding: 6px 0; color: #64748b; width: 25%;">Contact Number:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${patientContact}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b;">Age:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${patientAge} Years</td>
                    <td style="padding: 6px 0; color: #64748b;">Weight:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${patientWeight} kg</td>
                </tr>
            </table>
        </div>

        <div style="margin-bottom: 20px; display: flex; gap: 20px; width: 100%;">
            <div style="background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0; border-left: 4px solid ${isMalignant ? '#ef4444' : '#10b981'}; flex: 1; box-sizing: border-box;">
                <h3 style="color: #6366f1; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">🔬 AI Classification</h3>
                <div style="background: ${isMalignant ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'}; color: ${isMalignant ? '#b91c1c' : '#15803d'}; font-size: 18px; font-weight: 700; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid ${isMalignant ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'};">
                    ${classification}
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #64748b;">
                    Model Confidence: <span style="font-weight: 700; color: #0f172a;">${confidence}</span>
                </div>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0; flex: 1; box-sizing: border-box;">
                <h3 style="color: #6366f1; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">📈 Risk Assessment</h3>
                <div style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">${riskPercent}</div>
                <div style="display: inline-block; font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: ${cleanRiskLevel === 'High Risk' ? 'rgba(239, 68, 68, 0.12)' : cleanRiskLevel === 'Medium Risk' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)'}; color: ${cleanRiskLevel === 'High Risk' ? '#b91c1c' : cleanRiskLevel === 'Medium Risk' ? '#d97706' : '#15803d'}; border: 1px solid ${cleanRiskLevel === 'High Risk' ? 'rgba(239, 68, 68, 0.2)' : cleanRiskLevel === 'Medium Risk' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'};">
                    ${riskIcon} ${cleanRiskLevel}
                </div>
            </div>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1;">
            <h3 style="color: #6366f1; font-size: 16px; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-weight: 700;">📐 Clinical Measurements</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                    <tr style="border-bottom: 1px solid #cbd5e1;">
                        <th style="padding: 8px 4px; color: #64748b; font-weight: 600;">Measurement</th>
                        <th style="padding: 8px 4px; color: #64748b; font-weight: 600; text-align: right;">Value</th>
                        <th style="padding: 8px 4px; color: #64748b; font-weight: 600; padding-left: 30px;">Measurement</th>
                        <th style="padding: 8px 4px; color: #64748b; font-weight: 600; text-align: right;">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 4px; color: #0f172a;">Tumor Radius</td>
                        <td style="padding: 10px 4px; font-weight: 700; color: #0f172a; text-align: right;">${clinicalRadius || '-'}</td>
                        <td style="padding: 10px 4px; color: #0f172a; padding-left: 30px;">Area Size</td>
                        <td style="padding: 10px 4px; font-weight: 700; color: #0f172a; text-align: right;">${clinicalArea || '-'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px 4px; color: #0f172a;">Texture</td>
                        <td style="padding: 10px 4px; font-weight: 700; color: #0f172a; text-align: right;">${clinicalTexture || '-'}</td>
                        <td style="padding: 10px 4px; color: #0f172a; padding-left: 30px;">Smoothness</td>
                        <td style="padding: 10px 4px; font-weight: 700; color: #0f172a; text-align: right;">${clinicalSmoothness || '-'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #cbd5e1;">
                        <td style="padding: 10px 4px; color: #0f172a;">Perimeter</td>
                        <td style="padding: 10px 4px; font-weight: 700; color: #0f172a; text-align: right;">${clinicalPerimeter || '-'}</td>
                        <td style="padding: 10px 4px; color: #0f172a; padding-left: 30px;">Compactness</td>
                        <td style="padding: 10px 4px; font-weight: 700; color: #0f172a; text-align: right;">${clinicalCompactness || '-'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 25px; font-size: 11px; color: #64748b; line-height: 1.4; box-sizing: border-box;">
            <strong>⚠️ Disclaimer:</strong> This report was generated using a computer-aided deep learning model. It is intended for educational and preliminary screening purposes only. It must NOT be used as a stand-alone substitute for professional pathological diagnosis. Please consult with qualified medical practitioners for final diagnosis and care.
        </div>

        <div style="margin-top: 45px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 13px; color: #0f172a; width: 100%;">
            <div>
                <p style="margin: 0; border-bottom: 1px solid #cbd5e1; width: 220px; height: 35px;"></p>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Clinician Signature</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; font-weight: 600;">Breast Cancer Detection AI Portal</p>
                <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px;">Official Report Document</p>
            </div>
        </div>
    `;
    return printEl;
}

// ==========================================
// 🖼️ Download Image format report
// ==========================================
function downloadImage() {
    const printEl = createReportPrintElement();
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '700px';
    container.style.background = '#ffffff';
    
    container.appendChild(printEl);
    document.body.appendChild(container);

    html2canvas(printEl, {
        scale: 2.0,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        document.body.removeChild(container);
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `ClinicalReport_${patientName.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error("Image generation error:", err);
        document.body.removeChild(container);
    });
}


