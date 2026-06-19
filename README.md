# SmartMaint — Predictive Machine Maintenance Dashboard

A full-stack dashboard that predicts industrial machine failure risk from
sensor data using a Random Forest model. Built with React, Node.js, and
a Python ML microservice.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, MongoDB
- **ML Service:** Python, Flask, scikit-learn
- **Dataset:** AI4I 2020 Predictive Maintenance (UCI)

## Architecture

React (5173) → Node.js/Express (3001) → MongoDB
                      ↓
              Flask ML service (5001) → Random Forest model

The ML layer runs as a separate microservice so it can be retrained or
scaled independently of the application backend.

## Features

- CSV upload of sensor readings, parsed and stored in MongoDB
- Batch ML predictions (processed in chunks to avoid timeouts)
- Server-side pagination — 30 machines per page
- KPI summary across all machines (total / high / medium / low risk)
- Threshold-based and ML-based alert engine
- Four pages: Dashboard, Machines, Alerts, History

## Running locally

### Requirements
Node.js 18+, Python 3.9+, MongoDB Atlas account

### 1. ML service
cd ml-service

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python train_model.py

python app.py

### 2. Backend
cd back-end

npm install

cp .env.example .env

npm run dev

### 3. Frontend
cd front-end

npm install

npm run dev

## ML Model

- Random Forest Classifier, 100 estimators, balanced class weights
- Features: air temperature, process temperature, RPM, torque, tool wear
- Accuracy: ~97% on held-out test data
- Risk thresholds: >60% probability = High, 30–60% = Medium, <30% = Low

## Project Structure

## Author
Yadu Krishna K