from flask import Flask, jsonify
from recommender import hybrid_recommendation

app = Flask(__name__)

@app.route('/recommendations/<string:user_id>', methods=['GET'])
def get_recommendations(user_id):
    if not user_id:
        return jsonify({"error": "user_id cannot be empty"}), 400

    recommendations = hybrid_recommendation(user_id)
    print(recommendations)
    
    return jsonify(recommendations.to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True, port=9000)
