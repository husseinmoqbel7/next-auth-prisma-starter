#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Template for .env file
const envTemplate = `# Auth Secret from \`npx auth\`
AUTH_SECRET=""

# Database URL from your preferred provider.
DATABASE_URL=""
# uncomment next line if you use Prisma <5.10
# DATABASE_URL_UNPOOLED=""

# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Github OAuth Credentials
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Resend API Key
RESEND_API_KEY=

# Next.js App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend Email
RESEND_EMAIL=""
`;

// Ensure rimraf is installed before using it
const ensureRimraf = () => {
  try {
    require.resolve("rimraf");
  } catch (e) {
    console.log("🔄 Installing rimraf...");
    execSync("npm install rimraf", { stdio: "inherit" });
  }
};

// Import rimraf after ensuring it's installed
ensureRimraf();
const rimraf = require("rimraf");

// Function to check system requirements
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
      console.error(
        `❌ Node.js ${minVersion} or higher is required. Current version: ${nodeVersion}`
      );
      return false;
    }

    execSync("git --version", { stdio: "ignore" });
    execSync("npm --version", { stdio: "ignore" });

    return true;
  } catch (error) {
    console.error(
      "❌ Missing required system dependencies. Please install Git and Node.js."
    );
    return false;
  }
};

// Function to execute shell commands
const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// Function to create .env and .gitignore files
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
      if (!gitignoreContent.includes(".env"))
        fs.appendFileSync(gitignorePath, "\n.env\n");
    }

    return true;
  } catch (error) {
    console.error("Failed to create environment files:", error.message);
    return false;
  }
};

// Function to validate project name
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
    console.error(`❌ Directory "${name}" already exists!`);
    process.exit(1);
  }
};

// Function to clean up in case of failure
const cleanup = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    try {
      rimraf.sync(projectPath);
      console.log("\n🧹 Cleaned up project directory due to error.");
    } catch (error) {
      console.warn(`\n⚠️ Failed to clean up directory: ${error.message}`);
    }
  }
};

// Main function to create the project template
const createTemplate = async () => {
  const projectName = process.argv[2];
  validateProjectName(projectName);

  if (!checkSystemRequirements()) process.exit(1);

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

    // Create environment files
    console.log("📝 Creating environment files...");
    if (!createEnvFile(projectPath)) {
      cleanup(projectPath);
      process.exit(1);
    }

    // Initialize fresh git repository
    console.log("🌱 Initializing fresh Git repository...");
    if (
      !runCommand(
        `cd ${projectName} && rm -rf .git && git init && git add . && git commit -m "Initial commit"`
      )
    ) {
      console.warn("\n⚠️ Warning: Failed to initialize Git repository");
    }

    console.log(`\n✅ Project "${projectName}" created successfully!\n`);
    console.log("🚀 Next Steps:");
    console.log(`  1️⃣ cd ${projectName}`);
    console.log("  2️⃣ Set up your environment variables in `.env`");
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
