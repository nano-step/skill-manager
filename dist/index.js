"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const install_1 = require("./install");
const update_1 = require("./update");
const remove_1 = require("./remove");
async function run() {
    const program = new commander_1.Command();
    program
        .name("opencode-mcp-manager")
        .description("Install or manage the MCP Manager subagent")
        .option("--update", "Update existing MCP Manager installation")
        .option("--remove", "Remove MCP Manager installation")
        .parse(process.argv);
    const options = program.opts();
    if (options.update && options.remove) {
        console.error(chalk_1.default.red("Cannot use --update and --remove together."));
        process.exit(1);
    }
    if (options.remove) {
        await (0, remove_1.remove)();
        return;
    }
    if (options.update) {
        await (0, update_1.update)();
        return;
    }
    await (0, install_1.install)();
}
