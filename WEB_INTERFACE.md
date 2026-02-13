# Web Interface for CLI AI Toolkit

A beautiful, modern web interface to access all CLI tools from your browser.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Web Server
```bash
npm run web
```

The server will start on `http://localhost:3000`

### 3. Open in Browser
```
http://localhost:3000
```

## Features

✨ **Beautiful UI**
- Modern dark theme with gradients
- Responsive design (desktop, tablet, mobile)
- Real-time status updates
- Image preview modal

🚀 **All Tools Available**
- Select commands from the search bar
- Dynamic input fields based on command
- Real-time output display
- Batch processing capable

📁 **File Management**
- View all generated images and references
- Download reference files
- Preview images with modal viewer
- Auto-refresh file list

💾 **Output Organization**
- Images saved to `/images`
- Reference files to `/references`
- AI feedback to `/references/AI feedback`
- All files timestamped for easy sorting

## Available Commands

### 1. Hello 👋
Simple test command
- **Input:** Optional message
- **Output:** Confirmation text

### 2. Web Search 🔍
Search the web (requires Google API keys)
- **Input:** Search query
- **Output:** Search results
- **Requires:** GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID

### 3. Gemini Chat 💬
AI conversations with optional image analysis
- **Input:** Prompt + optional image file
- **Output:** AI response
- **Requires:** GEMINI_API_KEY

### 4. Image Generate 🎨
Create images with DALL-E
- **Input:** Image description, size, count, model
- **Output:** Generated image files
- **Requires:** OPENAI_API_KEY

### 5. Text Analyze 📊
Analyze text statistics
- **Input:** Text to analyze
- **Output:** Word count, sentences, paragraphs, etc.
- **Requires:** None (local processing)

### 6. Web Research 🔬
Online research with ChatGPT
- **Input:** Research topic
- **Output:** Comprehensive research report
- **Requires:** OPENAI_API_KEY

### 7. Website Screenshot 📸
Capture website screenshots with AI design feedback
- **Input:** URL, viewport size, full-page, delay
- **Output:** Screenshot + design analysis
- **Requires:** GEMINI_API_KEY (for feedback)

## Configuration

### Environment Variables
Create a `.env` file with your API keys:

```env
# OpenAI (for image generation and web research)
OPENAI_API_KEY=sk-proj-...

# Google Gemini (for gemini command and website screenshots)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-pro

# Google Search (for web-search command)
GOOGLE_SEARCH_API_KEY=your-key
GOOGLE_SEARCH_ENGINE_ID=your-engine-id

# Server
PORT=3000
```

## Web Server API

### REST Endpoints

#### GET `/api/commands`
List all available commands with descriptions
```json
{
  "name": "web-research",
  "description": "Conduct online research using ChatGPT",
  "example": "web-research \"AI trends 2025\"",
  "options": []
}
```

#### POST `/api/execute`
Execute a command
```json
{
  "command": "web-research",
  "args": {
    "query": "latest AI developments"
  }
}
```

#### GET `/api/files`
List generated files
```json
{
  "images": [
    {
      "name": "1704067200000-screenshot-example.com.png",
      "type": "image",
      "path": "/files/images/1704067200000-screenshot-example.com.png",
      "size": 14380
    }
  ],
  "references": [
    {
      "name": "1704067200000-web-research-ai.txt",
      "type": "reference",
      "path": "/files/references/1704067200000-web-research-ai.txt",
      "size": 5432
    }
  ]
}
```

#### GET `/files/images/:filename`
Download image file

#### GET `/files/references/:filename`
Download reference file

## Usage Examples

### 1. Generate an Image
1. Select **Generate Image** tool
2. Enter description: "A futuristic city at night"
3. Set size: "1024x1024"
4. Click **Execute Command**
5. View result in output area
6. Find generated image in **Images** tab

### 2. Research a Topic
1. Select **Web Research** tool
2. Enter topic: "Machine learning trends 2025"
3. Click **Execute Command**
4. Read report in output area
5. Download report from **References** tab

