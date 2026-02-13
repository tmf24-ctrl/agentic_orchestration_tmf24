const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

async function getAccessToken() {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  if (!res || !res.token) throw new Error('Failed to acquire access token for Google APIs');
  return res.token;
}

/**
 * Call Gemini (Generative Language) API.
 * If `GEMINI_API_KEY` is set in env, use it (query param) instead of OAuth.
 * Uses generateContent endpoint which supports text and media.
 */
async function callGemini(prompt, model = 'gemini-2.5-pro') {
  const apiKey = process.env.GEMINI_API_KEY;
  const baseUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';

  // Strip "models/" prefix if present
  const modelName = model.replace(/^models\//, '');
  const endpoint = `${baseUrl}/${modelName}:generateContent` + (apiKey ? `?key=${apiKey}` : '');

  const body = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024
    }
  };

  let res;
  try {
    if (apiKey) {
      // Use API key in query string
      res = await axios.post(endpoint, body);
    } else {
      const token = await getAccessToken();
      res = await axios.post(endpoint, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error(`Rate limited by Gemini API. Please wait a moment and try again.`);
    }
    if (error.response?.status === 404) {
      throw new Error(`Gemini model '${modelName}' not found. Try 'gemini-2.5-pro', 'gemini-2.5-flash', or 'gemini-pro-latest'.`);
    }
    throw error;
  }

  // Try extracting reasonable text from the response
  if (res.data?.candidates && res.data.candidates[0]?.content?.parts) {
    const parts = res.data.candidates[0].content.parts;
    return parts.map(p => p.text || '').join('\n');
  }
  if (res.data?.candidates && res.data.candidates[0]?.content) {
    return res.data.candidates[0].content;
  }
  if (res.data?.output && typeof res.data.output === 'string') {
    return res.data.output;
  }
  return JSON.stringify(res.data, null, 2);
}

module.exports = { callGemini };
