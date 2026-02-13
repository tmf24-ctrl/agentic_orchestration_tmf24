/**
 * CommandRegistry manages all CLI commands.
 * Commands are registered with their configuration and handler.
 */
class CommandRegistry {
  constructor() {
    this.commands = {};
  }

  /**
   * Register a command.
   * @param {string} name - Command name (e.g., 'web-search')
   * @param {Object} config - Command configuration with description and builder
   * @param {Command} command - Command instance
   */
  register(name, config, command) {
    this.commands[name] = {
      name,
      config,
      command
    };
  }

  /**
   * Get all registered commands.
   * @returns {Object} Map of registered commands
   */
  getAll() {
    return this.commands;
  }

  /**
   * Get a specific command by name.
   * @param {string} name - Command name
   * @returns {Object|null} Command entry or null if not found
   */
  get(name) {
    return this.commands[name] || null;
  }

  /**
   * Execute a command by name.
   * @param {string} name - Command name
   * @param {Object} options - Parsed command options
   * @returns {Promise<void>}
   */
  async execute(name, options) {
    const entry = this.get(name);
    if (!entry) {
      throw new Error(`Unknown command: ${name}`);
    }
    return entry.command.execute(options);
  }

  /**
   * Build yargs configuration for all registered commands.
   * @returns {Function} Function to pass to yargs.command() for each command
   */
  buildYargsConfig() {
    return (yargs) => {
      for (const [name, entry] of Object.entries(this.commands)) {
        yargs.command(
          name,
          entry.config.description || `Run ${name} command`,
          entry.config.builder || (() => {}),
          () => {} // Handler is invoked after yargs parsing
        );
      }
      return yargs;
    };
  }
}

module.exports = { CommandRegistry };
