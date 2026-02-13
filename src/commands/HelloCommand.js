const fs = require("fs");
const path = require("path");
const { Command } = require("../Command");

class HelloCommand extends Command {
  async execute(options) {
    const message = options.message || "Hello from your new command!";

    console.log(message);

    // Save output (required for capstone)
    const outputDir = path.join(process.cwd(), "references/custom");
    fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, "hello.txt");
    fs.writeFileSync(filePath, message);

    console.log("Saved to", filePath);
  }
}

module.exports = { HelloCommand };
