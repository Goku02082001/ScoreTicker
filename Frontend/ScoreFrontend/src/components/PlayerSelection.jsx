import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('https://scoreticker-1.onrender.com');

const PlayerSelection = () => {
  const [playerName, setPlayerName] = useState('');
  const [bowlerNameInput, setBowlerNameInput] = useState('');
  const [players, setPlayers] = useState([]);
  const [bowlers, setBowlers] = useState([]);
  const [striker, setStriker] = useState(localStorage.getItem('striker') || '');
  const [nonStriker, setNonStriker] = useState(localStorage.getItem('nonStriker') || '');
  const [bowler, setBowler] = useState(localStorage.getItem('bowler') || '');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('playersUpdated', (updatedPlayers) => {
      setStriker(updatedPlayers.striker);
      setNonStriker(updatedPlayers.nonStriker);
      setBowler(updatedPlayers.bowler);
    });

    return () => {
      socket.off('playersUpdated');
    };
  }, []);

  const validatePlayerName = (name) => /^[a-zA-Z\s]+$/.test(name); 
  const validateBowlerName = (name) => /^[a-zA-Z\s]+$/.test(name); 

  const addPlayerName = () => {
    if (playerName.trim() && validatePlayerName(playerName)) {
      const newPlayer = playerName.trim();
      
      // Update players state
      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);

      // Save updated players list to localStorage
      localStorage.setItem('players', JSON.stringify(updatedPlayers));

      setPlayerName('');
    } else {
      alert('Please enter a valid player name (alphabets only)');
    }
  };
  
  const addBowlerName = () => {
    if (bowlerNameInput.trim() && validateBowlerName(bowlerNameInput)) {
      const newBowler = bowlerNameInput.trim(); // Get the new bowler name from input
      const existingBowlers = JSON.parse(localStorage.getItem('bowlers')) || [];
      const updatedBowlers = [...existingBowlers, newBowler];
  
      localStorage.setItem('bowlers', JSON.stringify(updatedBowlers));
      setBowlers(updatedBowlers);
      setBowlerNameInput('');
    } else {
      // Show an alert if the bowler name is invalid
      alert('Please enter a valid bowler name (alphabets only)');
    }
  };
  
  
  const addPlayers = async () => {
    if (players.length === 0) {
      alert('Please add at least one player before proceeding.');
      return;
    }
    if (!striker.trim()) {
      alert('Please select a striker.');
      return;
    }
    if (!nonStriker.trim()) {
      alert('Please select a non-striker.');
      return;
    }
    if (!bowler.trim()) {
      alert('Please select a bowler.');
      return;
    }
  
    try {
      const response = await fetch('https://scoreticker-1.onrender.com/add-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ striker, nonStriker, bowler }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('striker', striker);
        localStorage.setItem('nonStriker', nonStriker);
        localStorage.setItem('bowler', bowler);

        alert('Add data Succesfully')
        navigate('/score-ticker');
      } else {
        const errorData = await response.json();
        alert(`Failed to add players: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server. Please check if the server is running.');
    }
  };
  const handleExit = () => {
    // Clear all stored data and navigate back to the home screen
    localStorage.clear();
    setPlayers([]);
    setBowlers([]);
    setStriker('');
    setNonStriker('');
    setBowler('');
    navigate('/');
  };
  return (
    
    <div style={styles.container}>
      <div>
    {/* Your existing UI components */}
    <button onClick={handleExit} style={{ margin: "10px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>
      Exit
    </button>
  </div>
      <h1 style={styles.heading}>Select Players</h1>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={styles.input}
        />
        <button onClick={addPlayerName} style={styles.addButton}>Add Player</button>
      </div>

      <div style={styles.dropdownContainer}>
        <label>Striker:</label>
        <select value={striker} onChange={(e) => setStriker(e.target.value)} style={styles.select}>
          <option value="" disabled>Select Striker</option>
          {players.map((player, index) => (
            <option key={index} value={player}>{player}</option>
          ))}
        </select>

        <label>Non-Striker:</label>
        <select value={nonStriker} onChange={(e) => setNonStriker(e.target.value)} style={styles.select}>
          <option value="" disabled>Select Non-Striker</option>
          {players.map((player, index) => (
            <option key={index} value={player}>{player}</option>
          ))}
        </select>

        <label>Enter Bowler Name:</label>
        <div style={styles.bowlerInputContainer}>
          <input
            type="text"
            placeholder="Enter Bowler Name"
            value={bowlerNameInput}
            onChange={(e) => setBowlerNameInput(e.target.value)}
            style={styles.input}
          />
          <button onClick={addBowlerName} style={styles.addButton}>Set Bowler</button>
        </div>

        <label>Select Bowler:</label>
        <select value={bowler} onChange={(e) => setBowler(e.target.value)} style={styles.select}>
          <option value="" disabled>Select Bowler</option>
          {bowlers.map((bowler, index) => (
            <option key={index} value={bowler}>{bowler}</option>
          ))}
        </select>
      </div>

      <button onClick={addPlayers} style={styles.button}>Add Players</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#e6f7ff',
    padding: '20px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '18px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '250px',
    outline: 'none',
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
  },
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    width: '250px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
    backgroundColor: '#f9f9f9',
    outline: 'none',
  },
  bowlerInputContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  button: {
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
  },
};

export default PlayerSelection;








