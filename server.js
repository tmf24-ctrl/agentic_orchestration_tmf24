require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');

// Import commands
const { CommandRegistry } = require('./src/CommandRegistry');
const { HelloCommand } = require('./src/commands/HelloCommand');
const { WebSearchCommand } = require('./src/commands/WebSearchCommand');
const { GeminiCommand } = require('./src/commands/GeminiCommand');
const { ImageGenerateCommand } = require('./src/commands/ImageGenerateCommand');
const { TextAnalyzeCommand } = require('./src/commands/TextAnalyzeCommand');
const { WebResearchCommand } = require('./src/commands/WebResearchCommand');
const { WebsiteScreenshotCommand } = require('./src/commands/WebsiteScreenshotCommand');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Ensure directories exist
const ROOT = path.resolve(__dirname);
const REFS = path.join(ROOT, 'references');
const AIFBACK = path.join(REFS, 'AI feedback');
const IMAGES_DIR = path.join(ROOT, 'images');

mkdirp.sync(path.join(REFS, 'uploads'));
mkdirp.sync(AIFBACK);
mkdirp.sync(IMAGES_DIR);

// Initialize command registry
const registry = new CommandRegistry();

// Register commands
registry.register('hello', {
  description: 'Run a test message',
  builder: (y) => y.option('message', { type: 'string', describe: 'Message to print', default: 'Hello from CLI' })
}, new HelloCommand());

registry.register('web-search', {
  description: 'Search the web using Google Custom Search',
  builder: (y) => y.positional('query', { describe: 'Search query', type: 'string' })
}, new WebSearchCommand());

registry.register('gemini', {
  description: 'Chat with Gemini AI with optional file upload support',
  builder: (y) => y
    .positional('prompt', { describe: 'Prompt to send to Gemini', type: 'string' })
    .option('file', { describe: 'Image file to analyze', type: 'string' })
}, new GeminiCommand());

registry.register('image-generate', {
  description: 'Generate images using OpenAI DALL-E',
  builder: (y) => y
    .positional('prompt', { describe: 'Image description', type: 'string' })
    .option('size', { describe: 'Image size', type: 'string', default: '1024x1024' })
    .option('n', { describe: 'Number of images', type: 'number', default: 1 })
    .option('model', { describe: 'Model to use (dall-e-2 or dall-e-3)', type: 'string', default: 'dall-e-3' })
}, new ImageGenerateCommand());

registry.register('text-analyze', {
  description: 'Analyze text and return statistics',
  builder: (y) => y.positional('text', { describe: 'Text to analyze', type: 'string' })
}, new TextAnalyzeCommand());

registry.register('web-research', {
  description: 'Conduct online research using ChatGPT',
  builder: (y) => y
    .positional('query', { describe: 'Research topic', type: 'string' })
}, new WebResearchCommand());

registry.register('website-screenshot', {
  description: 'Screenshot a website and get design feedback',
  builder: (y) => y
    .positional('url', { describe: 'Website URL to screenshot', type: 'string' })
    .option('fullpage', { describe: 'Capture full page', type: 'boolean', default: false })
    .option('viewport', { describe: 'Viewport size (e.g., 1920x1080)', type: 'string', default: '1920x1080' })
    .option('delay', { describe: 'Delay before screenshot in ms', type: 'number', default: 1000 })
}, new WebsiteScreenshotCommand());

// API Endpoints

/**
 * GET /api/commands
 * Returns list of available commands
 */
app.get('/api/commands', (req, res) => {
  const commands = [
    {
      name: 'hello',
      description: 'Run a test message',
      example: 'hello'
    },
    {
      name: 'web-search',
      description: 'Search the web using Google Custom Search (requires GOOGLE_SEARCH_API_KEY)',
      example: 'web-search "React tutorials"'
    },
    {
      name: 'gemini',
      description: 'Chat with Gemini AI with optional file upload support',
      example: 'gemini "What is machine learning?"'
    },
    {
      name: 'image-generate',
      description: 'Generate images using OpenAI DALL-E',
      example: 'image-generate "A futuristic city"',
      options: ['--size 512x512', '--n 3', '--model dall-e-2']
    },
    {
      name: 'text-analyze',
      description: 'Analyze text and return statistics',
      example: 'text-analyze "Your text here"'
    },
    {
      name: 'web-research',
      description: 'Conduct online research using ChatGPT (requires OPENAI_API_KEY)',
      example: 'web-research "AI trends 2025"'
    },
    {
      name: 'website-screenshot',
      description: 'Screenshot a website and get design feedback',
      example: 'website-screenshot "https://example.com"',
      options: ['--fullpage', '--viewport 1920x1080', '--delay 2000']
    }
  ];
  res.json(commands);
});

/**
 * POST /api/execute
 * Execute a command with parameters
 */
app.post('/api/execute', async (req, res) => {
  try {
    const { command, args } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command required' });
    }

    // Get command instance from registry
    const commandInfo = registry.get(command);
    if (!commandInfo) {
      return res.status(404).json({ error: `Command '${command}' not found` });
    }

    const cmd = commandInfo.command;

    // Execute the command
    const result = await cmd.execute(args || {});

    res.json({
      success: true,
      command,
      result
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/files
 * List generated files (images, references)
 */
app.get('/api/files', (req, res) => {
  try {
    const images = fs.existsSync(IMAGES_DIR) 
      ? fs.readdirSync(IMAGES_DIR).map(f => ({
          name: f,
          type: 'image',
          path: `/files/images/${f}`,
          size: fs.statSync(path.join(IMAGES_DIR, f)).size
        }))
      : [];

    const references = fs.existsSync(REFS)
      ? fs.readdirSync(REFS)
          .filter(f => fs.statSync(path.join(REFS, f)).isFile())
          .map(f => ({
            name: f,
            type: 'reference',
            path: `/files/references/${f}`,
            size: fs.statSync(path.join(REFS, f)).size
          }))
      : [];

    res.json({
      images,
      references,
      total: images.length + references.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /files/images/:filename
 * Serve generated images
 */
app.get('/files/images/:filename', (req, res) => {
  try {
    const filepath = path.join(IMAGES_DIR, req.params.filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(IMAGES_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /files/references/:filename
 * Serve reference files
 */
app.get('/files/references/:filename', (req, res) => {
  try {
    const filepath = path.join(REFS, req.params.filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(REFS)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /
 * Serve main HTML
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🚀 CLI AI Toolkit Web Interface Started            ║
║                                                            ║
║   Open your browser and navigate to:                       ║
║   http://localhost:${PORT}                                    ║
║                                                            ║
║   Available Commands:                                      ║
║   • hello               - Test message                    ║
║   • web-search         - Google search (needs API keys)   ║
║   • gemini             - Chat with AI                     ║
║   • image-generate     - Create images (OpenAI)           ║
║   • text-analyze       - Text statistics                  ║
║   • web-research       - Online research (ChatGPT)        ║
║   • website-screenshot - Screenshot websites              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
