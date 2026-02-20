const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/voice', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log('Received text:', text);

        // 1. Generate GPT response
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful voice assistant. Keep your responses concise and conversational." },
                { role: "user", content: text }
            ],
        });

        const responseText = completion.choices[0].message.content;
        console.log('GPT Response:', responseText);

        // 2. Convert response to speech
        const mp3 = await openai.audio.speech.create({
            model: "tts-1", // Using standard TTS model
            voice: "alloy",
            input: responseText,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
 
        
        const audioBase64 = buffer.toString('base64');
        
        res.json({
            role: 'assistant',
            content: responseText,
            audio: `data:audio/mpeg;base64,${audioBase64}`
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred processing your request.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
