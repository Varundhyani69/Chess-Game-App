import React, { useState } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';
import axios from 'axios';
import '../styles.css'; // Correct path: up one level to src/

const ChessGame = () => {
  const [chess] = useState(new Chess());
  const [position, setPosition] = useState(chess.fen());
  const [suggestedMove, setSuggestedMove] = useState(null);
  const [highlightSquares, setHighlightSquares] = useState({});
  const [suggestedText, setSuggestedText] = useState('');
  const [gameStatus, setGameStatus] = useState('');

  const onDrop = ({ sourceSquare, targetSquare }) => {
    try {
      if (chess.isGameOver()) {
        setGameStatus(checkGameOverStatus());
        return;
      }

      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return;
      setPosition(chess.fen());
      setSuggestedMove(null);
      setHighlightSquares({});
      setSuggestedText('');

      if (chess.isGameOver()) {
        setGameStatus(checkGameOverStatus());
      } else {
        setTimeout(() => makeRandomMove(), 500);
      }
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  const makeRandomMove = () => {
    try {
      if (chess.isGameOver()) {
        setGameStatus(checkGameOverStatus());
        return;
      }

      const moves = chess.moves();
      if (moves.length === 0) return;

      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      chess.move(randomMove);
      setPosition(chess.fen());
      setSuggestedMove(null);
      setHighlightSquares({});
      setSuggestedText('');

      if (chess.isGameOver()) {
        setGameStatus(checkGameOverStatus());
      }
    } catch (error) {
      console.error('Random move error:', error);
    }
  };

  const checkGameOverStatus = () => {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
    } else if (chess.isStalemate()) {
      return 'Game ends in a stalemate!';
    } else if (chess.isDraw()) {
      return 'Game ends in a draw!';
    }
    return '';
  };

  const suggestMove = async () => {
    try {
      if (chess.isGameOver()) {
        setGameStatus(checkGameOverStatus());
        return;
      }

      const response = await axios.get('http://localhost:5000/suggest-move', {
        params: { fen: chess.fen() },
      });
      const { move } = response.data;
      if (move) {
        setSuggestedMove([{ square: move.from, dest: move.to, color: '#FF0000' }]);

        const chessTemp = new Chess(chess.fen());
        const possibleMoves = chessTemp.moves({ square: move.from, verbose: true });

        const highlightStyles = {};
        possibleMoves.forEach((m) => {
          highlightStyles[m.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
        });
        highlightStyles[move.from] = { backgroundColor: 'rgba(0, 0, 255, 0.4)' };
        highlightStyles[move.to] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' };

        setHighlightSquares(highlightStyles);
        setSuggestedText(`Move to ${move.to} (green)`);
      } else {
        alert('No moves available');
      }
    } catch (error) {
      console.error('Suggest move error:', error);
      alert('Failed to get suggested move');
    }
  };

  const onDragStart = ({ sourceSquare }) => {
    if (chess.isGameOver()) return;

    const chessTemp = new Chess(chess.fen());
    const possibleMoves = chessTemp.moves({ square: sourceSquare, verbose: true });

    const highlightStyles = {};
    possibleMoves.forEach((m) => {
      highlightStyles[m.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    });
    setHighlightSquares(highlightStyles);
  };

  const onDragEnd = () => {
    if (!suggestedMove && !chess.isGameOver()) {
      setHighlightSquares({});
    }
  };

  return (
    <div className="chessboard-container">
      <Chessboard
        position={position}
        onDrop={onDrop}
        customArrows={suggestedMove}
        squareStyles={highlightSquares}
        onDragStart={onDragStart}
        onMouseOutSquare={onDragEnd}
      />
      <button onClick={suggestMove}>Suggest Move</button>
      {suggestedText && <p>{suggestedText}</p>}
      {gameStatus && <p className="game-status">{gameStatus}</p>}
    </div>
  );
};

export { ChessGame };