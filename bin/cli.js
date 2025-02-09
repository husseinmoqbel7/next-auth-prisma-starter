#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Ensure rimraf is installed
const ensureRimraf = () => {
  try {
    require.resolve("rimraf");
  } catch (e) {
    console.log("🔄 Installing rimraf...");
    execSync("npm install rimraf", { stdio: "inherit" });
  }
};
ensureRimraf();
const rimraf = require("rimraf");

// Function to execute shell commands
const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`❌ Failed to execute: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Validate project name
const validateProjectName = (name) => {
  if (!name) {
    console.error("❌ Please provide a project name!");
    process.exit(1);
  }

  const invalidChars = /[^a-zA-Z0-9-_]/;
  if (invalidChars.test(name)) {
    console.error(
      "❌ Project name can only contain letters, numbers, hyphens, and underscores!"
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
    console.error(`❌ "${name}" is a reserved name!`);
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), name);
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Directory "${name}" already exists!`);
    process.exit(1);
  }
};

// Cleanup in case of failure
const cleanup = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    try {
      rimraf.sync(projectPath);
      console.log("\n🧹 Cleaned up project directory due to error.");
    } catch (error) {
      console.warn(`\n⚠️ Failed to clean up: ${error.message}`);
    }
  }
};

// Main function
const createTemplate = async () => {
  const projectName = process.argv[2];
  validateProjectName(projectName);

  const repoUrl = "https://github.com/husseinmoqbel7/next-auth-prisma-starter";
  const projectPath = path.join(process.cwd(), projectName);

  const commands = [
    {
      command: `git clone ${repoUrl} ${projectName}`,
      message: "📥 Cloning template repository...",
    },
    {
      command: `cd ${projectName} && npm install`,
      message: "📦 Installing dependencies...",
    },
  ];

  console.log("\n🚀 Initializing project setup...\n");

  try {
    for (const { command, message } of commands) {
      console.log(message);
      if (!runCommand(command)) {
        cleanup(projectPath);
        process.exit(1);
      }
    }

    // Remove CLI folder using rimraf
    console.log("🗑 Removing CLI folder...");
    rimraf.sync(path.join(projectPath, "bin"));

    // Remove .git folder based on OS
    console.log("🗑 Cleaning up Git history...");
    if (process.platform === "win32") {
      rimraf.sync(path.join(projectPath, ".git"));
    } else {
      runCommand(`cd ${projectName} && rm -rf .git`);
    }

    // Initialize fresh Git repo
    console.log("🌱 Initializing fresh Git repository...");
    runCommand(
      `cd ${projectName} && git init && git add . && git commit -m "Initial commit"`
    );

    console.log(`\n✅ Project "${projectName}" created successfully!\n`);
    console.log("🚀 Next Steps:");
    console.log(`  1️⃣ cd ${projectName}`);
    console.log("  2️⃣ Set up your `.env` file");
    console.log("  3️⃣ Generate an AUTH_SECRET using: `npx auth`");
    console.log("  4️⃣ Set up your database and update `DATABASE_URL`");
    console.log("  5️⃣ Run the project with: `npm run dev`");
    console.log("\n🎉 Happy coding!\n");
  } catch (error) {
    console.error("\n❌ An unexpected error occurred:", error);
    cleanup(projectPath);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGINT", () => {
  console.log("\nProcess terminated by user.");
  process.exit(1);
});

// Run the main function
createTemplate().catch((error) => {
  console.error("An unexpected error occurred:", error);
  cleanup(path.join(process.cwd(), process.argv[2] || ""));
  process.exit(1);
});