### 3. Screenshot a Website
1. Select **Screenshot** tool
2. Enter URL: "https://github.com"
3. Choose full page: Yes
4. Click **Execute Command**
5. View screenshot in **Images** tab
6. Read design feedback in output area

### 4. Analyze Text
1. Select **Analyze Text** tool
2. Paste your text
3. Click **Execute Command**
4. View statistics in output area

## Interface Guide

### Left Panel: Command Selection
- Click any command button to select it
- Active command is highlighted in blue
- Hover for tooltip descriptions

### Middle Panel: Input Fields
- Fields update based on selected command
- Required fields marked with *
- Default values pre-populated
- Textarea for longer inputs

### Execute Button
- Disabled while processing
- Shows status: loading → success/error
- Results displayed below

### Right Panel: Files
- Two tabs: **Images** and **References**
- Grid view for images with preview
- List view for reference files
- Click to preview or download
- Real-time updates every 5 seconds

## Features in Detail

### Real-Time Updates
Files are automatically refreshed every 5 seconds, so new outputs appear without page refresh.

### Image Preview Modal
Click any image to view full-size in a modal. Close with the X button or click outside.

### Responsive Design
- **Desktop:** Full-width layout with all panels visible
- **Tablet:** Stacked panels with large touch targets
- **Mobile:** Single column layout, optimized for touch

### Error Handling
- Clear error messages with suggestions
- Status updates for long-running operations
- Automatic timeout after 5 seconds for status messages

### File Organization
All outputs are automatically organized:
```
cli-ai-toolkit/
├── images/                    # Image outputs
│   └── timestamp-*.png
├── references/                # Text outputs
│   ├── timestamp-*.txt
│   └── AI feedback/            # Image metadata
│       └── timestamp-*.txt
```

## Troubleshooting

### "API key not found"
- Add your API keys to `.env` file
- Restart the server with `npm run web`

### "Command failed"
- Check error message in status area
- Verify API keys are valid
- Check internet connection

### "Port 3000 already in use"
- Close other applications using port 3000
- Or specify a different port: `PORT=3001 npm run web`

### Images not loading
- Check browser console (F12) for errors
- Verify image files exist in `/images`
- Try clearing browser cache

### No files appearing
- Check if commands executed successfully
- Verify `/images` and `/references` directories exist
- Refresh the page manually

## Performance Tips

1. **Batch Operations:** Run multiple commands in sequence for better results
2. **Clear Old Files:** Manually delete old files from `/images` and `/references` to manage disk space
3. **Viewport Optimization:** Use smaller viewports for faster screenshots
4. **Delay Settings:** Use minimal delay for fast websites, increase for animated sites

## Architecture

### Backend (Server.js)
- Express.js HTTP server
- Command registry pattern
- File serving with security checks
- CORS-enabled for future frontend expansion

### Frontend (Public folder)
- Modern CSS with CSS variables for theming
- Vanilla JavaScript (no frameworks)
- Responsive grid layouts
- Real-time file list updates

### File Organization
- Timestamped output for automatic sorting
- Organized by type (images, references)
- Easy retrieval and backup

## Server Statistics

- **Commands available:** 7
- **API endpoints:** 5
- **Response time:** < 100ms (local) + command execution time
- **File serving:** Secure with path traversal prevention
- **Concurrent connections:** Unlimited (Express default)

## Future Enhancements

Potential improvements:
- Command scheduling and batch processing
- Real-time command progress (websockets)
- Custom command creation UI
- Cloud storage integration
- Advanced search/filtering for files
- Command history and replay
- User authentication
- API rate limiting

## Support

For issues or questions:
1. Check the `.env` configuration
2. Review server logs in terminal
3. Test commands via CLI first
4. Verify API keys are valid

---

**Status:** ✅ Production ready  
**Version:** 1.0.0  
**Last Updated:** February 12, 2026
