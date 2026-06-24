import os
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report

# Dataset path
dataset_path = "dataset"

# Image preprocessing
train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

# Training data
train_data = train_datagen.flow_from_directory(
    dataset_path,
    target_size=(128, 128),
    batch_size=32,
    class_mode='binary',
    subset='training'
)

# Validation data
val_data = train_datagen.flow_from_directory(
    dataset_path,
    target_size=(128, 128),
    batch_size=32,
    class_mode='binary',
    subset='validation'
)

# CNN Model
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(128,128,3)),
    MaxPooling2D(2,2),

    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),

    Flatten(),

    Dense(256, activation='relu'),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')

])

# Compile model
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# Train model
model.summary()
model.fit(
    train_data,
    validation_data=val_data,
    epochs=15
)

# Save model
model.save("breast_cancer_cnn.h5")

print("CNN model trained and saved!")

# ============================================================================
# EVALUATION METRICS
# ============================================================================

print("\n" + "="*80)
print("MODEL EVALUATION METRICS")
print("="*80)

# Get validation predictions
val_data.reset()
val_predictions = model.predict(val_data, verbose=0)
val_predictions_binary = (val_predictions > 0.5).astype(int).flatten()

# Get true labels
val_data.reset()
val_true_labels = val_data.classes

# Calculate Metrics
accuracy = accuracy_score(val_true_labels, val_predictions_binary)
precision = precision_score(val_true_labels, val_predictions_binary)
recall = recall_score(val_true_labels, val_predictions_binary)
f1 = f1_score(val_true_labels, val_predictions_binary)
roc_auc = roc_auc_score(val_true_labels, val_predictions.flatten())

# Confusion Matrix
cm = confusion_matrix(val_true_labels, val_predictions_binary)
tn, fp, fn, tp = cm.ravel()

# Specificity and Sensitivity
sensitivity = recall  # True Positive Rate
specificity = tn / (tn + fp)

print(f"\n📊 PERFORMANCE METRICS:")
print(f"{'─'*80}")
print(f"Accuracy:    {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"Precision:   {precision:.4f} ({precision*100:.2f}%)")
print(f"Recall:      {recall:.4f} ({recall*100:.2f}%)")
print(f"F1 Score:    {f1:.4f}")
print(f"Sensitivity: {sensitivity:.4f} ({sensitivity*100:.2f}%) [True Positive Rate]")
print(f"Specificity: {specificity:.4f} ({specificity*100:.2f}%) [True Negative Rate]")
print(f"ROC-AUC:     {roc_auc:.4f}")

print(f"\n📈 CONFUSION MATRIX:")
print(f"{'─'*80}")
print(f"True Negatives (TN):  {tn}")
print(f"False Positives (FP): {fp}")
print(f"False Negatives (FN): {fn}")
print(f"True Positives (TP):  {tp}")

print(f"\n📋 DETAILED CLASSIFICATION REPORT:")
print(f"{'─'*80}")
print(classification_report(val_true_labels, val_predictions_binary, 
                          target_names=['Benign', 'Malignant']))

print("\n" + "="*80)
print("✅ Model evaluation complete!")
print("="*80)