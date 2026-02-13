const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { Command } = require('../Command');
const { generateImage } = require('../openai_image');

class ImageGenerateCommand extends Command {
  async execute(options) {
    const prompt = options.prompt || options._?.[0];
    if (!prompt) {
      throw new Error('image-generate requires a prompt argument');
    }

    const size = options.size || '1024x1024';
    const n = options.n || 1;
    const model = options.model || 'dall-e-3';

    console.log(`Generating ${n} image(s) with prompt: "${prompt}"`);
    console.log(`Size: ${size}, Model: ${model}`);

    try {
      const results = await generateImage(prompt, { model, size, n });

      const sanitize = s =>
        s.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 50);

      const base = sanitize(prompt);
      const ts = Date.now();

      const saved = [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        let filename;

        if (r.b64) {
          const buf = Buffer.from(r.b64, 'base64');
          filename = `${ts}-${base}-${i + 1}.png`;
          const outPath = path.join(process.cwd(), 'images', filename);
          await mkdirp(path.dirname(outPath));
          fs.writeFileSync(outPath, buf);
          saved.push(outPath);
          console.log(`Saved: ${outPath}`);
        } else if (r.url) {
          // Save remote URL into a text file
          filename = `${ts}-${base}-${i + 1}.url.txt`;
          const outPath = path.join(process.cwd(), 'images', filename);
          await mkdirp(path.dirname(outPath));
          fs.writeFileSync(outPath, r.url, 'utf8');
          saved.push(outPath);
          console.log(`Saved URL reference: ${outPath}`);
        } else {
          // Save raw response
          filename = `${ts}-${base}-${i + 1}.json`;
          const outPath = path.join(process.cwd(), 'images', filename);
          await mkdirp(path.dirname(outPath));
          fs.writeFileSync(outPath, JSON.stringify(r.raw || r, null, 2), 'utf8');
          saved.push(outPath);
          console.log(`Saved response: ${outPath}`);
        }
      }

      // Save metadata linking prompt -> images
      const metaPath = path.join(process.cwd(), 'references', 'AI feedback', `${ts}-${base}-images.txt`);
      await mkdirp(path.dirname(metaPath));
      const meta = [
        `Prompt: ${prompt}`,
        `Model: ${model}`,
        `Size: ${size}`,
        `Images Generated: ${n}`,
        `Timestamp: ${new Date().toISOString()}`,
        '',
        'Files:',
        ...saved
      ];
      fs.writeFileSync(metaPath, meta.join('\n'), 'utf8');

      console.log(`\nSaved ${saved.length} image(s) to images/`);
      console.log(`Metadata saved to: ${metaPath}`);
    } catch (error) {
      console.error('Image generation failed:', error.message);
      throw error;
    }
  }
}

module.exports = { ImageGenerateCommand };
