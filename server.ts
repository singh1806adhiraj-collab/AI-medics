import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Resilient Gemini Content Generation with model fallback and JSON parsing
 */
async function callGeminiJson(prompt: string, systemInstruction: string): Promise<{ data: any; model: string }> {
  if (!ai) {
    throw new Error('Gemini API key is not configured');
  }

  // Model cascade: try gemini-3.8-flash first, fall back to gemini-3.1-flash-lite on 503/429
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return { data: parsed, model };
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} encountered error:`, err?.message || err);
      lastError = err;
      // Continue to next model if available
    }
  }

  throw lastError || new Error('All Gemini model calls failed');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Endpoint 1: Structured AI Operations Analysis
 */
app.post('/api/gemini/analyze-structured', async (req, res) => {
  try {
    const { actionType, telemetry } = req.body;

    if (!telemetry) {
      return res.status(400).json({ error: 'Missing telemetry data in request' });
    }

    const systemInstruction = `You are AI-Medics, an expert healthcare operations and supply chain resilience reasoning intelligence agent.
You are assisting hospital pharmacy directors and regional healthcare coordinators.
CRITICAL OPERATIONAL CONSTRAINTS:
1. Reason ONLY from the supplied synthetic dataset. Do not invent facilities or medicines outside the telemetry.
2. This is an administrative supply chain system. DO NOT provide clinical patient medical treatments, diagnosis, or prescribing dosages.
3. Every recommendation must be an operational logistics decision (e.g. transfer quantity, reserve buffer preservation, cold-chain transport, expiry re-allocation).
4. Clearly state assumptions and operational risks.
5. Return ONLY a valid JSON object matching the exact requested schema.`;

    const prompt = `Perform a structured ${actionType} analysis on the following current regional hospital telemetry:

CURRENT NETWORK TELEMETRY:
${JSON.stringify(telemetry, null, 2)}

Return a JSON object with this EXACT structure:
{
  "summary": "High-level 2-3 sentence executive synthesis of the operational state.",
  "key_findings": ["Specific calculated finding 1 with numbers", "Specific calculated finding 2", "Specific calculated finding 3"],
  "priority_actions": ["Immediate operational action 1", "Action 2", "Action 3"],
  "affected_facilities": ["Hospital Name 1", "Hospital Name 2"],
  "recommended_transfers": [
    {
      "from": "Donor Hospital",
      "to": "Recipient Hospital",
      "medicine": "Medicine Name",
      "quantity": 100,
      "urgency": "Immediate / High / Routine",
      "reason": "Logistical justification citing runway days gained"
    }
  ],
  "risks": ["Supply chain risk 1", "Regulatory/transport risk 2"],
  "reasoning": "Detailed chain-of-thought explanation of why these transfers were chosen and how donor safety buffers were preserved.",
  "assumptions": ["Assumption regarding transit times or delivery schedules", "Assumption regarding burn rate stability"]
}`;

    const { data: parsed, model } = await callGeminiJson(prompt, systemInstruction);
    parsed.timestamp = new Date().toISOString();
    parsed.model_used = model;
    parsed.data_used_summary = `Telemetry: ${telemetry.critical_items?.length || 0} critical shortages, ${telemetry.donor_candidates?.length || 0} donor candidates, ${telemetry.expiring_batches?.length || 0} expiring batches evaluated.`;

    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Structured Analysis Error:', error);
    res.status(500).json({
      error: error.message || 'Gemini analysis failed',
      fallbackAvailable: true,
      message: 'Gemini analysis unavailable — deterministic analysis remains available.',
    });
  }
});

/**
 * Endpoint 2: Custom Question to Gemini
 */
app.post('/api/gemini/custom-query', async (req, res) => {
  try {
    const { question, contextData } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question in request' });
    }

    const systemInstruction = `You are AI-Medics, an expert healthcare operations and logistics AI reasoning agent.
You are answering a specific operational query from a hospital logistics administrator.
RULES:
1. Reason ONLY from the supplied synthetic dataset.
2. Never provide patient medical diagnosis or prescribing advice. Focus strictly on inventory redistribution, runway calculations, and safety buffer integrity.
3. Cite specific numbers directly from the data (current stock, burn rate, runway days).
4. Explicitly state the recommended transfer quantity while ensuring the donor hospital retains at least a 14-day minimum safety buffer.
5. Return ONLY a valid JSON object matching the exact schema requested.`;

    const prompt = `ADMINISTRATOR QUESTION:
