# CLI Architecture & Design

## Overview

This CLI toolkit implements a **command registry pattern** with organized output management for AI orchestration tasks. The design emphasizes extensibility, maintainability, and organized workflow automation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   npm run dev -- <cmd>                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  yargs CLI Parser  │
         └─────────┬──────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ CommandRegistry    │ ◄──── Resolve command name
         │  .execute(name)    │
         └─────────┬──────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │   Command Instance          │
    │   .execute(options)         │
    └──────────┬────────────────┬─┘
               │                │
        ┌──────▼─────┐    ┌─────▼────────┐
        │ API Calls  │    │ File I/O     │
        │ (Gemini,   │    │ (read, save) │
        │  OpenAI)   │    │              │
        └─────┬──────┘    └──────┬───────┘
              │                  │
              └──────────┬───────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Organized Output    │
              │  references/         │
              │  images/             │
              │  (+ timestamps)      │
              └──────────────────────┘
```

---

## Core Components

### 1. Command Base Class

**File:** `src/Command.js`

```javascript
class Command {
  async execute(options) {
    throw new Error('execute() must be implemented by subclass');
  }
}
```

**Purpose:** 
- Define interface for all CLI commands
- Ensure consistent `execute(options)` signature
- Enable polymorphic command handling

**Usage Pattern:**
```javascript
class MyCommand extends Command {
  async execute(options) {
    // options.prompt - positional argument
    // options.file - option flag
    // options._ - array of positional arguments
  }
}
```

---

### 2. Command Registry

**File:** `src/CommandRegistry.js`

```javascript
class CommandRegistry {
  register(name, config, command) { ... }
  async execute(name, options) { ... }
}
```

**Features:**
- Register commands with metadata
- Build yargs configuration
- Execute commands by name
- Centralized command management

**Config Structure:**
```javascript
{
  description: "Command description",
  builder: (yargs) => yargs.option('...')
}
```

---

### 3. CLI Entry Point

**File:** `src/index.js`

**Responsibilities:**
- Initialize command registry
- Register all commands
- Configure yargs for argument parsing
- Execute selected command
- Handle errors

**Flow:**
```
1. Require all command classes
2. Create registry
3. Register each command with config
4. Parse args with yargs
5. Extract command name from argv._[0]
6. Call registry.execute(commandName, argv)
```

---

## Command Anatomy

### Structure

```
src/commands/
├── HelloCommand.js
├── WebSearchCommand.js
├── GeminiCommand.js
├── ImageGenerateCommand.js
└── TextAnalyzeCommand.js
```

### Template

```javascript
const { Command } = require('../Command');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

class MyCommand extends Command {
  async execute(options) {
    const input = options.input || options._?.[0];
    
    if (!input) {
      throw new Error('my-command requires input');
    }

    try {
      // Core logic
      const result = await this.process(input);
      
      console.log('Result:', result);
      
      // Save output to references/
      await mkdirp(path.join(process.cwd(), 'references'));
      const timestamp = Date.now();
      const filename = `${timestamp}-my-command-output.txt`;
      const filepath = path.join(process.cwd(), 'references', filename);
      
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`Saved to: ${filepath}`);
    } catch (error) {
      console.error('Command failed:', error.message);
      throw error;
    }
  }

  async process(input) {
    // Implementation
  }
}

module.exports = { MyCommand };
```

---

## Adding a New Command

### Step 1: Create Command Class

Create `src/commands/MyCommand.js`:

```javascript
const { Command } = require('../Command');

class MyCommand extends Command {
  async execute(options) {
    console.log(`Executing MyCommand with:`, options);
    // Implementation here
  }
}

module.exports = { MyCommand };
```

### Step 2: Register in Registry

Edit `src/index.js`:

```javascript
// 1. Import the command
const { MyCommand } = require('./commands/MyCommand');

// 2. Register in registry (within main() function)
registry.register('my-command', {
  description: 'Description of what command does',
  builder: (y) =>
    y.positional('input', {
      describe: 'Input description',
      type: 'string'
    })
      .option('flag', {
        type: 'string',
        describe: 'Optional flag'
      })
}, new MyCommand());

// 3. Add yargs command configuration
.command('my-command <input>', 'Description', (y) =>
  y.positional('input', { type: 'string' })
    .option('flag', { type: 'string' })
)
```

### Step 3: Use Command

```bash
npm run dev -- my-command input-value --flag value
```

---

## Input/Options Patterns

### Positional Arguments

**Definition:**
```javascript
.command('my-cmd <name>', 'Description', (y) =>
  y.positional('name', { type: 'string' })
)
```

**Access in command:**
```javascript
const name = options.name;  // Recommended
const nameAlt = options._?.[0];  // Alternative
```

### Optional Flags

**Definition:**
```javascript
.option('file', {
  type: 'string',
  describe: 'File path'
})
```

**Access in command:**
```javascript
const file = options.file;
```

### First Positional Fallback

```javascript
const prompt = options.prompt || options._?.[0];
```

---

## Output Organization Strategy

### Directory Structure

```
references/                    # AI responses & analysis
├── custom/                    # Custom command outputs
│   └── hello.txt
├── uploads/                   # Uploaded files
│   └── <timestamp>-*.txt
└── AI feedback/               # AI model responses
    └── <timestamp>-*.txt

