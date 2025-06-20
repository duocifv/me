import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# === Cấu hình ===
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 10
DATA_DIR = "dataset"
MODEL_H5_PATH = "kale_growth_model.h5"
MODEL_TFLITE_PATH = "model.tflite"

# === Tăng cường dữ liệu ===
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=10,
    zoom_range=0.1,
    horizontal_flip=True
)

train_generator = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training"
)

val_generator = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation"
)

# === Mô hình CNN đơn giản ===
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(*IMAGE_SIZE, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.3),
    Dense(train_generator.num_classes, activation='softmax')
])

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# === Huấn luyện ===
model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS
)

# === Lưu mô hình H5 ===
model.save(MODEL_H5_PATH)
print(f"✅ Đã lưu mô hình .h5 tại {MODEL_H5_PATH}")

# === Chuyển đổi sang TensorFlow Lite ===
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open(MODEL_TFLITE_PATH, "wb") as f:
    f.write(tflite_model)

print(f"✅ Đã lưu mô hình .tflite tại {MODEL_TFLITE_PATH}")
