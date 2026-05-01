#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

// ---------- Helper: Ensure notes directory exists ----------
async function ensureNotesDir() {
  const notesDir = path.join(process.cwd(), 'notes');
  await fs.mkdir(notesDir, { recursive: true });
  return notesDir;
}

// ---------- Secret Agent File Operations ----------
async function dropNote(filename, content) {
  if (!filename || !content) {
    console.error('Usage: node agent.js drop <filename> <message>');
    process.exit(1);
  }
  try {
    const notesDir = await ensureNotesDir();
    // Sanitize filename to avoid path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(notesDir, safeName);
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`📝 Secret note "${safeName}" dropped successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to drop note:', err.message);
    process.exit(1);
  }
}

async function peekNote(filename) {
  if (!filename) {
    console.error('Usage: node agent.js peek <filename>');
    process.exit(1);
  }
  try {
    const notesDir = path.join(process.cwd(), 'notes');
    const safeName = path.basename(filename);
    const filePath = path.join(notesDir, safeName);
    const content = await fs.readFile(filePath, 'utf8');
    console.log(`🔎 Contents of "${safeName}":\n${content}`);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Note "${filename}" not found.`);
    } else {
      console.error('Failed to peek note:', err.message);
    }
    process.exit(1);
  }
}

async function interceptNote(filename, additionalContent) {
  if (!filename || !additionalContent) {
    console.error('Usage: node agent.js intercept <filename> <additional message>');
    process.exit(1);
  }
  try {
    const notesDir = path.join(process.cwd(), 'notes');
    const safeName = path.basename(filename);
    const filePath = path.join(notesDir, safeName);
    await fs.appendFile(filePath, '\n' + additionalContent, 'utf8');
    console.log(`✏️ Intercepted and added to "${safeName}".`);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Note "${filename}" does not exist. Use "drop" first.`);
    } else {
      console.error('Failed to intercept note:', err.message);
    }
    process.exit(1);
  }
}

async function shredNote(filename) {
  if (!filename) {
    console.error('Usage: node agent.js shred <filename>');
    process.exit(1);
  }
  try {
    const notesDir = path.join(process.cwd(), 'notes');
    const safeName = path.basename(filename);
    const filePath = path.join(notesDir, safeName);
    await fs.unlink(filePath);
    console.log(`🗑️ Note "${safeName}" shredded (deleted).`);
    process.exit(0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Note "${filename}" not found – nothing to shred.`);
    } else {
      console.error('Failed to shred note:', err.message);
    }
    process.exit(1);
  }
}

// ---------- Project Structure Builder ----------
async function buildProject(projectName) {
  if (!projectName) {
    console.error('Usage: node agent.js project <project-name>');
    process.exit(1);
  }

  const basePath = path.resolve(process.cwd(), projectName);
  try {
    // Check if project folder already exists
    await fs.access(basePath);
    console.error(`Project folder "${projectName}" already exists. Aborting.`);
    process.exit(1);
  } catch (err) {
    // Folder does not exist → safe to create
    if (err.code !== 'ENOENT') {
      console.error('Error checking project folder:', err.message);
      process.exit(1);
    }
  }

  try {
    // Create folder hierarchy recursively
    const codeDir = path.join(basePath, 'code');
    const notesDir = path.join(basePath, 'notes');
    await fs.mkdir(codeDir, { recursive: true });
    await fs.mkdir(notesDir, { recursive: true });

    // Create starter files
    const infoContent = `Project: ${projectName}\nCreated: ${new Date().toISOString()}\nThis is your secret agent workspace.`;
    await fs.writeFile(path.join(basePath, 'info.txt'), infoContent, 'utf8');

    const settings = {
      name: projectName,
      version: '1.0.0',
      environment: 'development',
    };
    await fs.writeFile(path.join(basePath, 'settings.json'), JSON.stringify(settings, null, 2), 'utf8');

    console.log(`Building your new project folder: ${projectName}...`);
    console.log('All done! Your folders and files are ready.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to build project:', err.message);
    process.exit(1);
  }
}

// ---------- Main CLI Router ----------
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`
Secret Agent CLI - Available commands:

  project <name>      Build a new project folder with code/notes structure
  drop <file> <msg>   Create a secret note (in ./notes/)
  peek <file>         Read the content of a note
  intercept <file> <msg>  Append additional info to a note
  shred <file>        Delete a note (permanently)

Examples:
  node agent.js project my-mission
  node agent.js drop rendezvous.txt "Meet at 9pm"
  node agent.js peek rendezvous.txt
  node agent.js intercept rendezvous.txt "Bring the code word: 'eagle'"
  node agent.js shred rendezvous.txt
`);
    process.exit(0);
  }

  const command = args[0];
  switch (command) {
    case 'project':
      await buildProject(args[1]);
      break;
    case 'drop':
      await dropNote(args[1], args.slice(2).join(' '));
      break;
    case 'peek':
      await peekNote(args[1]);
      break;
    case 'intercept':
      await interceptNote(args[1], args.slice(2).join(' '));
      break;
    case 'shred':
      await shredNote(args[1]);
      break;
    default:
      console.error(`Unknown command: ${command}. Use "help" or no arguments to see usage.`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
