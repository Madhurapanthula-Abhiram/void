import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// OpenAI/OpenRouter client setup
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.get('/', (req, res) => {
    res.send('VOID Backend API is running...');
});

// Endpoint for AI features
app.post('/api/analyze', async (req, res) => {
    const { code, feature } = req.body;

    if (!code) return res.status(400).json({ error: 'Code is required' });

    try {
        // Placeholder for AI logic
        // const completion = await openai.chat.completions.create({
        //   model: "qwen/qwen3-coder:free",
        //   messages: [{ role: "user", content: `Feature: ${feature}\n\nCode:\n${code}` }],
        // });
        // res.json({ result: completion.choices[0].message.content });

        res.json({ message: `Analysis for ${feature} received. (Backend placeholder)` });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Failed to process AI request' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
