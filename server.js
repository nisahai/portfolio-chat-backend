require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant on my portfolio website.
You have a quirky and funny personality.
Keep answers short and friendly. Here is info about me:
- Name: Nisah
- Skills: AI Agent, Prompt Engineering
- Available for: full-time
- Contact: Ask users to reach out via contact form located in the website
If you don't know something, tell them to contact me.`;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(process.env.PORT || 3001, () => console.log('Server running'));
