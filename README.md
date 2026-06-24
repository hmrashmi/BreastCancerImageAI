# 🏥 AI-Based Breast Cancer Detection Website

A modern web-based application for breast cancer detection using deep learning and Flask.

## Features

✅ **Web-based Interface** - Beautiful, responsive UI  
✅ **Real-time Analysis** - Instant predictions using trained AI model  
✅ **Risk Assessment** - Displays cancer risk percentage and levels  
✅ **Detailed Reporting** - Download analysis reports  
✅ **Image Validation** - Accepts PNG, JPG, JPEG (Max 16MB)  
✅ **Mobile Friendly** - Responsive design works on all devices  

## Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify Model File

Make sure `breast_cancer_cnn.h5` is in the project root directory.

## Running the Application

### Method 1: Using Flask Directly

```bash
# Navigate to project directory
cd c:\Users\HM Rashmi\Desktop\BreastCancerImageAI

# Activate virtual environment
.\tfenv\Scripts\activate

# Run Flask app
python app_flask.py
```

### Method 2: Using Command Line

```bash
python app_flask.py
```

The app will start on: **http://localhost:5000**

## Usage

1. **Open Browser** - Go to `http://localhost:5000`
2. **Upload Image** - Drag and drop or click to select a breast tissue image
3. **View Results** - Get instant classification and risk assessment
4. **Download Report** - Save the analysis report as text file

## Output Includes

- 📊 **Classification** - Benign or Malignant
- 📈 **Confidence Score** - Model confidence percentage
- 🔴 **Cancer Risk** - Risk percentage (0-100%)
- 📉 **Risk Level** - Low, Medium, or High
- 📋 **Detailed Probabilities** - Malignant and Benign probabilities

## Project Structure

```
BreastCancerImageAI/
├── app_flask.py              # Flask backend application
├── breast_cancer_cnn.h5      # Trained AI model
├── requirements.txt          # Python dependencies
├── templates/
│   └── index.html            # Web interface
└── static/
    ├── style.css             # Styling
    └── script.js             # Frontend logic
```

## System Requirements

- Python 3.8+
- TensorFlow 2.13+
- 2GB RAM minimum
- Modern web browser

## Supported Image Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)
- Maximum file size: 16MB

## Notes

⚠️ **Disclaimer**: This tool is for educational purposes only and should NOT be used as a substitute for professional medical diagnosis.

## Troubleshooting

**Port Already in Use?**
```bash
# Change port in app_flask.py:
app.run(debug=True, host='0.0.0.0', port=5001)  # Use 5001 instead of 5000
```

**Model Not Found?**
Ensure `breast_cancer_cnn.h5` is in the same directory as `app_flask.py`

## Contact & Support

For issues or questions, please refer to the documentation.
