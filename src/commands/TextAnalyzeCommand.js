const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { Command } = require('../Command');

/**
 * TextAnalyzeCommand - Analyze text files and generate statistics.
 * Capstone: Demonstrates command creation and output saving.
 */
class TextAnalyzeCommand extends Command {
  async execute(options) {
    const filePath = options.file || options._?.[0];
    if (!filePath) {
      throw new Error('text-analyze requires a file path argument');
    }

    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    console.log(`Analyzing: ${resolvedPath}`);

    const text = fs.readFileSync(resolvedPath, 'utf8');
    const analysis = this.analyzeText(text);

    // Display results
    console.log('\n=== Text Analysis Results ===\n');
    console.log(`File: ${path.basename(resolvedPath)}`);
    console.log(`Size: ${analysis.bytes} bytes`);
    console.log(`Characters: ${analysis.chars}`);
    console.log(`Words: ${analysis.words}`);
    console.log(`Lines: ${analysis.lines}`);
    console.log(`Paragraphs: ${analysis.paragraphs}`);
    console.log(`Average word length: ${analysis.avgWordLength.toFixed(2)} chars`);
    console.log(`Reading time estimate: ${analysis.readingTime} minutes`);
    console.log(`Most common words:`, analysis.topWords.slice(0, 5).join(', '));

    // Save analysis to references/
    await mkdirp(path.join(process.cwd(), 'references'));
    const timestamp = Date.now();
    const sanitized = path.basename(resolvedPath, path.extname(resolvedPath))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);
    const filename = `${timestamp}-text-analysis-${sanitized}.txt`;
    const outputPath = path.join(process.cwd(), 'references', filename);

    const report = [
      `Text Analysis Report`,
      `Generated: ${new Date().toISOString()}`,
      `Source: ${path.basename(resolvedPath)}`,
      '---',
      '',
      'STATISTICS:',
      `  Size: ${analysis.bytes} bytes`,
      `  Characters: ${analysis.chars}`,
      `  Words: ${analysis.words}`,
      `  Lines: ${analysis.lines}`,
      `  Paragraphs: ${analysis.paragraphs}`,
      `  Average word length: ${analysis.avgWordLength.toFixed(2)} characters`,
      `  Reading time: ~${analysis.readingTime} minutes`,
      '',
      'MOST COMMON WORDS:',
      ...analysis.topWords.slice(0, 20).map((w, i) => `  ${i + 1}. ${w}`),
      '',
      'READABILITY:',
      `  Flesch Reading Ease Score (estimated): ${analysis.readabilityScore}`,
      analysis.readibilityLevel ? `  Level: ${analysis.readibilityLevel}` : '',
      ''
    ].filter(line => line !== '').join('\n');

    fs.writeFileSync(outputPath, report, 'utf8');
    console.log(`\nAnalysis saved to: ${outputPath}`);

    return analysis;
  }

  analyzeText(text) {
    const bytes = Buffer.byteLength(text, 'utf8');
    const chars = text.length;
    const words = text.match(/\b\w+\b/g) || [];
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;

    const avgWordLength = words.length > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / words.length
      : 0;

    // Estimate reading time (average 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(words.length / 200));

    // Calculate word frequency
    const wordFreq = {};
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (lower.length > 2) { // Ignore small words
        wordFreq[lower] = (wordFreq[lower] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    // Estimate Flesch Reading Ease (simplified)
    // Higher = easier to read
    const syllables = this.estimateSyllables(text);
    const readabilityScore = Math.max(0, Math.min(100,
      206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length)
    ));

    let readibilityLevel = '';
    if (readabilityScore >= 90) readibilityLevel = 'Very Easy (5th grade)';
    else if (readabilityScore >= 80) readibilityLevel = 'Easy (6th grade)';
    else if (readabilityScore >= 70) readibilityLevel = 'Fairly Easy (7th grade)';
    else if (readabilityScore >= 60) readibilityLevel = 'Standard (8th - 9th grade)';
    else if (readabilityScore >= 50) readibilityLevel = 'Fairly Difficult (10th - 12th grade)';
    else if (readabilityScore >= 30) readibilityLevel = 'Difficult (College)';
    else readibilityLevel = 'Very Difficult (College graduate)';

    return {
      bytes,
      chars,
      words: words.length,
      lines,
      paragraphs,
      sentences,
      avgWordLength,
      readingTime,
      topWords,
      readabilityScore: Math.round(readabilityScore),
      readibilityLevel
    };
  }

  estimateSyllables(text) {
    // Very simple estimation of syllables
    const vowels = (text.match(/[aeiouy]/gi) || []).length;
    const silentE = (text.match(/e$/gi) || []).length;
    return Math.max(1, vowels - silentE);
  }
}

module.exports = { TextAnalyzeCommand };
