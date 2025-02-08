#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");
const inquirer = require("inquirer");
const setupOrm = require("./setup-orm");

const ormPackages = {
  prisma: ["prisma", "@prisma/client", "@auth/prisma-adapter"],
  drizzle: ["drizzle-orm", "@libsql/client", "drizzle-kit"],
};

const commonPackages = [
  "@radix-ui/react-dialog",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "lucide-react",
  "@radix-ui/react-avatar",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-label",
  "@radix-ui/react-select",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tooltip",
  "@types/bcryptjs",
  "bcryptjs",
  "next",
  "next-auth",
  "next-themes",
  "react",
  "react-dom",
  "react-hook-form",
  "react-icons",
  "react-spinners",
  "resend",
  "tailwind-merge",
  "tailwindcss-animate",
  "zod",
  "uuid",
];

async function installDependencies(targetDir, orm) {
  console.log(chalk.blue("Installing dependencies..."));

  // Install base packages
  execSync("npm install", { cwd: targetDir, stdio: "inherit" });

  // Install ORM packages
  const ormDeps = ormPackages[orm];
  execSync(`npm install ${ormDeps.join(" ")}`, {
    cwd: targetDir,
    stdio: "inherit",
  });

  // Install common packages
  execSync(`npm install ${commonPackages.join(" ")}`, {
    cwd: targetDir,
    stdio: "inherit",
  });

  // Install shadcn/ui CLI
  execSync("npm install -D @shadcn/ui", { cwd: targetDir, stdio: "inherit" });

  // Initialize shadcn/ui
  execSync("npx shadcn-ui@latest init", {
    cwd: targetDir,
    stdio: "inherit",
    input: Buffer.from("y\n"), // Auto confirm prompts
  });
}

async function createApp(projectName) {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "orm",
      message: "Select your preferred ORM:",
      choices: ["prisma", "drizzle"],
    },
  ]);

  const templateDir = path.resolve(__dirname, "../template");
  const targetDir = path.resolve(process.cwd(), projectName);

  try {
    await fs.copy(templateDir, targetDir);

    // Update package.json
    const packageJson = await fs.readJson(`${targetDir}/package.json`);
    packageJson.name = projectName;
    await fs.writeJson(`${targetDir}/package.json`, packageJson, { spaces: 2 });

    // Setup chosen ORM
    await setupOrm(targetDir, answers.orm);

    // Install all dependencies
    await installDependencies(targetDir, answers.orm);

    console.log(chalk.green(`\n✓ Created ${projectName} successfully`));
    console.log(chalk.blue("\nNext steps:"));
    console.log(`  cd ${projectName}`);
    console.log("  npm run dev");
  } catch (err) {
    console.error(chalk.red("Error creating project:"), err);
    process.exit(1);
  }
}

const projectName = process.argv[2];
if (!projectName) {
  console.error(chalk.red("Please specify project name"));
  process.exit(1);
}

createApp(projectName);
