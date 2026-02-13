# Quick Start Reference

## Installation

```bash
npm install
```

## Commands

### Hello (Test Command)
```bash
npm run dev -- hello --message "Your message"
```
**Output:** `references/custom/hello.txt`

### Text Analyze (Capstone - No API needed!)
```bash
npm run dev -- text-analyze README.md
```
**Output:** `references/<timestamp>-text-analysis-readme.txt`
**Features:** Word count, statistics, readability score, reading time

### Gemini (with .env credentials)
```bash
npm run dev -- gemini "What is AI?"
npm run dev -- gemini "Describe this" --file ./image.jpg
```
**Output:** `references/AI feedback/<timestamp>-gemini-*.txt`
**Requires:** `GEMINI_API_KEY`

### Image Generate (with .env credentials)
```bash
npm run dev -- image-generate "A scenic mountain" --model dall-e-2
```
**Output:** `images/<timestamp>-*.png`
**Requires:** `OPENAI_API_KEY`

### Web Search (with .env credentials)
```bash
npm run dev -- web-search "latest AI trends"
```
**Output:** `references/<timestamp>-web-search-*.txt`
**Requires:** `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`

## Configuration (.env)

```
OPENAI_API_KEY=your-key
GEMINI_API_KEY=your-key
GOOGLE_SEARCH_API_KEY=your-key
GOOGLE_SEARCH_ENGINE_ID=your-id
GEMINI_MODEL=gemini-1.5-pro
```

## Output Locations

| Command | Output Path |
|---------|-------------|
| hello | `references/custom/hello.txt` |
| text-analyze | `references/<timestamp>-text-analysis-*.txt` |
| gemini | `references/AI feedback/<timestamp>-gemini-*.txt` |
| image-generate | `images/<timestamp>-*.png` |
| web-search | `references/<timestamp>-web-search-*.txt` |

## File Structure

```
cli-ai-toolkit/
├── src/
│   ├── Command.js              (Base class)
│   ├── CommandRegistry.js       (Registry)
│   ├── index.js                (Entry point)
│   ├── gemini.js               (Gemini API)
│   ├── openai_image.js         (Image generation)
│   ├── gcs.js                  (Google Cloud Storage)
│   └── commands/
│       ├── HelloCommand.js
│       ├── TextAnalyzeCommand.js (✅ Capstone)
│       ├── GeminiCommand.js
│       ├── ImageGenerateCommand.js
│       └── WebSearchCommand.js
├── references/                 (Text outputs)
├── images/                     (Generated images)
├── USAGE.md                    (Complete guide)
├── ARCHITECTURE.md             (System design)
├── BUILD_LOG.md                (What was built)
└── QUICK_START.md              (This file)
```

## Verify Installation

```bash
# Test hello command (no API needed)
npm run dev -- hello --message "test"

# Test text analysis (no API needed)
npm run dev -- text-analyze README.md

# Check output
ls -la references/
ls -la images/
```

## Troubleshooting

**"Cannot find module"** 
- Run `npm install`

**"API key not found"**
- Add to `.env` file
- Check environment loaded: `node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? 'loaded' : 'missing')"`

**"File not found"**
- Use absolute path or path relative to current directory

**"404 from Gemini API"**
- Verify GEMINI_API_KEY is valid
- Check model name (gemini-1.5-pro is default)

## Documentation

- **Usage:** See [USAGE.md](USAGE.md)
- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Build Log:** See [BUILD_LOG.md](BUILD_LOG.md)

## What's Working ✅

- [x] Command registry pattern with 5 commands
- [x] Hello command - verified
- [x] Text-analyze capstone - verified ✅
- [x] Output organization with timestamps
- [x] Error handling with API key checks
- [x] npm dev script

## What Needs Credentials ⚠️

- [ ] Gemini (API key may need model enabling)
- [ ] Image Generate (API account needs active billing)
- [ ] Web Search (needs Google Custom Search setup)

## Next Steps

1. **Get API Keys:**
   - OpenAI: https://platform.openai.com/api-keys
   - Gemini: https://ai.google.dev/tutorials/setup
   - Google Search: https://cse.google.com

2. **Update .env with credentials**

3. **Run commands:**
   ```bash
   npm run dev -- gemini "Your prompt"
   npm run dev -- image-generate "Your image"
   npm run dev -- web-search "Your query"
   ```

4. **Check outputs:**
   ```bash
   ls -la references/
   ls -la images/
   ```

## Adding Your Own Command

1. Create `src/commands/MyCommand.js`
2. Extend `Command` class
3. Register in `src/index.js`
4. Test: `npm run dev -- my-command`

See [ARCHITECTURE.md](ARCHITECTURE.md) for full instructions.
