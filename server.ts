import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// AI Policy Guide API Endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { question, role, department } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallback: true,
      });
    }

    const systemInstruction = `You are the CampusCare AI Policy Guide and University Student Redressal Ombudsman Assistant.
Your job is to analyze the user's inquiry regarding university grievances, campus policies, administrative procedures, and student rights, and provide a direct, insightful, and actionable response.

Context of CampusCare Platform:
- System: CampusCare Smart Grievance Redressal System (Karunya Institute / University campus).
- Resolution SLAs:
  * Critical (Safety hazards, water outages, severe electricity failure, anti-ragging): 4-hour SLA
  * High (Wi-Fi exam disruptions, mess food quality, classroom equipment): 12-hour SLA
  * Medium (Hostel room repair, fee receipt mismatch, transport delay): 48-hour SLA
  * Low (General suggestions, library book acquisition, minor queries): 120-hour SLA
- Automatic Escalation: If a ticket breaches its SLA timer without resolution, it automatically escalates to the Department Head, then to the Dean of Student Affairs.
- Resolution Verification Loop: When maintenance or staff marks a ticket as "Resolved", the student must test and verify it. If not resolved properly, the student can click "Reopen Ticket" with reasons.
- Confidentiality: Anonymous reporting is supported for sensitive matters like anti-ragging, mental health, or harassment.
- Categories: Academic, Hostel, Transport, Fees, Food/Mess, IT Support, Infrastructure, Library, Safety & Security.

Guidelines for response:
1. Directly analyze what the user asked with specific recommendations, practical instructions, and step-by-step guidance.
2. Mention the specific category, expected SLA deadline, and relevant university department or contact.
3. Be professional, supportive, clear, and empathetic. Do NOT use generic repetitive boilerplate.
4. Keep the response concise, formatted with clear paragraphs or bullet points.`;

    const prompt = `User role: ${role || 'Student'}, Department: ${department || 'General'}
User question: "${question.trim()}"

Analyze this question and provide an actionable, thorough, and specific policy response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text;
    res.json({ reply });
  } catch (error: any) {
    console.error('Error generating assistant response:', error);
    res.status(500).json({
      error: error.message || 'Failed to process question with AI',
      fallback: true,
    });
  }
});

// Mount Vite middleware in development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
