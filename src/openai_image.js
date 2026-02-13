const axios = require('axios');

async function generateImage(prompt, { model = 'dall-e-2', size = '1024x1024', n = 1 } = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set in environment');

  const endpoint = 'https://api.openai.com/v1/images/generations';
  const payload = { model, prompt, size, n };

  try {
    const res = await axios.post(endpoint, payload, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
    });

    // Response expected to be { data: [ { b64_json or url } ] }
    if (!res.data || !res.data.data) throw new Error('Unexpected image generation response');

    return res.data.data.map(item => {
      if (item.b64_json) return { b64: item.b64_json, mime: 'image/png' };
      if (item.url) return { url: item.url };
      return { raw: item };
    });
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data?.error?.message || JSON.stringify(error.response.data);
      throw new Error(`OpenAI API error: ${errorMsg}`);
    }
    throw error;
  }
}

module.exports = { generateImage };
