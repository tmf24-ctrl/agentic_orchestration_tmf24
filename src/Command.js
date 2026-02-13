/**
 * Base Command interface for all CLI commands.
 * All commands must extend this class and implement execute().
 */
class Command {
  /**
   * Execute the command.
   * @param {Object} options - Parsed command options from yargs
   * @returns {Promise<void>}
   */
  async execute(options) {
    throw new Error('execute() must be implemented by subclass');
  }
}

module.exports = { Command };
