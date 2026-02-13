const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { Command } = require('../Command');

/**
 * WebsiteScreenshotCommand - Capture website screenshots and get Gemini design feedback
 * Uses Playwright to automate browser screenshots and AI to analyze design
 */
class WebsiteScreenshotCommand extends Command {
  async execute(options) {
    const url = options.url || options._?.[0];
    if (!url) {
      throw new Error('website-screenshot requires a URL argument');
    }

    const getFullPage = options.fullpage || options['full-page'] || false;
    const viewport = options.viewport || '1920x1080';
    const delay = options.delay || 0;

    console.log(`📸 Taking screenshot of: ${url}`);
    console.log(`Viewport: ${viewport}, Full page: ${getFullPage}, Delay: ${delay}ms`);

    try {
      // Import Playwright
      const playwright = require('playwright');
      const browser = await playwright.chromium.launch({ headless: true });
      const page = await browser.newPage();

      // Set viewport
      const [width, height] = viewport.split('x').map(Number);
      await page.setViewportSize({ width, height });

      // Navigate to URL with extended timeout for heavy sites
      console.log(`Loading page...`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      } catch (navError) {
        // If domcontentloaded times out, try with load event
        console.log('Trying fallback load strategy...');
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        } catch (loadError) {
          // If both fail, proceed anyway - page may have loaded partially
          console.log('Page load timed out, proceeding with partial page...');
        }
      }

      // Wait if delay specified (for animations to complete)
      if (delay > 0) {
        console.log(`Waiting ${delay}ms for animations...`);
        await page.waitForTimeout(delay);
      }

      // Get page title
      const pageTitle = await page.title();
      const metaDescription = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]');
        return meta ? meta.getAttribute('content') : 'No description';
      });

      // Get page dimensions
      const pageSize = getFullPage
        ? await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight
          }))
        : { width, height };

      // Take screenshot
      console.log(`Capturing screenshot (${pageSize.width}x${pageSize.height})...`);
      const screenshotBuffer = await page.screenshot({
        fullPage: getFullPage,
        type: 'png'
      });

      // Extract domain for filename
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const timestamp = Date.now();
      const screenshotFilename = `${timestamp}-screenshot-${domain}.png`;
      const screenshotPath = path.join(process.cwd(), 'images', screenshotFilename);

      await mkdirp(path.dirname(screenshotPath));
      fs.writeFileSync(screenshotPath, screenshotBuffer);
      console.log(`✅ Screenshot saved: ${screenshotPath}`);

      // Close browser
      await browser.close();

      // Get Gemini feedback if API key available
      let feedback = '';
      const geminiKey = process.env.GEMINI_API_KEY;

      if (geminiKey) {
        console.log(`\n🤖 Sending screenshot to Gemini for design feedback...`);
        feedback = await this.getDesignFeedback(screenshotBuffer, pageTitle, geminiKey);
      } else {
        feedback = 'Gemini API key not configured. Skipping design feedback.\nTo enable: add GEMINI_API_KEY to .env';
      }

      // Save metadata and feedback
      await mkdirp(path.join(process.cwd(), 'references'));
      const metadataFilename = `${timestamp}-screenshot-${domain}-metadata.txt`;
      const metadataPath = path.join(process.cwd(), 'references', metadataFilename);

      const metadata = [
        `Website Screenshot Analysis`,
        `URL: ${url}`,
        `Title: ${pageTitle}`,
        `Description: ${metaDescription}`,
        `Captured: ${new Date().toISOString()}`,
        `Viewport: ${viewport}`,
        `Full Page: ${getFullPage}`,
        `Screenshot Size: ${pageSize.width}x${pageSize.height}px`,
        `Screenshot File: ${screenshotPath}`,
        '=' .repeat(70),
        '',
        'DESIGN FEEDBACK FROM GEMINI:',
        '',
        feedback,
        '',
        '=' .repeat(70),
      ].join('\n');

      fs.writeFileSync(metadataPath, metadata, 'utf8');
      console.log(`✅ Metadata saved: ${metadataPath}\n`);

      return {
        screenshotPath,
        metadataPath,
        pageTitle,
        url
      };

    } catch (error) {
      if (error.message.includes('net::ERR_')) {
        throw new Error(`Failed to load URL: ${url}. Check the URL is correct and accessible.`);
      }
      throw error;
    }
  }

  async getDesignFeedback(screenshotBuffer, pageTitle, geminiKey) {
    try {
      const axios = require('axios');
      const b64Image = screenshotBuffer.toString('base64');

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
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
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: b64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000
          }
        }
      );

      // Check for error response
      if (response.data?.error) {
        return `Gemini Error: ${response.data.error.message}`;
      }

      // Extract feedback - primary path
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = response.data.candidates[0].content.parts[0].text;
        return text;
      }

      // If no text in parts, return error message
      return 'Could not extract feedback from Gemini response (no text found).';

    } catch (error) {
      if (error.response?.status === 429) {
        return '⚠️ Rate limited by Gemini API. Try again in a moment.';
      }
      if (error.response?.data?.error) {
        return `Gemini Error: ${error.response.data.error.message}`;
      }
      return `Error getting design feedback: ${error.message}`;
    }
  }
}

module.exports = { WebsiteScreenshotCommand };
