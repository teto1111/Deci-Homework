#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');
const logger = require('./utils/logger');

const [,, command, ...args] = process.argv;

// Helper to get absolute path (Step 4)
const getPath = (file) => path.resolve(process.cwd(), file);

const help = () => {
  console.log(`
  Agent Quest CLI
  Commands:
    drop <file> <msg>   - Create a file with a message
    peek <file>         - Read file contents
    add <file> <msg>    - Append text to a file
    shred <file>        - Delete a file
    clone <src> <dest>  - Copy a file using streams
    seal <file>         - Compress a file (Gzip)
  Flags:
    -h, --help          - Show help
    -v, --version       - Show version
  `);
};

(async () => {
  try {
    // Step 3: Flags
    if (command === '-h' || command === '--help' || !command) {
      help();
      return;
    }

    if (command === '-v' || command === '--version') {
      console.log('Agent Quest v1.0.0');
      return;
    }

    // Step 9: Handling User Commands
    switch (command) {
      case 'drop': { // Step 4
        const [file, msg] = args;
        fs.writeFileSync(getPath(file), msg);
        logger.info(`Secret dropped into ${file}`);
        break;
      }

      case 'peek': { // Step 5
        const file = args[0];
        const targetPath = getPath(file);
        if (!fs.existsSync(targetPath)) {
          logger.error(`File ${file} not found.`);
          return;
        }
        const data = fs.readFileSync(targetPath, 'utf8');
        console.log(`--- Contents of ${file} ---\n${data}`);
        break;
      }

      case 'add': { // Step 6
        const [file, msg] = args;
        fs.appendFileSync(getPath(file), `\n${msg}`);
        logger.info(`Intel added to ${file}`);
        break;
      }

      case 'shred': { // Step 6
        const file = args[0];
        fs.unlinkSync(getPath(file));
        logger.info(`${file} has been shredded.`);
        break;
      }

      case 'clone': { // Step 7
        const [src, dest] = args;
        const readStream = fs.createReadStream(getPath(src));
        const writeStream = fs.createWriteStream(getPath(dest));
        
        readStream.pipe(writeStream);
        writeStream.on('finish', () => logger.info(`${src} cloned to ${dest}`));
        writeStream.on('error', (err) => logger.error(`Clone failed: ${err.message}`));
        break;
      }

      case 'seal': { // Step 8
        const file = args[0];
        const source = fs.createReadStream(getPath(file));
        const destination = fs.createWriteStream(getPath(`${file}.gz`));
        const gzip = zlib.createGzip();

        pipeline(source, gzip, destination, (err) => {
          if (err) logger.error(`Seal failed: ${err.message}`);
          else logger.info(`${file} sealed into ${file}.gz`);
        });
        break;
      }

      default:
        logger.error(`Unknown command: ${command}. Type -h for help.`);
    }
  } catch (err) {
    logger.error(`Operation failed: ${err.message}`);
  }
})();