"${question}"

RELEVANT STRUCTURED INVENTORY CONTEXT:
${JSON.stringify(contextData, null, 2)}

Return a JSON object with this EXACT structure:
{
  "answer": "Direct, concise operational answer identifying the best course of action.",
  "data_citations": [
    {
      "hospital": "Hospital Name",
      "medicine": "Medicine Name",
      "current_stock": 100,
      "daily_burn": 10,
      "stock_runway_days": 10.0,
      "metric_notes": "e.g. 240 units expiring in <30 days; leaves safe buffer"
    }
  ],
  "recommendation": "Precise recommended action (e.g. Transfer approximately 180 units from Facility A to Facility B)",
  "rationale": "Detailed explanation distinguishing calculated facts from logistical rationale.",
  "synthetic_disclaimer": "This is synthetic demonstration data and the recommendation is decision support only."
}`;

    const { data: parsed, model } = await callGeminiJson(prompt, systemInstruction);
    parsed.timestamp = new Date().toISOString();
    parsed.model_used = model;
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Custom Query Error:', error);
    res.status(500).json({
      error: error.message || 'Gemini query failed',
      fallbackAvailable: true,
      message: 'Gemini analysis unavailable — deterministic analysis remains available.',
    });
  }
});

/**
 * Endpoint 3: Gemini Strategic Stress Test
 */
app.post('/api/gemini/stress-test', async (req, res) => {
  try {
    const { scenarioParams, simulationFindings } = req.body;

    if (!simulationFindings) {
      return res.status(400).json({ error: 'Missing simulation findings' });
    }

    const systemInstruction = `You are AI-Medics, a healthcare supply chain resilience stress-test analyst.
You are evaluating the results of a deterministic simulation engine.
The numerical calculations (new daily burns, projected days to stockout, deficit units) have ALREADY been computed deterministically.
Your task is to REASON over those numbers, explain the cascading consequences, identify bottleneck risks, and formulate a prioritized redistribution strategy.
Do NOT give medical advice to patients.
Return ONLY a valid JSON object matching the requested schema.`;

    const prompt = `SCENARIO SHOCK PARAMETERS:
- Demand Modifier: +${Math.round((scenarioParams?.demandModifier || 0) * 100)}%
- Supplier Delivery Disruption: ${Math.round((scenarioParams?.supplyDisruption || 0) * 100)}%
- Target Therapeutic Class: ${scenarioParams?.selectedCategory || 'All'}

DETERMINISTIC SIMULATION FINDINGS:
${JSON.stringify(simulationFindings, null, 2)}

Return a JSON object with this EXACT structure:
{
  "scenario_summary": "Executive summary of the simulated shock and the primary failure points.",
  "network_impact": "Assessment of how the shock degrades the network resilience score and regional stockout runways.",
  "newly_vulnerable_facilities": ["Facility A (Medicine X at risk)", "Facility B"],
  "critical_medicines": ["Medicine 1", "Medicine 2"],
  "recommended_interventions": ["Strategic intervention 1", "Intervention 2", "Intervention 3"],
  "redistribution_plan": [
    {
      "donor": "Donor Hospital Name",
      "recipient": "Vulnerable Recipient Hospital Name",
      "medicine": "Medicine Name",
      "units": 150,
      "impact": "Mitigates stockout by +X days without depleting donor below safe threshold"
    }
  ],
  "top_risks": ["Risk of secondary stockout at donor", "Transport bottleneck in urban corridor", "Expiry loss risk"],
  "reasoning": "Detailed analytical reasoning contrasting deterministic numbers with operational recommendations."
}`;

    const { data: parsed, model } = await callGeminiJson(prompt, systemInstruction);
    parsed.timestamp = new Date().toISOString();
    parsed.model_used = model;
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Stress Test Error:', error);
    res.status(500).json({
      error: error.message || 'Gemini stress test failed',
      fallbackAvailable: true,
      message: 'Gemini analysis unavailable — deterministic analysis remains available.',
    });
  }
});

// Start Express server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI-Medics] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
