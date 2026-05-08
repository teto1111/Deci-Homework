import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
function logger(req, res, next) {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
}

app.use(logger);
const tipsList = [
  "Drink water before coffee.",
  "Use keyboard shortcuts to save time.",
  "Break tasks into 25-minute chunks (Pomodoro).",
  "Write down 3 priorities each morning."
];

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/tip', (req, res) => {
  const randomIndex = Math.floor(Math.random() * tipsList.length);
  const randomTip = tipsList[randomIndex];
  res.json({ tip: randomTip });
});

