#!/usr/bin/env node

import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dependencies are installed
const ensureDependencies = () => {
  const dependencies = ["rimraf", "chalk"];
  for (const dep of dependencies) {
    try {
      require.resolve(dep);
    } catch (e) {
      console.log(chalk.yellow(`🔄 Installing ${dep}...`));
      execSync(`npm install ${dep}`, { stdio: "inherit" });
    }
  }
};
ensureDependencies();

const rimraf = require("rimraf");

// Function to execute shell commands
const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit", shell: true });
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to execute: ${command}`));
    console.error(chalk.red(`Error: ${error.message}`));
    return false;
  }
};

// Validate project name
const validateProjectName = (name) => {
  if (!name) {
    console.error(chalk.red("❌ Please provide a project name!"));
    process.exit(1);
  }

  const invalidChars = /[^a-zA-Z0-9-_]/;
  if (invalidChars.test(name)) {
    console.error(
      chalk.red(
        "❌ Project name can only contain letters, numbers, hyphens, and underscores!"
      )
    );
    process.exit(1);
  }

  const reservedNames = [
    "node_modules",
    "public",
    "src",
    "test",
    "build",
    "dist",
  ];
  if (reservedNames.includes(name.toLowerCase())) {
    console.error(chalk.red(`❌ "${name}" is a reserved name!`));
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), name);
  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`❌ Directory "${name}" already exists!`));
    process.exit(1);
  }
};

// Cleanup in case of failure
const cleanup = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    try {
      rimraf.sync(projectPath);
      console.log(
        chalk.yellow("\n🧹 Cleaned up project directory due to error.")
      );
    } catch (error) {
      console.warn(chalk.yellow(`\n⚠️ Failed to clean up: ${error.message}`));
    }
  }
};

// Update package.json
const updatePackageJson = (projectPath, projectName) => {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = projectName;
  packageJson.version = "0.1.0";
  delete packageJson.bin; // Remove bin configuration as it's not needed in the project

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

// Main function
const createTemplate = async () => {
  const projectName = process.argv[2];
  validateProjectName(projectName);

  const repoUrl = "https://github.com/husseinmoqbel7/next-auth-prisma-starter";
  const projectPath = path.join(process.cwd(), projectName);

  console.log(chalk.cyan("\n🚀 Initializing project setup...\n"));

  // Clone the repository
  console.log(chalk.cyan("📥 Cloning template repository..."));
  if (!runCommand(`git clone ${repoUrl} ${projectName}`)) {
    cleanup(projectPath);
    process.exit(1);
  }

  // Navigate to project directory for subsequent commands
  process.chdir(projectPath);

  // Update package.json
  console.log(chalk.cyan("📝 Updating package.json..."));
  updatePackageJson(projectPath, projectName);

  // Install dependencies
  console.log(chalk.cyan("📦 Installing dependencies..."));
  if (!runCommand("npm install")) {
    cleanup(projectPath);
    process.exit(1);
  }

  // Remove .git folder using rimraf
  console.log(chalk.cyan("🗑 Cleaning up Git history..."));
  rimraf.sync(path.join(projectPath, ".git"));

  // Initialize fresh Git repo
  console.log(chalk.cyan("🌱 Initializing fresh Git repository..."));
  runCommand('git init && git add . && git commit -m "Initial commit"');

  console.log(
    chalk.green(`\n✅ Project "${projectName}" created successfully!\n`)
  );
  console.log(chalk.cyan("🚀 Next Steps:"));
  console.log(chalk.yellow(`  1️⃣ cd ${projectName}`));
  console.log(chalk.yellow("  2️⃣ Set up your .env file"));
  console.log(chalk.yellow("  3️⃣ Generate an AUTH_SECRET using: npx auth"));
  console.log(
    chalk.yellow("  4️⃣ Set up your database and update DATABASE_URL")
  );
  console.log(chalk.yellow("  5️⃣ Run the project with: npm run dev"));
  console.log(chalk.green("\n🎉 Happy coding!\n"));
};

// Handle process termination
process.on("SIGINT", () => {
  console.log(chalk.yellow("\nProcess terminated by user."));
  process.exit(1);
});

// Run the main function
createTemplate().catch((error) => {
  console.error(chalk.red("An unexpected error occurred:", error));
  cleanup(path.join(process.cwd(), process.argv[2] || ""));
  process.exit(1);
});
