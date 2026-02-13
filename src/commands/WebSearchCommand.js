const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { Command } = require('../Command');

class WebSearchCommand extends Command {
  async execute(options) {
    const query = options.query || options._?.[0];
    if (!query) {
      throw new Error('web-search requires a query argument');
    }

    console.log(`Searching the web for: "${query}"`);

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new Error(
        'web-search requires GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env\n' +
        'Set up a Custom Search API at: https://developers.google.com/custom-search'
      );
    }

    try {
      const endpoint = 'https://www.googleapis.com/customsearch/v1';
      const params = {
        q: query,
        key: apiKey,
        cx: searchEngineId,
        num: 10
      };

      const response = await axios.get(endpoint, { params });

      if (!response.data.items) {
        console.log('No results found.');
        return;
      }

      // Parse and format results
      const results = response.data.items.map((item, idx) => {
        return [
          `${idx + 1}. ${item.title}`,
          `   URL: ${item.link}`,
          `   ${item.snippet}`,
          ''
        ].join('\n');
      });

      const output = [
        `Web Search Results for: "${query}"`,
        `Retrieved: ${new Date().toISOString()}`,
        '---',
        ...results
      ].join('\n');

      console.log('\nResults:\n');
      console.log(output);

      // Save to references/
      await mkdirp(path.join(process.cwd(), 'references'));
      const timestamp = Date.now();
      const sanitized = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
      const filename = `${timestamp}-web-search-${sanitized}.txt`;
      const filepath = path.join(process.cwd(), 'references', filename);

      fs.writeFileSync(filepath, output, 'utf8');
      console.log(`\nSaved to: ${filepath}`);
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error(
          'Custom Search API returned 403. Verify GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID are correct.\n' +
          'See: https://developers.google.com/custom-search/docs/paid_element'
        );
      }
      throw error;
    }
  }
}

module.exports = { WebSearchCommand };
