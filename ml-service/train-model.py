import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

#Loading the dataset
df = pd.read_csv('./ai4i2020.csv')
print('dataset loaded','shape: ',df.shape)
print(df.head(3))

#Features and target
features = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]'
]

x = df[features]
y = df['Machine failure']

print(f"\nFailure rate: {y.mean()*100:.1f}%")

#splitting train/test sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
print(f"\nTraining rows: {len(x_train)}, Test rows: {len(x_test)}")

#Model training
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight='balanced'
)
model.fit(x_train, y_train)
print("\n✓ Model trained!")

#Evaluation
y_pred = model.predict(x_test)
print(f"\nAccuracy: {accuracy_score(y_test, y_pred)*100:.1f}%")
print("\nDetailed report:")
print(classification_report(y_test,y_pred))

#saving the model
joblib.dump(model, 'model.pkl')
print("\n✓ model.pkl saved — ready for Flask!")

