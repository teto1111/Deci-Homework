#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');
const logger = require('./utils/logger');

const [,, command, ...args] = process.argv;

// Helper to get absolute path
const getPath = (file) => path.resolve(process.cwd(), file);

const help = () => {
  console.log(`
  Agent Quest CLI
  Commands:
    drop <file> <msg>  - Create a file with a message
    peek <file>        - Read file contents
    add <file> <msg>   - Append text to a file
    shred <file>       - Delete a file
    clone <src> <dest> - Copy a file using streams
    seal <file>        - Compress a file (Gzip)
  Flags:
    -h, --help         - Show help
    -v, --version      - Show version
  `);
};

(async () => {
  try {
    if (command === '-h' || command === '--help' || !command) {
      help();
      return;
    }

    if (command === '-v' || command === '--version') {
      console.log('Agent Quest v1.0.0');
      return;
    }

    switch (command) {
      case 'drop': {
        const [file, msg] = args;
        fs.writeFileSync(getPath(file), msg);
        logger.info(`Secret dropped into ${file}`);
        break;
      }

      case 'peek': {
        const file = args[0];
        if (!fs.existsSync(getPath(file))) {
          logger.error(`File ${file} not found.`);
          return;
        }
        const data = fs.readFileSync(getPath(file), 'utf8');
        console.log(`--- Contents of ${file} ---`);
        console.log(data);
        break;
      }

      case 'add': {
        const [file, msg] = args;
        fs.appendFileSync(getPath(file), `\n${msg}`);
        logger.info(`Intel added to ${file}`);
        break;
      }

      case 'shred': {
        const file = args[0];
        fs.unlinkSync(getPath(file));
        logger.info(`${file} has been shredded.`);
        break;
      }

      case 'clone': {
        const [src, dest] = args;
        const readStream = fs.createReadStream(getPath(src));
        const writeStream = fs.createWriteStream(getPath(dest));
        readStream.pipe(writeStream);
        writeStream.on('finish', () => logger.info(`${src} cloned to ${dest}`));
        break;
      }

      case 'seal': {
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