images/                        # Generated images
├── <timestamp>-*.png
└── <timestamp>-*.jpg
```

### Filename Pattern

```
<timestamp>-<command>-<sanitized-input>.txt
```

Where:
- `<timestamp>` = `Date.now()` - milliseconds since epoch
- `<command>` = command name (web-search, gemini, etc.)
- `<sanitized-input>` = input sanitized for filesystem
  - Lowercase
  - Replace non-alphanumeric with `-`
  - Trim to 50 chars

### Sanitization Example

```javascript
const sanitize = (s) => 
  s.toLowerCase()
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-|-$/g, '')
   .slice(0, 50);

sanitize('What is AI?') // → 'what-is-ai'
```

---

## Error Handling Patterns

### API Key Missing

```javascript
const key = process.env.API_KEY;
if (!key) {
  throw new Error(
    'Command requires API_KEY environment variable.\n' +
    'See docs/setup.md for configuration instructions.'
  );
}
```

### File Not Found

```javascript
if (!fs.existsSync(filePath)) {
  throw new Error(`File not found: ${path.resolve(filePath)}`);
}
```

### API Errors with Details

```javascript
try {
  const res = await axios.post(endpoint, payload);
} catch (error) {
  if (error.response?.status === 404) {
    throw new Error(`Resource not found: ${error.response.data}`);
  }
  if (error.response?.data?.error?.message) {
    throw new Error(`API error: ${error.response.data.error.message}`);
  }
  throw error;
}
```

---

## Integration with External APIs

### Environment Variables

```bash
# .env file
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
GOOGLE_SEARCH_API_KEY=...
```

### Lazy Loading

```javascript
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('Key not configured');

// Use key to make API call
```

---

## Testing Commands

### Manual Testing

```bash
# Test command execution
npm run dev -- my-command test-input

# Test with options
npm run dev -- my-command "input" --option value

# Verify output saved
ls -la references/
```

### Debugging

```javascript
// Add to command
console.log('[DEBUG] Options:', options);
console.log('[DEBUG] Input:', input);

// Run with debug output
npm run dev -- my-command input 2>&1 | grep DEBUG
```

---

## Performance Considerations

### Async/Await Usage

- All commands use async execute() for compatibility
- External API calls are awaited
- File I/O uses sync methods where appropriate

### Output Caching

- Each execution saves timestamped output
- No deduplication (by design for audit trail)
- Cleanup via manual deletion or archive scripts

---

## Extension Points

### Add New Command
See "Adding a New Command" section above.

### Add New Output Destination
Modify output path in command's `execute()` method.

### Add Middleware/Hooks
Could extend registry with `beforeExecute()`, `afterExecute()` hooks.

### Add Configuration System
Could create `config.js` for centralized settings.

---

## Best Practices

1. **Always validate input** before using
2. **Save outputs with timestamps** for tracking
3. **Use mkdirp** for safe directory creation
4. **Provide helpful error messages** with next steps
5. **Log progress** while executing long operations
6. **Sanitize filenames** from user input
7. **Document** command options and examples
8. **Test offline** (text-analyze works without APIs)
9. **Handle rate limits** gracefully with retries
10. **Clean up** old outputs periodically

---

## Debugging Commands

### Enable Verbose Mode

Add to command execution:
```javascript
if (process.env.DEBUG) {
  console.log('[DEBUG]', ...);
}
```

Usage:
```bash
DEBUG=1 npm run dev -- command-name
```

### Check Environment

```bash
node -e "require('dotenv').config(); console.log(process.env)"
```

### Test API Connectivity

```bash
# Test OpenAI
npm run dev -- image-generate "test"

# Test Gemini
npm run dev -- gemini "test"
```

---

## Scalability Notes

- **Current capacity:** Handles 100+ commands in registry
- **Response time:** API calls dominate (network limited)
- **File system:** Organized by timestamp for easy scaling
- **Memory:** Minimal; streams large files where possible

---

## Future Architecture Enhancements

```
Potential v2.0 Design:
├── Plugin System
│   ├── Load commands dynamically from plugins/
│   └── Plugin manifest with metadata
├── Middleware Stack
│   ├── Auth middleware
│   ├── Logging middleware
│   └── Error handling middleware
├── Configuration Management
│   ├── Centralized config.json
│   ├── Env override support
│   └── Validation schema
└── Output Formats
    ├── JSON output mode
    ├── CSV export
    └── HTML report generation
```
