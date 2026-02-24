require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Load system prompt from separate file ──────────────────
function loadSystemPrompt() {
  try {
    const filePath = path.join(__dirname, 'system-prompt.txt');
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Could not load system-prompt.txt:', err.message);
    return 'You are a helpful assistant on this portfolio website.';
  }
}

// ── Chat endpoint ──────────────────────────────────────────
app.post('/chat', async (req, res) => {
  const { messages, portfolioContext } = req.body;

  // Build final system prompt: file + live website content
  let systemPrompt = loadSystemPrompt();

  if (portfolioContext && portfolioContext.trim().length > 0) {
    systemPrompt += `\n\n---\nHere is the current live content from the portfolio website. Use this as your primary source of truth when answering questions:\n\n${portfolioContext.slice(0, 6000)}`;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(process.env.PORT || 3001, () => console.log('Server running'));
