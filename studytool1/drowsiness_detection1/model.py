import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt

# Define the CNN model
def create_model():
    model = Sequential([
        Conv2D(16, (3,3), activation='relu', input_shape=(200, 200, 3)),
        MaxPooling2D(2, 2),
        Conv2D(32, (3,3), activation='relu'),
        MaxPooling2D(2, 2),
        Conv2D(64, (3,3), activation='relu'),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(512, activation='relu'),
        Dense(4, activation='softmax')  # Adjusted to four classes
    ])
    
    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    
    return model

# Load and preprocess an image
def load_image(img_path):
    img = image.load_img(img_path, target_size=(200, 200))
    img_tensor = image.img_to_array(img)  # Convert the image to array
    img_tensor = np.expand_dims(img_tensor, axis=0)  # Expand dimensions to match the model input
    img_tensor /= 255.  # Rescale the image
    return img_tensor

# Main function to run the training and evaluation
def main():
    train_data_dir = 'drowsiness_detection/dataset/train'  # Replace with your path
    validation_split = 0.2
    batch_size = 32
    epochs = 5
    
    # Data generators
    train_datagen = ImageDataGenerator(rescale=1./255, validation_split=validation_split)
    train_generator = train_datagen.flow_from_directory(
        train_data_dir,
        target_size=(200, 200),
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'
    )
    validation_generator = train_datagen.flow_from_directory(
        train_data_dir,
        target_size=(200, 200),
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'
    )

    # Create and train the model
    model = create_model()
    model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // batch_size,
        epochs=epochs,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // batch_size
    )

    # Save the model
    model.save('models/drowsiness_model1.h5')

    # Evaluate on test data
    test_generator = train_datagen.flow_from_directory(
        train_data_dir,
        target_size=(200, 200),
        batch_size=batch_size,
        class_mode='categorical'
    )
    test_loss, test_accuracy = model.evaluate(test_generator)
    print(f"Test Accuracy: {test_accuracy}, Test Loss: {test_loss}")

if __name__ == "__main__":
    main()
