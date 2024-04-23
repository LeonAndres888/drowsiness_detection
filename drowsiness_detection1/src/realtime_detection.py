import cv2
import numpy as np
import pygame
from tensorflow.keras.models import load_model
import time

# Initialize Pygame for the alarm
pygame.init()
alarm_sound = pygame.mixer.Sound('drowsiness_detection/resources/wakeupalarm.wav')
alarm_playing = False

# Load the trained model
model = load_model('models/drowsiness_model1.h5')

# Load Haar cascades for eye detection
left_eye_cascade = cv2.CascadeClassifier('drowsiness_detection/haarcascades/haarcascade_lefteye_2splits.xml')
right_eye_cascade = cv2.CascadeClassifier('drowsiness_detection/haarcascades/haarcascade_righteye_2splits.xml')

# Function to preprocess the image
def preprocess_image(image, target_size=(200, 200)):
    image = cv2.resize(image, target_size)
    if len(image.shape) == 2:  # if image is grayscale, convert it to three channels
        image = np.stack((image,)*3, axis=-1)
    image = image.astype('float32') / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# Initialize video capture
cap = cv2.VideoCapture(0)

# Variables for tracking the time eyes are closed
closed_eyes_start_time = None
eyes_closed_duration = 0
ALARM_THRESHOLD = 5  # 5 seconds

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    left_eyes = left_eye_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(20, 20))
    right_eyes = right_eye_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(20, 20))

    eye_regions = np.concatenate((left_eyes, right_eyes), axis=0) if len(left_eyes) and len(right_eyes) else []

    eye_closed_in_this_frame = False

    for (ex, ey, ew, eh) in eye_regions:
        eye = gray[ey:ey+eh, ex:ex+ew]
        cv2.rectangle(frame, (ex, ey), (ex+ew, ey+eh), (0, 255, 0), 2)
        eye_prepared = preprocess_image(eye)
        prediction = model.predict(eye_prepared)
        label_index = np.argmax(prediction)
        label = "Closed" if label_index == 0 else "Open"

        cv2.putText(frame, label, (ex, ey - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 2)

        if label == "Closed":
            eye_closed_in_this_frame = True

    if eye_closed_in_this_frame:
        if closed_eyes_start_time is None:
            closed_eyes_start_time = time.time()
        eyes_closed_duration = time.time() - closed_eyes_start_time
    else:
        closed_eyes_start_time = None
        eyes_closed_duration = 0

    if eyes_closed_duration > ALARM_THRESHOLD and not alarm_playing:
        pygame.mixer.Sound.play(alarm_sound, loops=-1)
        alarm_playing = True
    elif eyes_closed_duration < ALARM_THRESHOLD and alarm_playing:
        pygame.mixer.Sound.stop(alarm_sound)
        alarm_playing = False

    if eye_closed_in_this_frame and eyes_closed_duration:
        cv2.putText(frame, f"Closed Eyes Timer: {int(eyes_closed_duration)}s", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    cv2.imshow('Drowsiness Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
pygame.quit()
