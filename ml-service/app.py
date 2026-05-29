from flask import Flask , request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load('./model.pkl')
print('model loaded and ready')

#Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status':'ok', 'message':'ml service running'})

#Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({'error':'no data provided'}), 400
    
    results = []

    for machine in data:
        try:
            features = np.array([[
                machine['air_temp'],
                machine['process_temp'],
                machine['rpm'],
                machine['torque'],
                machine['tool_wear']
            ]])

            prob = model.predict_proba(features)[0][1]

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
    app.run(port = 5001,debug=True)


