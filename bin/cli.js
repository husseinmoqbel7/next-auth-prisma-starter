#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf"); // Ensure this is installed: npm install rimraf
const readline = require("readline-sync");

// Template for .env file
const envTemplate = `# Auth Secret from \`npx auth\`
AUTH_SECRET="" 
DATABASE_URL=""
# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Github OAuth Credentials
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
# Resend API Key
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_EMAIL=""`;

// Check system requirements
const checkSystemRequirements = () => {
  try {
    const nodeVersion = process.version;
    const minVersion = "v16.0.0";
    if (
      nodeVersion.localeCompare(minVersion, undefined, {
        numeric: true,
        sensitivity: "base",
      }) < 0
    ) {
      console.error(`❌ Node.js ${minVersion} or higher is required.`);
      return false;
    }
    execSync("git --version", { stdio: "ignore" });
    execSync("npm --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    console.error("❌ Missing required dependencies (git, npm).");
    return false;
  }
};

// Command execution function
const runCommand = (command, timeout = 300000) => {
  try {
    execSync(command, { stdio: "inherit", timeout });
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    return false;
  }
};

// Create .env file
const createEnvFile = (projectPath) => {
  try {
    if (!fs.existsSync(projectPath))
      fs.mkdirSync(projectPath, { recursive: true });
    fs.writeFileSync(path.join(projectPath, ".env"), envTemplate);
    fs.writeFileSync(path.join(projectPath, ".env.example"), envTemplate);

    const gitignorePath = path.join(projectPath, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, ".env\n");
    } else {
      const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
      if (!gitignoreContent.includes(".env")) {
        fs.appendFileSync(gitignorePath, "\n.env\n");
      }
    }
    return true;
  } catch (error) {
    console.error("❌ Failed to create environment files:", error.message);
    return false;
  }
};

// Validate project name
const validateProjectName = (name) => {
  if (!name) {
    console.error("❌ Please provide a project name!");
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
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
    console.error(`❌ Directory ${name} already exists!`);
    process.exit(1);
  }
};

// Cleanup function with user confirmation
const cleanup = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    console.warn(`\n⚠️ Warning: This will remove ${projectPath}`);
    const userInput = readline.question("Are you sure? (yes/no): ");
    if (userInput.toLowerCase() !== "yes") return;

    try {
      rimraf.sync(projectPath);
      console.log("🧹 Cleaned up project directory.");
    } catch (error) {
      console.warn(`⚠️ Warning: Failed to clean up: ${error.message}`);
    }
  }
};

// Main function to create template
const createTemplate = async () => {
  const projectName = process.argv[2];
  validateProjectName(projectName);

  if (!checkSystemRequirements()) process.exit(1);

  const repoUrl = "https://github.com/husseinmoqbel7/next-auth-prisma-starter";
  const projectPath = path.join(process.cwd(), projectName);

  console.log("\n🚀 Initializing project setup...\n");

  const commands = [
    {
      command: `git clone ${repoUrl} ${projectName}`,
      message: "Cloning template...",
      errorMessage: "Failed to clone repository",
    },
    {
      command: `cd ${projectName} && rimraf bin`,
      message: "Removing CLI folder...",
      errorMessage: "Failed to remove CLI folder",
    },
    {
      command: `cd ${projectName} && npm install`,
      message: "Installing dependencies...",
      errorMessage: "Failed to install dependencies",
    },
  ];

  try {
    for (const { command, message, errorMessage } of commands) {
      console.log(message);
      const success = runCommand(command);
      if (!success) {
        console.error(`\n❌ ${errorMessage}`);
        cleanup(projectPath);
        process.exit(1);
      }
    }

    console.log("\n📄 Creating environment files...");
    if (!createEnvFile(projectPath)) {
      console.error("\n❌ Failed to create environment files");
      cleanup(projectPath);
      process.exit(1);
    }

    console.log("\n🔄 Initializing fresh git repository...");
    if (
      !runCommand(
        `cd ${projectName} && rimraf .git && git init && git add . && git commit -m "Initial commit"`
      )
    ) {
      console.warn("\n⚠️ Warning: Failed to initialize git repository");
    }

    console.log(`\n✅ Template ${projectName} created successfully!`);
    console.log("\n🚀 Next Steps:");
    console.log(`  1️⃣  cd ${projectName}`);
    console.log("  2️⃣  Set up your environment variables in .env");
    console.log("  3️⃣  Generate AUTH_SECRET using: npx auth");
    console.log("  4️⃣  Set up your database and update DATABASE_URL");
    console.log("  5️⃣  Run: npm run dev\n");
    console.log(
      "💡 Need help? Visit: https://github.com/husseinmoqbel7/next-auth-prisma-starter\n"
    );
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

// Run the script
createTemplate().catch((error) => {
  console.error("An unexpected error occurred:", error);
  cleanup(path.join(process.cwd(), process.argv[2] || ""));
  process.exit(1);
});
