
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // Standard Node port for many hosts

// Security Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const allowedOrigins = [
  'https://studio.trygrowth.ai',
  'https://trygrowth.ai',
  'https://api.trygrowth.ai',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    // Allow any subdomain of your domain in production if needed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.trygrowth.ai')) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Access denied.'), false);
  },
  credentials: true
}));

app.use(express.json());

// Path to the static build files
const distPath = path.join(__dirname, 'dist');

// Serve static files from the Vite build directory 'dist'
app.use(express.static(distPath));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    version: "1.2.4",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    demand: { type: Type.STRING },
    competition: { type: Type.STRING },
    verdict: { type: Type.STRING },
    analysis: { type: Type.STRING },
    explanation: { type: Type.STRING }
  },
  required: ["score", "demand", "competition", "verdict", "analysis", "explanation"]
};

const getAIResponse = async (prompt, history = []) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Server configuration error: API Key missing.");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "You are Growth, a VC-grade AI. Validate startup ideas for the Bharat market. Return JSON ONLY.",
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });
  return JSON.parse(response.text);
};

// API Endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const result = await getAIResponse(message, history);
    res.json(result);
  } catch (err) {
    console.error("Chat Execution Error:", err.message);
    res.status(500).json({ 
      error: "Validation Engine Error", 
      details: err.message 
    });
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Growth AI Unified Server v1.2.4 Online`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`📁 Production Mode: serving from ${distPath}`);
});
