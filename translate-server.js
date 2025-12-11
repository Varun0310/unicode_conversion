const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const translate = require("google-translate-api-x");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/translate", async (req, res) => {
  try {
    const { q, target } = req.body;

    if (!q || !target) {
      return res.status(400).json({ error: "Missing q or target" });
    }

    // google-translate-api-x automatically detects source language
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Translation server running at http://localhost:${PORT}`);
});
