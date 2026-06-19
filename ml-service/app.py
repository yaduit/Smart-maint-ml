import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app, origins=os.environ.get('CORS_ORIGINS', '*'))

MODEL_PATH = os.environ.get('MODEL_PATH', './model.pkl')
model = joblib.load(MODEL_PATH)
print(f'model loaded from {MODEL_PATH} and ready')

FEATURE_NAMES = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]'
]

#Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status':'ok', 'message':'ml service running'})

#Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({'error':'no data provided'}), 400
    
    results = []

    for machine in data:
        try:
            features_df = pd.DataFrame([[
                machine['air_temp'],
                machine['process_temp'],
                machine['rpm'],
                machine['torque'],
                machine['tool_wear']
            ]],columns=FEATURE_NAMES)

            prob = model.predict_proba(features_df)[0][1]

            if prob>0.6:
                risk = 'High'
            elif prob>0.3:
                risk = 'Medium'
            else:
                risk = 'Low'

            results.append({
                'machine_id': machine['machine_id'],
                'risk_level': risk,
                'probability': round(float(prob),3)
            })
        
        except Exception as e:
            results.append({
                'machine_id': machine.get('machine_id', 'unknown'),
                'error': str(e)
            })
    return jsonify(results)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', '0') in ['1', 'true', 'True']
    app.run(port=port, debug=debug)


