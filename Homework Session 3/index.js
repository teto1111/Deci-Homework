// index.js
import chalk from 'chalk';
import { readAsync } from './reader.js';

async function startApp() {
  try {
    // 1. Get data from your module
    const rawData = await readAsync('users.json');
    const users = JSON.parse(rawData); // Assuming users.json is an array of names

    console.log(chalk.bold.blue('\n--- Greeting Automator 3000 ---\n'));

    // 2. Use Loops & Arrays to automate
    users.forEach((user, index) => {
      const colors = [chalk.green, chalk.yellow, chalk.cyan, chalk.magenta];
      const colorPicker = colors[index % colors.length];

      console.log(
        chalk.gray(`[${index + 1}] `) + 
        colorPicker(`Hello, ${user}! `) + 
        chalk.italic('Welcome to the dev environment.')
      );
    });

    console.log(chalk.bold.blue('\n------------------------------\n'));
    
  } catch (error) {
    console.error(chalk.red.bgWhite(' ERROR '), error.message);
  }
}

startApp();