# CLI AI Toolkit

This repository provides a small Node.js CLI to upload files and get AI analysis. It uses OpenAI by default and includes documentation for integrating with Gemini 3 (Google Generative API).

Quick start
1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
2. Install dependencies:

```bash
npm install
```

3. Upload a file and request analysis (OpenAI):

```bash
npm run cli -- upload --file ./path/to/image.png --provider openai --model gpt-4o-mini --prompt "Summarize this image"
```

Outputs
- Uploaded files are saved to `references/uploads/`.
- AI responses are written to `references/AI feedback/` with a timestamped filename.

Gemini integration
See `docs/Gemini3.md` for suggested upload and call patterns for Gemini 3. The CLI contains a `provider=gemini` placeholder that explains the recommended flow; implementing direct Gemini calls requires GCP credentials and the exact API endpoint/version you plan to use.
