const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const mime = require('mime-types');
const { Command } = require('../Command');
const { callGemini } = require('../gemini');
const { uploadToGCS } = require('../gcs');

class GeminiCommand extends Command {
  async execute(options) {
    const prompt = options.prompt || options._?.[0];
    if (!prompt) {
      throw new Error('gemini requires a prompt argument');
    }

    const filePath = options.file;
    let fullPrompt = prompt;

    console.log('Calling Gemini API...');
    if (filePath) {
      console.log(`Using file: ${filePath}`);
    }

    try {
      let geminiResp = '';

      if (filePath) {
        const resolvedPath = path.resolve(filePath);
        if (!fs.existsSync(resolvedPath)) {
          throw new Error(`File not found: ${resolvedPath}`);
        }

        const stat = fs.statSync(resolvedPath);
        const MAX_INLINE = 1 * 1024 * 1024; // 1 MB

        const bucket = process.env.GEMINI_GCS_BUCKET;

        if (bucket && stat.size > MAX_INLINE) {
          // Use GCS for larger files
          console.log('Uploading to GCS...');
          const destName = `gemini-${Date.now()}-${path.basename(resolvedPath)}`;
          const { gcsUri, signedUrl } = await uploadToGCS(resolvedPath, bucket, destName);
          console.log(`Uploaded to GCS: ${gcsUri}`);
          fullPrompt = `${prompt}\n\nFile URL: ${signedUrl}`;
          geminiResp = await callGemini(fullPrompt, process.env.GEMINI_MODEL || 'gemini-1.5-flash');
        } else {
          // Use inline base64 for smaller files
          console.log('Embedding file as base64...');
          const mimeType = mime.lookup(resolvedPath) || 'application/octet-stream';
          const data = fs.readFileSync(resolvedPath);
          const b64 = data.toString('base64');
          const dataUri = `data:${mimeType};base64,${b64}`;
          geminiResp = await callGemini(fullPrompt, process.env.GEMINI_MODEL || 'gemini-2.5-pro');
        }
      } else {
        // Text-only prompt
        geminiResp = await callGemini(prompt, process.env.GEMINI_MODEL || 'gemini-2.5-pro');
      }

      console.log('\n--- Gemini Response ---\n');
      console.log(geminiResp);

      // Save response to AI_feedback/
      await mkdirp(path.join(process.cwd(), 'references', 'AI feedback'));
      const timestamp = Date.now();
      const sanitized = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
      const filename = `${timestamp}-gemini-${sanitized}.txt`;
      const filepath = path.join(process.cwd(), 'references', 'AI feedback', filename);

      const output = [
        `Prompt: ${prompt}`,
        filePath ? `File: ${filePath}` : '',
        `Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-pro'}`,
        `Timestamp: ${new Date().toISOString()}`,
        '---',
        geminiResp
      ].filter(line => line !== '').join('\n');

      fs.writeFileSync(filepath, output, 'utf8');
      console.log(`\nSaved to: ${filepath}`);
    } catch (error) {
      console.error('Gemini call failed:', error.message);
      throw error;
    }
  }
}

module.exports = { GeminiCommand };
