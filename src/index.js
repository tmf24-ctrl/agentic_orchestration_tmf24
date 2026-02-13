require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const mkdirp = require('mkdirp');

const { CommandRegistry } = require('./CommandRegistry');
const { HelloCommand } = require('./commands/HelloCommand');
const { WebSearchCommand } = require('./commands/WebSearchCommand');
const { GeminiCommand } = require('./commands/GeminiCommand');
const { ImageGenerateCommand } = require('./commands/ImageGenerateCommand');
const { TextAnalyzeCommand } = require('./commands/TextAnalyzeCommand');
const { WebResearchCommand } = require('./commands/WebResearchCommand');
const { WebsiteScreenshotCommand } = require('./commands/WebsiteScreenshotCommand');

const ROOT = path.resolve(__dirname, '..');
const REFS = path.join(ROOT, 'references');
const AIFBACK = path.join(REFS, 'AI feedback');
const IMAGES_DIR = path.join(ROOT, 'images');

// Ensure directories exist
mkdirp.sync(path.join(REFS, 'uploads'));
mkdirp.sync(AIFBACK);
mkdirp.sync(IMAGES_DIR);

async function main() {
  const registry = new CommandRegistry();

  // Register commands
  registry.register('hello', {
    description: 'Run a test message',
    builder: (y) =>
      y.option('message', {
        type: 'string',
        describe: 'Message to print',
        default: 'Hello from CLI'
      })
  }, new HelloCommand());

  registry.register('web-search', {
    description: 'Search the web using Google Custom Search',
    builder: (y) =>
      y.positional('query', {
        describe: 'Search query',
        type: 'string'
      })
  }, new WebSearchCommand());

  registry.register('gemini', {
    description: 'Send a prompt to Gemini with optional file attachment',
    builder: (y) =>
      y.positional('prompt', {
        describe: 'Prompt text',
        type: 'string'
      })
        .option('file', {
          type: 'string',
          describe: 'Optional file path (image, text, etc.)'
        })
        .option('model', {
          type: 'string',
          default: 'gemini-3',
          describe: 'Gemini model to use'
        })
  }, new GeminiCommand());

  registry.register('image-generate', {
    description: 'Generate an image using OpenAI',
    builder: (y) =>
      y.positional('prompt', {
        describe: 'Image description prompt',
        type: 'string'
      })
        .option('size', {
          type: 'string',
          default: '1024x1024',
          describe: 'Image size: 256x256|512x512|1024x1024'
        })
        .option('n', {
          type: 'number',
          default: 1,
          describe: 'Number of images to generate'
        })
        .option('model', {
          type: 'string',
          default: 'dall-e-3',
          describe: 'Image model to use'
        })
  }, new ImageGenerateCommand());

  registry.register('text-analyze', {
    description: 'Analyze a text file and generate statistics',
    builder: (y) =>
      y.positional('file', {
        describe: 'Path to text file to analyze',
        type: 'string'
      })
  }, new TextAnalyzeCommand());

  registry.register('web-research', {
    description: 'Research a topic online using OpenAI with web access',
    builder: (y) =>
      y.positional('topic', {
        describe: 'Topic to research',
        type: 'string'
      })
  }, new WebResearchCommand());

  registry.register('website-screenshot', {
    description: 'Capture website screenshot and get Gemini design feedback',
    builder: (y) =>
      y.positional('url', {
        describe: 'Website URL to screenshot',
        type: 'string'
      })
        .option('fullpage', {
          type: 'boolean',
          default: false,
          alias: 'full-page',
          describe: 'Capture full page (default: viewport only)'
        })
        .option('viewport', {
          type: 'string',
          default: '1920x1080',
          describe: 'Viewport size (e.g., 1920x1080)'
        })
        .option('delay', {
          type: 'number',
          default: 0,
          describe: 'Wait time in ms before capturing (for animations)'
        })
  }, new WebsiteScreenshotCommand());

  // Parse argv using yargs
  let argv = yargs(hideBin(process.argv))
    .usage('Usage: npm run dev -- <command> [args]')
    .command('hello [message]', 'Run a test message', (y) =>
      y.option('message', {
        type: 'string',
        describe: 'Message to print'
      })
    )
    .command('web-search <query>', 'Search the web', (y) =>
      y.positional('query', { type: 'string' })
    )
    .command('gemini <prompt>', 'Send prompt to Gemini', (y) =>
      y.positional('prompt', { type: 'string' })
        .option('file', { type: 'string', describe: 'Optional file' })
        .option('model', { type: 'string', default: 'gemini-3' })
    )
    .command('image-generate <prompt>', 'Generate an image', (y) =>
      y.positional('prompt', { type: 'string' })
        .option('size', { type: 'string', default: '1024x1024' })
        .option('n', { type: 'number', default: 1 })
        .option('model', { type: 'string', default: 'dall-e-3' })
    )
    .command('text-analyze <file>', 'Analyze text file statistics', (y) =>
      y.positional('file', { type: 'string' })
    )
    .command('web-research <topic>', 'Research a topic online', (y) =>
      y.positional('topic', { type: 'string' })
    )
    .command('website-screenshot <url>', 'Screenshot website and get design feedback', (y) =>
      y.positional('url', { type: 'string' })
        .option('fullpage', { type: 'boolean', default: false })
        .option('viewport', { type: 'string', default: '1920x1080' })
        .option('delay', { type: 'number', default: 0 })
    )
    .demandCommand(1, 'You must provide a command')
    .help()
    .strict()
    .argv;

  const commandName = argv._[0];

  try {
    await registry.execute(commandName, argv);
  } catch (error) {
    console.error(`Error executing '${commandName}':`, error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
