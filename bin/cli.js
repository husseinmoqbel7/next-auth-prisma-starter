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
RESEND_EMAIL=""`;

// Check system requirements
const checkSystemRequirements = () => {
  try {
    // Check Node.js version
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

    // Check if git is installed
    execSync("git --version", { stdio: "ignore" });

    // Check if npm is installed
    execSync("npm --version", { stdio: "ignore" });

    return true;
  } catch (error) {
    console.error(
      "❌ Missing required system dependencies. Please install git and npm."
    );
    return false;
  }
};

// Improved command execution with better error handling and timeout
const runCommand = (command, timeout = 60000) => {
  try {
    execSync(command, { stdio: "inherit", timeout });
    return true;
  } catch (error) {
    if (error.signal === "SIGTERM") {
      console.error(
        `Command timed out after ${timeout / 1000} seconds: ${command}`
      );
    } else {
      console.error(`Failed to execute command: ${command}`);
      console.error(`Error: ${error.message}`);
    }
    return false;
  }
};

// Create .env file
const createEnvFile = (projectPath) => {
  try {
    // Ensure the project directory exists
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    fs.writeFileSync(path.join(projectPath, ".env"), envTemplate);
    fs.writeFileSync(path.join(projectPath, ".env.example"), envTemplate);

    // Create .gitignore if it doesn't exist
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
    console.error("Failed to create environment files:", error.message);
    return false;
  }
};

// Validate project name
const validateProjectName = (name) => {
  if (!name) {
    console.error("Please provide a project name!");
    process.exit(1);
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    console.error(
      "Project name can only contain letters, numbers, hyphens and underscores!"
    );
    process.exit(1);
  }

  // Check for reserved names
  const reservedNames = [
    "node_modules",
    "public",
    "src",
    "test",
    "build",
    "dist",
  ];
  if (reservedNames.includes(name.toLowerCase())) {
    console.error(
      `"${name}" is a reserved name and cannot be used as a project name!`
    );
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), name);
  if (fs.existsSync(targetDir)) {
    console.error(`Directory ${name} already exists!`);
    process.exit(1);
  }
};

// Cleanup function for error cases
const cleanup = (projectPath) => {
  if (fs.existsSync(projectPath)) {
    try {
      fs.rmSync(projectPath, { recursive: true, force: true });
      console.log("\nCleaned up project directory due to error");
    } catch (error) {
      console.warn(
        `\nWarning: Failed to clean up project directory: ${error.message}`
      );
    }
  }
};

// Main function to orchestrate the template creation
const createTemplate = async () => {
  // Get project name from command line arguments
  const projectName = process.argv[2];
  validateProjectName(projectName);

  // Check system requirements
  if (!checkSystemRequirements()) {
    process.exit(1);
  }

  const repoUrl = "https://github.com/husseinmoqbel7/next-auth-prisma-starter";
  const projectPath = path.join(process.cwd(), projectName);

  const commands = [
    {
      command: `git clone ${repoUrl} ${projectName}`,
      message: `Creating template ${projectName}...`,
      errorMessage: "Failed to clone the template repository",
    },
    {
      command: `cd ${projectName} && rm -rf bin`,
      message: "Removing CLI folder...",
      errorMessage: "Failed to remove CLI folder",
    },
    {
      command: `cd ${projectName} && npm install`,
      message: "Installing dependencies...",
      errorMessage: "Failed to install dependencies",
    },
  ];

  console.log("\n🚀 Initializing project setup...\n");

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

    // Create environment files
    console.log("\nCreating environment files...");
    const envCreated = createEnvFile(projectPath);
    if (!envCreated) {
      console.error("\n❌ Failed to create environment files");
      cleanup(projectPath);
      process.exit(1);
    }

    // Clean up git history and initialize new repository
    console.log("\nInitializing fresh git repository...");
    const cleanupGit = runCommand(
      `cd ${projectName} && rm -rf .git && git init && git add . && git commit -m "Initial commit"`
    );
    if (!cleanupGit) {
      console.warn("\n⚠️ Warning: Failed to initialize git repository");
    }

    console.log(`\n✅ Template ${projectName} created successfully!`);
    console.log("\nNext steps:");
    console.log(`  1. cd ${projectName}`);
    console.log("  2. Set up your environment variables in .env");
    console.log("  3. Generate AUTH_SECRET using: npx auth");
    console.log("  4. Set up your database and update DATABASE_URL");
    console.log("  5. npm run dev");
    console.log("\nOptional steps:");
    console.log("  - Set up Google OAuth credentials");
    console.log("  - Set up GitHub OAuth credentials");
    console.log("  - Configure Resend API for email functionality");
    console.log("\nHappy coding! 🎉\n");
  } catch (error) {
    console.error("\n❌ An unexpected error occurred:", error);
    cleanup(projectPath);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGINT", () => {
  console.log("\nProcess terminated by user");
  process.exit(1);
});

// Run the main function
createTemplate().catch((error) => {
  console.error("An unexpected error occurred:", error);
  cleanup(path.join(process.cwd(), process.argv[2] || ""));
  process.exit(1);
});
