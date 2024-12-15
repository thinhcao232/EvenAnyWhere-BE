const axios = require('axios');

const getRecommendations = async(req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ error: "user_id cannot be empty" });
    }

    try {
        const pythonResponse = await axios.get(`http://localhost:9000/recommendations/${userId}`);

        res.status(200).json(pythonResponse.data);
    } catch (error) {
        console.error("Error communicating with Python API:", error.message);
        res.status(500).json({ error: "Failed to fetch recommendations from Python API" });
    }
};

module.exports = { getRecommendations };