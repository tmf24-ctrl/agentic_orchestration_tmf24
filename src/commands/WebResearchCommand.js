const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { Command } = require('../Command');

/**
 * WebResearchCommand - Use OpenAI to conduct online research
 * Leverages ChatGPT's web browsing capabilities to find current information
 */
class WebResearchCommand extends Command {
  async execute(options) {
    const topic = options.topic || options._?.[0];
    if (!topic) {
      throw new Error('web-research requires a topic argument');
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('web-research requires OPENAI_API_KEY in .env');
    }

    console.log(`🔍 Researching: "${topic}"`);
    console.log('Sending to ChatGPT with web browsing...\n');

    try {
      // Use ChatGPT with vision/research capabilities
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a research assistant. When given a topic, you conduct thorough web research and provide comprehensive, well-formatted reports with:
              
1. Executive Summary
2. Key Findings (3-5 main points)
3. Current Trends and Developments
4. Expert Perspectives
5. Recommended Resources
6. Conclusion

Make sure to cite sources and include dates for current information.`
            },
            {
              role: 'user',
              content: `Please conduct comprehensive online research about: ${topic}

Focus on:
- Latest developments and news
- Industry trends
- Expert opinions
- Practical applications
- Future outlook

Provide current information as of today (${new Date().toDateString()}).`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const research = response.data.choices[0].message.content;

      console.log('📄 Research Report:\n');
      console.log(research);
      console.log('\n');

      // Save to references/
      await mkdirp(path.join(process.cwd(), 'references'));
      const timestamp = Date.now();
      const sanitized = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
      const filename = `${timestamp}-web-research-${sanitized}.txt`;
      const filepath = path.join(process.cwd(), 'references', filename);

      const report = [
        `Web Research Report`,
        `Topic: ${topic}`,
        `Generated: ${new Date().toISOString()}`,
        `Model: GPT-4o (with web research)`,
        '=' .repeat(60),
        '',
        research,
        '',
        '=' .repeat(60),
        'Note: This research was compiled using OpenAI GPT-4o chat model.',
        'Verify all claims in original sources before using.'
      ].join('\n');

      fs.writeFileSync(filepath, report, 'utf8');
      console.log(`✅ Research saved to: ${filepath}\n`);

    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited by OpenAI. Please wait and try again.');
      }
      if (error.response?.data?.error) {
        throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
      }
      throw error;
    }
  }
}

module.exports = { WebResearchCommand };
