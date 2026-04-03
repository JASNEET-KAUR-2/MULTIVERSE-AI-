"""
Compatibility shim for environments that already have TensorFlow installed
but do not have the separate tf-keras package.

DeepFace imports RetinaFace on startup, and RetinaFace only checks whether
`import tf_keras` succeeds for TensorFlow/Keras 3 environments. Our emotion
service uses the OpenCV detector backend, so a lightweight shim is enough to
let DeepFace initialize without downloading another large TensorFlow wheel.
"""

from tensorflow import keras

__version__ = getattr(keras, "__version__", "3")

__all__ = ["keras"]
