// collections.js

const mongoose = require("mongoose");

const fetchCollectionNames = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);
        res.json(collectionNames);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { fetchCollectionNames };
