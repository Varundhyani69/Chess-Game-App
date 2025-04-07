import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChessGame } from './components/Chessboard';
import './styles.css'; // Must be present

function App() {
  return (
    <div className="App">
      <h1>Chess Game</h1>
      <DndProvider backend={HTML5Backend}>
        <ChessGame />
      </DndProvider>
    </div>
  );
}

export default App;