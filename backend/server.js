require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const translate = require("google-translate-api-x");
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/translate", async (req, res) => {
    try {
        const { q, target } = req.body;

        if (!q || !target) {
            return res.status(400).json({ error: "Missing q or target" });
        }

        const result = await translate(q, { to: target });

        res.json({ translatedText: result.text });
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({
            error: "Translation failed",
            message: error.message || null,
        });
    }
});

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Mongo connected'))
    .catch(err => console.error('Mongo connection error', err));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


