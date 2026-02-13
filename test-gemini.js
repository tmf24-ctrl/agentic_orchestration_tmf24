require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log('❌ GEMINI_API_KEY not set in .env');
      return;
    }

    // Read an actual screenshot file
    const screenshotPath = './images/1770925243789-screenshot-github.com.png';
    if (!fs.existsSync(screenshotPath)) {
      console.log('❌ Screenshot file not found');
      return;
    }

    const buffer = fs.readFileSync(screenshotPath);
    const b64 = buffer.toString('base64');

    console.log('📤 Sending test request to Gemini...');
    console.log('Image size:', b64.length, 'bytes');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`,
      {
        contents: [{
          parts: [
            {
              text: `You are a professional web designer and UX expert. Analyze this website screenshot and provide detailed feedback on:

1. **Visual Design**: Color scheme, typography, spacing, visual hierarchy
2. **User Experience**: Navigation, accessibility, clarity of purpose
3. **Mobile Readiness**: How it appears to perform on different devices
4. **Best Practices**: Adherence to web design standards and accessibility
5. **Improvement Suggestions**: Top 3-5 actionable recommendations

Be constructive, specific, and reference elements you see in the screenshot. Format your response clearly with sections.`
            },
            { inlineData: { mimeType: 'image/png', data: b64 } }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      }
    );

    console.log('✅ Response status:', response.status);
    console.log('Has candidates:', !!response.data?.candidates);
    console.log('Has content:', !!response.data?.candidates?.[0]?.content);
    console.log('Has parts:', !!response.data?.candidates?.[0]?.content?.parts);
    console.log('Has text:', !!response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log('✅ Got feedback text:');
      console.log(text);
    } else {
      console.log('❌ No text found');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.log('❌ Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  }
}

test();
