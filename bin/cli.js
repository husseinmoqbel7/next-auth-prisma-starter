#!/usr/bin/env node
const { execSync } = require("child_process");

const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`Fialed to run command ${command} `, error);
    return false;
  }

  return true;
};

const repoName = process.argv[2];
const gitCheckoutCommand = `git clone https://github.com/husseinmoqbel7/next-auth-prisma-starter ${repoName}`;
const installDependenciesCommand = `cd ${repoName} && npm install`;

console.log(`Creating template ${repoName}...`);
const checkOut = runCommand(gitCheckoutCommand);

if (!checkOut) process.exit(1);

console.log(`Installing dependencies...`);
const installDependencies = runCommand(installDependenciesCommand);

if (!installDependencies) process.exit(1);

console.log(`Template ${repoName} created successfully!`);
console.log(`cd ${repoName} && npm run dev`);
