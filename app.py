# python-ai-backend/app.py

from flask import Flask, request, jsonify # Flask for web server, request for handling incoming requests, jsonify for returning JSON responses
from flask_cors import CORS # Flask-CORS extension to handle Cross-Origin Resource Sharing
from sentence_transformers import SentenceTransformer # Core library for converting text into numerical embeddings
import torch # PyTorch, a deep learning framework, used here for tensor operations and cosine similarity calculation

# Initialize the Flask application
app = Flask(__name__)
# Enable CORS for all routes. This allows your Java backend (and React frontend indirectly)
# to make requests to this Flask application from a different origin (e.g., different port).
CORS(app)

print("Loading Hugging Face model 'sentence-transformers/all-MiniLM-L6-v2' (this might take a moment the first time it downloads)...")
# Load a pre-trained sentence embedding model.
# This model takes a sentence and converts it into a dense numerical vector (embedding)
# that captures its semantic meaning. 'all-MiniLM-L6-v2' is a lightweight yet effective model.
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print("Hugging Face model loaded.")

# In-memory item data for the Python AI backend.
# This data includes 'description' which is crucial because the AI model uses it
# to understand the content of each item and compute similarity.
# For now, this data is hardcoded here and duplicated in Java's items.json for simplicity.
items_data = [
    {"id": "item1", "name": "The Great Gatsby", "category": "Classic Literature", "description": "Classic novel about the American Dream, jazz age, wealth and love."},
    {"id": "item2", "name": "1984", "category": "Dystopian Fiction", "description": "Dystopian social science fiction novel by George Orwell, totalitarianism, surveillance."},
    {"id": "item3", "name": "To Kill a Mockingbird", "category": "Classic Literature", "description": "Classic of modern American literature, dealing with racism and injustice in the Deep South."},
    {"id": "item4", "name": "Dune", "category": "Science Fiction", "description": "Epic science fiction novel about politics, religion, ecology, and human evolution on a desert planet."},
    {"id": "item5", "name": "Pride and Prejudice", "category": "Classic Romance", "description": "Romantic novel of manners by Jane Austen, marriage, class and social expectations."},
    {"id": "item6", "name": "Foundation", "category": "Science Fiction", "description": "Science fiction series by Isaac Asimov, galactic empire, psychohistory and collapse."},
    {"id": "item7", "name": "Lord of the Rings", "category": "Fantasy", "description": "High fantasy novel by J. R. R. Tolkien, quest, good vs evil, magic, hobbits."},
    {"id": "item8", "name": "The Hitchhiker's Guide to the Galaxy", "category": "Science Fiction Comedy", "description": "Comic science fiction series by Douglas Adams, absurdity, space travel, alien encounters."}
]

# Pre-compute embeddings for all item descriptions.
# This is a one-time process executed when the Flask app starts.
# It converts each item's description text into a numerical vector.
# This makes subsequent similarity calculations much faster as we don't re-encode items repeatedly.
item_descriptions = [item["description"] for item in items_data]
item_embeddings = model.encode(item_descriptions, convert_to_tensor=True) # convert_to_tensor=True returns PyTorch tensors

# Basic root endpoint for testing connectivity
@app.route('/')
def hello_python():
    return "Hello from Python AI backend!"

# A placeholder endpoint (from previous phases) that receives a message and echoes it back.
# Not directly used in the recommendation flow but kept for continuity.
@app.route('/process_data', methods=['POST'])
def process_data():
    # Check if the incoming request body is JSON
    if not request.is_json:
        return jsonify({"status": "error", "message": "Request must be JSON"}), 400

    data = request.get_json() # Get the JSON data from the request body
    received_message = data.get('message', 'No message provided') # Extract 'message' field
    print(f"Python received message for process_data: '{received_message}'") # Log the received message

    response_message = f"Python processed: '{received_message}'. Sending back a greeting!"
    return jsonify({"status": "success", "processed_message": response_message}), 200

# NEW ENDPOINT (Core of Phase 4): Handles recommendation requests from the Java backend.
# This endpoint performs the AI-driven content-based recommendation logic.
@app.route('/recommend', methods=['POST'])
def recommend_items():
    # Ensure the request body is JSON
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    # Extract the user's text preferences from the request body.
    # The Java backend sends this via the RecommendationRequest DTO.
    user_preferences_text = data.get('preferences', '')

    # Return an error if no preferences text is provided.
    if not user_preferences_text:
        return jsonify({"error": "No preferences provided for recommendation"}), 400

    print(f"Python AI: Received user preferences: '{user_preferences_text}'")

    # 1. Generate an embedding for the user's preferences text.
    # This converts the user's natural language input into a numerical vector.
    user_embedding = model.encode(user_preferences_text, convert_to_tensor=True)

    # Reshape the user embedding: `unsqueeze(0)` adds a batch dimension, converting
    # a 1D tensor (e.g., [embedding_dim]) to a 2D tensor (e.g., [1, embedding_dim]).
    # This is often required by similarity functions that expect batch inputs.
    user_embedding_reshaped = user_embedding.unsqueeze(0)

    # 2. Calculate the cosine similarity between the user's preference embedding
    #    and the pre-computed embeddings of all available items.
    # Cosine similarity measures the cosine of the angle between two vectors.
    # A score close to 1 means high similarity, -1 means high dissimilarity, 0 means no relation.
    similarities = []
    for item_emb in item_embeddings:
        # unsqueeze(0) also for item_emb for consistent 2D input to cosine_similarity calculation
        similarity_score = torch.nn.functional.cosine_similarity(user_embedding_reshaped, item_emb.unsqueeze(0))
        similarities.append(similarity_score.item()) # .item() extracts the scalar Python float value from the PyTorch tensor

    # 3. Identify and return the top N recommendations based on similarity scores.
    top_n = 3 # Define how many top recommendations to retrieve.

    # Create a list of (original_index, similarity_score) pairs.
    # `enumerate` provides (index, value) pairs.
    indexed_similarities = sorted(enumerate(similarities), key=lambda x: x[1], reverse=True) # Sort in descending order of similarity

    recommended_items = []
    # Iterate through the sorted similarities and collect the corresponding item data.
    for i, sim_score in indexed_similarities:
        if len(recommended_items) < top_n:
            recommended_items.append(items_data[i]) # Add the actual item dictionary from items_data
        else:
            break # Stop once we have collected enough recommendations

    print(f"Python AI: Recommended {len(recommended_items)} items: {recommended_items}")
    return jsonify(recommended_items), 200 # Return the list of recommended items as JSON

# Entry point for running the Flask application.
if __name__ == '__main__':
    # Run Flask in debug mode on port 5000.
    # debug=True enables auto-reloading on code changes and provides a debugger.
    app.run(debug=True, port=5000)