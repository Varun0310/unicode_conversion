const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

function cleanReply(text) {
    if (!text) return '';

    text = text.replace(/\n+/g, ' ').trim();

    // Remove dangling numbered or bulleted endings
    text = text.replace(/(\s|^)(\d+\.|\*|-)\s*$/, '').trim();

    // Extract complete sentences only
    const sentences = text.match(/[^.!?]+[.!?]/g);
    if (!sentences) return text;

    return sentences.slice(0, 4).join(' ').trim();
}

async function callGemini(message, retries = 2) {
    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            systemInstruction: {
                role: 'system',
                parts: [{
                    text: `
You are Fino Pay Support.

MANDATORY RULES:
- Reply in 2–4 short sentences ONLY
- No paragraphs
- No lists
- Simple language
`
                }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: message }]
            }],
            generationConfig: {
                maxOutputTokens: 80,
                temperature: 0.4
            }
        });

        let reply =
            response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return cleanReply(reply);

    } catch (err) {
        if (err.status === 503 && retries > 0) {
            console.warn('Gemini overloaded, retrying...');
            await new Promise(r => setTimeout(r, 1200));
            return callGemini(message, retries - 1);
        }
        throw err;
    }
}

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message required' });
        }

        const reply = await callGemini(message);
        res.json({ reply });

    } catch (err) {
        console.error('Gemini error:', err.message);
        res.status(500).json({
            message: 'Gemini API error',
            details: err.message
        });
    }
});

module.exports = router;
