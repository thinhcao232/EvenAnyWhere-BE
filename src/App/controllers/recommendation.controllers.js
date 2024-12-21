const axios = require('axios');
const Event = require('../models/event.model');


const getRecommendations = async(req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: "user_id cannot be empty" });
    }

    try {
        const pythonResponse = await axios.get(`http://localhost:9000/recommendations/${userId}`);
        const recommendations = pythonResponse.data;

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            return res.status(404).json({ error: "No recommendations found" });
        }
        const eventDetailsPromises = recommendations.map(async(recommendation) => {
            const event = await Event.findById(recommendation.event_id);
            return {
                ...recommendation,
                eventDetails: event || null
            };
        });

        const detailedRecommendations = await Promise.all(eventDetailsPromises);
        res.status(200).json(detailedRecommendations);
    } catch (error) {
        console.error("Error handling recommendations:", error.message);
        res.status(500).json({ error: "Failed to process recommendations" });
    }
};

module.exports = { getRecommendations };