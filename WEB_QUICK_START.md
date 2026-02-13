# 🚀 Web Interface - Quick Start

## Start the Server

```bash
npm run web
```

Open your browser and go to: **http://localhost:3000**

---

## 5-Minute Tutorial

### 1️⃣ Select a Tool
Click any command button at the top:
- 👋 **Hello** - Test message
- 🔍 **Web Search** - Search the web
- 💬 **Gemini** - Chat with AI
- 🎨 **Generate Image** - Create images
- 📊 **Analyze Text** - Text statistics
- 🔬 **Web Research** - Online research
- 📸 **Screenshot** - Website screenshots

### 2️⃣ Fill in the Form
- Required fields marked with `*`
- Use placeholders as examples
- Default values pre-filled

### 3️⃣ Click "Execute Command"
- Status shows: Loading... → Success ✓ or Error ✕
- Output displayed below
- Files automatically saved

### 4️⃣ View Results
- 📁 **Images tab** - Preview generated images
- 📄 **References tab** - Download text files
- Files refresh automatically every 5 seconds

---

## Common Tasks

### Generate an Image
```
1. Select "Generate Image"
2. Enter: "A beautiful mountain landscape at sunrise"
3. Size: 1024x1024
4. Click Execute
5. View in Images tab
```

### Research a Topic
```
1. Select "Web Research"
2. Enter: "Python web frameworks comparison 2025"
3. Click Execute
4. Read report in output
5. Download from References tab
```

### Screenshot a Website
```
1. Select "Screenshot"
2. URL: https://github.com
3. Check "Full Page"
4. Click Execute
5. View screenshot + AI design feedback
```

### Analyze Text
```
1. Select "Analyze Text"
2. Paste your text
3. Click Execute
4. See word count, reading time, etc.
```

---

## Tips & Tricks

✨ **Preview Images:** Click any image to see full-size  
💾 **Download Files:** Click download button on references  
🔄 **Auto-Refresh:** Files update every 5 seconds  
📱 **Mobile Ready:** Works on phones and tablets  
⌨️ **Try Examples:** Use placeholder text as reference  

---

## Keyboard Shortcuts

- `Enter` in field → Execute command
- Click image → Full-size preview
- Click reference → Download

---

## Environment Setup

Your API keys are read from `.env`:

```env
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
GOOGLE_SEARCH_API_KEY=...
```

**No restart needed** after updating `.env` for most commands.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `PORT=3001 npm run web` |
| Commands failing | Check .env has API keys |
| Images not loading | Refresh browser (Ctrl+F5) |
| No output shown | Check status message for errors |
| Files not appearing | Wait 5 seconds for auto-refresh |

---

## File Locations

Generated files automatically saved:

```
outputs/
├── images/                    # Generated images
│   └── *.png
├── references/                # Text files
│   ├── *.txt
│   └── AI feedback/            # Image analysis
│       └── *.txt
```

View and download directly from web interface!

---

## Next Steps

1. ✅ Start server: `npm run web`
2. ✅ Open: http://localhost:3000
3. ✅ Try a command
4. ✅ Explore the files

That's it! 🎉 Enjoy your AI toolkit.

---

**Need more details?** See [WEB_INTERFACE.md](WEB_INTERFACE.md) for full documentation.
