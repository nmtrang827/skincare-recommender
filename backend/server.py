from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender_tfidf import rec_hybrid, products

app = Flask(__name__)
CORS(app)

@app.route("/recommend_tfidf", methods=["POST"])
def recommend_tfidf():
    user = request.json
    recommendations = rec_hybrid(user, products, top_n=8, alpha=0.7)
    results = []

    for product, score in recommendations:
        results.append({
            "name": product["product_name"],
            "type": product["product_type"],
            "price": product["price"],
            "active_ingredients": product["active_ingredients"],
            "url": product["product_url"]
        })
    
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)