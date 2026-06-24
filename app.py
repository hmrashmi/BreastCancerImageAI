import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image

# Load model
model = tf.keras.models.load_model("breast_cancer_cnn.h5")

# Title
st.title("AI-Based Breast Cancer Detection System")
st.write("Upload a breast ultrasound image for prediction.")

# Upload image
uploaded_file = st.file_uploader(
    "Choose an image...",
    type=["jpg", "jpeg", "png"]
)

if uploaded_file is not None:

    # Display image
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_container_width=True)

    # Preprocess image
    img = image.resize((128, 128))
    img = np.array(img)

    if len(img.shape) == 2:
        img = np.stack((img,) * 3, axis=-1)

    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    # Prediction
    prediction = model.predict(img)

    st.write("---")
    st.subheader("Prediction Result")

    # Calculate risk percentage (probability of malignancy)
    risk_percent = prediction[0][0] * 100
    
    if prediction[0][0] > 0.5:
        confidence = prediction[0][0] * 100
        st.error("❌ Malignant (Cancer Detected)")
        st.write(f"**Confidence:** {confidence:.2f}%")
        st.write(f"**Cancer Risk:** 🔴 {risk_percent:.2f}%")
    else:
        confidence = (1 - prediction[0][0]) * 100
        st.success("✅ Benign (No Cancer Detected)")
        st.write(f"**Confidence:** {confidence:.2f}%")
        st.write(f"**Cancer Risk:** 🟢 {risk_percent:.2f}%")
    
    # Show risk level
    st.write("---")
    if risk_percent >= 80:
        st.error(f"⚠️ **High Risk Level: {risk_percent:.2f}%**")
    elif risk_percent >= 50:
        st.warning(f"⚠️ **Medium Risk Level: {risk_percent:.2f}%**")
    else:
        st.success(f"✅ **Low Risk Level: {risk_percent:.2f}%**")