import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Step 5: requestTimer middleware ----------
function requestTimer(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
}

// ---------- Step 6: Apply middleware ----------
app.use(requestTimer);
app.use(express.static('public')); // serves static files from /public

// ---------- Step 7: Explicit route with sendFile ----------
app.get('/', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  res.sendFile(filePath);
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Profile server running at http://localhost:${PORT}`);
});