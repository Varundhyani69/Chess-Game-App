const express = require('express');
const { Chess } = require('chess.js');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/suggest-move', (req, res) => {
  const fen = req.query.fen || 'rnbqkbnr/pppppppp/5n5/8/8/5N5/PPPPPPPP/RNBQKB1R w KQkq - 1 2';
  const chess = new Chess(fen);

  // Simple move suggestion: pick a random legal move (replace with Stockfish for real AI)
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return res.json({ move: null });

  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  res.json({ move: { from: randomMove.from, to: randomMove.to } });
});

app.listen(5000, () => console.log('Server running on port 5000'));