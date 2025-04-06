import React, { useState } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';
import axios from 'axios';

const ChessGame = () => {
  const [chess] = useState(new Chess());
  const [position, setPosition] = useState(chess.fen());
  const [suggestedMove, setSuggestedMove] = useState(null); // Arrow for suggested move
  const [highlightSquares, setHighlightSquares] = useState({}); // Highlight starting square
  const [suggestedText, setSuggestedText] = useState(''); // Plain text hint

  const onDrop = ({ sourceSquare, targetSquare }) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return;
      setPosition(chess.fen());
      setSuggestedMove(null); // Clear suggestion
      setHighlightSquares({});
      setSuggestedText('');
      setTimeout(() => makeRandomMove(), 500);
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  const makeRandomMove = () => {
    try {
      const moves = chess.moves();
      if (moves.length === 0 || chess.isGameOver()) return;

      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      chess.move(randomMove);
      setPosition(chess.fen());
      setSuggestedMove(null); // Clear suggestion
      setHighlightSquares({});
      setSuggestedText('');
    } catch (error) {
      console.error('Random move error:', error);
    }
  };

  const suggestMove = async () => {
    try {
      const response = await axios.get('https://chess-game-app-xs41.onrender.com', {
        params: { fen: chess.fen() },
      });
      const { move } = response.data;
      if (move) {
        // Set arrow
        setSuggestedMove([{ square: move.from, dest: move.to, color: '#FF0000' }]);
        // Highlight starting square (yellow)
        setHighlightSquares({
          [move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
        });
        // Simple text hint
        const piece = chess.get(move.from).type === 'p' ? 'pawn' : chess.get(move.from).type;
        setSuggestedText(`Move your ${piece} from ${move.from} to ${move.to}`);
        // Clear after 5 seconds
        setTimeout(() => {
          setSuggestedMove(null);
          setHighlightSquares({});
          setSuggestedText('');
        }, 5000);
      } else {
        alert('No moves available');
      }
    } catch (error) {
      console.error('Suggest move error:', error);
      alert('Failed to get suggested move');
    }
  };

  return (
    <div>
      <Chessboard
        position={position}
        onDrop={onDrop}
        customArrows={suggestedMove}
        squareStyles={highlightSquares} // Highlight the starting square
      />
      <button onClick={suggestMove} style={{ marginTop: '10px' }}>
        Suggest Move
      </button>
      {suggestedText && (
        <p style={{ marginTop: '10px', color: '#333' }}>{suggestedText}</p>
      )}
    </div>
  );
};

export default ChessGame;