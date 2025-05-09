"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CardContent, CardTitle, CardHeader, Card } from './ui/card/Card';
import Badge from './ui/card/table/badge/Badge';
import './ScoreTicker.css';
import { useNavigate } from 'react-router-dom';
const socket = io('https://scoreticker-6.onrender.com');

const ScoreTicker = () => {
  const navigate = useNavigate(); 
  const [gameState, setGameState] = useState({
    teamA: localStorage.getItem('teamA') || "HostTeam",
    teamB: localStorage.getItem('teamB') || "Visitor Team",
    striker: localStorage.getItem('striker') || "",
    nonStriker: localStorage.getItem('nonStriker') || "",
    score: parseInt(localStorage.getItem('score')) || 0,
    currentOver: parseInt(localStorage.getItem('currentOver')) || 0,
    currentBall: parseInt(localStorage.getItem('currentBall')) || 0,
    totalOvers: parseInt(localStorage.getItem('totalOvers')) || 20,
    lastUpdated: localStorage.getItem('lastUpdated') || null,
    runCounts: JSON.parse(localStorage.getItem('runCounts')) || Array(20).fill({ singles: 0, doubles: 0, fours: 0, sixes: 0 }),
    batsmen: [
      { name: localStorage.getItem('striker') || "", runs: 0, balls: 0, fours: 0, sixes: 0 },
      { name: localStorage.getItem('nonStriker') || "", runs: 0, balls: 0, fours: 0, sixes: 0 }
    ],
    bowler: { name: localStorage.getItem('bowler') || '', overs: 0, maidens: 0, runs: 0, wickets: 0, currentOverRuns: 0 },
    wickets: 0,
    extras: {
      wide: false,
      noBall: false,
      bye: false,
      legBye: false,
      wicket: false
    },
    extraRun: 0, // New state to track extra runs
    showBowlerInput: false
  });

  const [newBowler, setNewBowler] = useState("");
  const [showBowlerInput, setShowBowlerInput] = useState(false); 
  
  const [isOverComplete, setIsOverComplete] = useState(false);

  const calculateStrikeRate = (runs, balls) => (balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00');

  // const addRun = (runs, extraType = null) => {
  //   setGameState((prevState) => {
  //     const currentOverIndex = Math.min(prevState.currentOver, prevState.runCounts.length - 1);
  
  //     // Update batsman's stats (only striker)
  //     const batsmen = prevState.batsmen.map((batsman) =>
  //       batsman.name === prevState.striker
  //         ? {
  //             ...batsman,
  //             runs: batsman.runs + runs,
  //             balls: batsman.balls + 1,
  //             ...(runs === 4 && { fours: batsman.fours + 1 }),
  //             ...(runs === 6 && { sixes: batsman.sixes + 1 }),
  //           }
  //         : batsman
  //     );
  
  //     // Update the run counts for the current over
  //     const runCounts = [...prevState.runCounts];
  //     if (runs === 1) runCounts[currentOverIndex].singles += 1;
  //     if (runs === 2) runCounts[currentOverIndex].doubles += 1;
  //     if (runs === 4) runCounts[currentOverIndex].fours += 1;
  //     if (runs === 6) runCounts[currentOverIndex].sixes += 1;
  
  //     // Update bowler stats
  //     const updatedBowler = {
  //       ...prevState.bowler,
  //       runs: prevState.bowler.runs + runs, // Add runs to bowler's total
  //       currentOverRuns: prevState.currentBall < 5 ? prevState.bowler.currentOverRuns + runs : 0,
  //       overs: prevState.currentBall === 5 ? prevState.bowler.overs + 1 : prevState.bowler.overs,
  //     };
  
  //     // Save bowler details in localStorage
  //     const storedBowlerDetails = JSON.parse(localStorage.getItem('bowlerDetails') || '{}');
  //     storedBowlerDetails[updatedBowler.name] = updatedBowler;
  //     localStorage.setItem('bowlerDetails', JSON.stringify(storedBowlerDetails));
  
  //     // Update game state
  //     const updatedState = {
  //       ...prevState,
  //       score: prevState.score + runs, // Update score
  //       currentBall: prevState.currentBall + 1, // Increment ball
  //       batsmen, // Update batsmen stats
  //       runCounts, // Update run counts
  //       bowler: updatedBowler, // Update bowler stats
  //       lastUpdated: new Date().toISOString(), // Track when the update occurred
  //     };
  
  //     // Swap striker and non-striker if the run is odd
  //     if (runs % 2 !== 0) {
  //       updatedState.striker = prevState.nonStriker;
  //       updatedState.nonStriker = prevState.striker;
  //     }
  
  //     // Handle over completion
  //     if (updatedState.currentBall === 6) {
  //       updatedState.currentOver += 1; // Move to the next over
  //       updatedState.currentBall = 0; // Reset ball count
  //       updatedState.showBowlerInput = true; // Prompt for new bowler
  //     }
  
  //     // Handle extras
  //     if (extraType) {
  //       updatedState.extras = { ...prevState.extras, [extraType]: true };
  //       updatedState.score += 1; // Add one run for the extra
  //     }
  
  //     // Save the updated state to localStorage
  //     localStorage.setItem('score', updatedState.score);
  //     localStorage.setItem('currentOver', updatedState.currentOver);
  //     localStorage.setItem('currentBall', updatedState.currentBall);
  //     localStorage.setItem('lastUpdated', updatedState.lastUpdated);
  //     localStorage.setItem('runCounts', JSON.stringify(updatedState.runCounts));
  //     localStorage.setItem('striker', updatedState.striker);
  //     localStorage.setItem('nonStriker', updatedState.nonStriker);
  //     localStorage.setItem('wickets', updatedState.wickets);
  //     localStorage.setItem('extras', JSON.stringify(updatedState.extras));
  
  //     return updatedState; // Return the updated state
  //   });
  // };
  
  const addRun = (runs, extraType = null) => {
    // If a new player is being added, don't update score or non-striker runs yet
    if (!gameState.striker || !gameState.nonStriker) {
      return; // Exit the function if no batsmen are set (or waiting for new batsman)
    }
  
    // Block adding runs if over is complete and same bowler is selected
    if (isOverComplete && gameState.bowler.name === gameState.bowler.name) {
      alert("The same bowler cannot bowl the next over. Please add a new bowler.");
      return; // Block runs from being added if the same bowler is selected
    }
  
    if (isOverComplete) return; // Stop if over is complete and bowler not yet updated
  
    // Update state using setGameState
    setGameState((prevState) => {
      const currentOverIndex = Math.min(prevState.currentOver, prevState.runCounts.length - 1);
  
      // Update batsman's stats (only striker)
      const batsmen = prevState.batsmen.map((batsman) =>
        batsman.name === prevState.striker
          ? {
              ...batsman,
              runs: batsman.runs + runs,
              balls: batsman.balls + 1,
              ...(runs === 4 && { fours: batsman.fours + 1 }),
              ...(runs === 6 && { sixes: batsman.sixes + 1 }),
            }
          : batsman
      );
  
      // Update the run counts for the current over
      const runCounts = [...prevState.runCounts];
      if (runs === 1) runCounts[currentOverIndex].singles += 1;
      if (runs === 2) runCounts[currentOverIndex].doubles += 1;
      if (runs === 4) runCounts[currentOverIndex].fours += 1;
      if (runs === 6) runCounts[currentOverIndex].sixes += 1;
  
      // Update bowler stats
      const updatedBowler = {
        ...prevState.bowler,
        runs: prevState.bowler.runs + runs, // Add runs to bowler's total
        currentOverRuns: prevState.currentBall < 5 ? prevState.bowler.currentOverRuns + runs : 0,
        overs: prevState.currentBall === 5 ? prevState.bowler.overs + 1 : prevState.bowler.overs,
      };
  
      // Save bowler details in localStorage
      const storedBowlerDetails = JSON.parse(localStorage.getItem('bowlerDetails') || '{}');
      storedBowlerDetails[updatedBowler.name] = updatedBowler;
      localStorage.setItem('bowlerDetails', JSON.stringify(storedBowlerDetails));
  
      // Update game state
      const updatedState = {
        ...prevState,
        score: prevState.score + runs, // Update score
        currentBall: prevState.currentBall + 1, // Increment ball
        batsmen, // Update batsmen stats
        runCounts, // Update run counts
        bowler: updatedBowler, // Update bowler stats
        lastUpdated: new Date().toISOString(), // Track when the update occurred
      };
  
      // Swap striker and non-striker if the run is odd
      if (runs % 2 !== 0) {
        updatedState.striker = prevState.nonStriker;
        updatedState.nonStriker = prevState.striker;
      }
  
      // Handle over completion
      if (updatedState.currentBall === 6) {
        updatedState.currentOver += 1; // Move to the next over
        updatedState.currentBall = 0; // Reset ball count
        updatedState.showBowlerInput = true; // Prompt for new bowler
        setIsOverComplete(true); // Block further updates, indicating the over is complete
      }
  
      // Handle extras
      if (extraType) {
        updatedState.extras = { ...prevState.extras, [extraType]: true };
        updatedState.score += 1; // Add one run for the extra
      }
  
      // Save the updated state to localStorage
      localStorage.setItem('score', updatedState.score);
      localStorage.setItem('currentOver', updatedState.currentOver);
      localStorage.setItem('currentBall', updatedState.currentBall);
      localStorage.setItem('lastUpdated', updatedState.lastUpdated);
      localStorage.setItem('runCounts', JSON.stringify(updatedState.runCounts));
      localStorage.setItem('striker', updatedState.striker);
      localStorage.setItem('nonStriker', updatedState.nonStriker);
      localStorage.setItem('wickets', updatedState.wickets);
      localStorage.setItem('extras', JSON.stringify(updatedState.extras));
  
      return updatedState; // Return the updated state
    });
  };
  


  const handleRefreshScore = () => {
    const initialState = {
      ...gameState,
      score: 0,
      currentOver: 0,
      currentBall: 0,
      lastUpdated: new Date().toISOString(),
      runCounts: Array(20).fill({ singles: 0, doubles: 0, fours: 0, sixes: 0 }),
      batsmen: gameState.batsmen.map(batsman => ({ ...batsman, runs: 0, balls: 0, fours: 0, sixes: 0 })),
      wickets: 0,
      bowler: { ...gameState.bowler, runs: 0, overs: 0, currentOverRuns: 0 },
      extras: {
        wide: false,
        noBall: false,
        bye: false,
        legBye: false,
        wicket: false
      },
      extraRun: 0
    };

    setGameState(initialState);
    localStorage.setItem('score', initialState.score);
    localStorage.setItem('currentOver', initialState.currentOver);
    localStorage.setItem('currentBall', initialState.currentBall);
    localStorage.setItem('lastUpdated', initialState.lastUpdated);
    localStorage.setItem('runCounts', JSON.stringify(initialState.runCounts));
    localStorage.setItem('wickets', initialState.wickets);
    localStorage.setItem('extras', JSON.stringify(initialState.extras));
  };

  const toggleExtraRunButtons = (extraType) => {
    setGameState(prevState => ({
      ...prevState,
      extras: {
        ...prevState.extras,
        [extraType]: !prevState.extras[extraType]
      }
    }));
  };

  

  console.log(gameState)

  const handlePlayerReplacement = () => {
    const newPlayer = gameState.newPlayerName.trim();
  
    if (newPlayer) {
      setGameState((prevState) => {
        // Create a new batsman with initialized statistics
        const newBatsman = {
          name: newPlayer,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
        };
  
        // Fetch existing players from localStorage
        const existingPlayers = JSON.parse(localStorage.getItem('players')) || [];
  
        // Add new player and ensure no duplicates
        const updatedPlayers = [...new Set([...existingPlayers, newPlayer])];
  
        // Save the updated list back to localStorage
        localStorage.setItem('players', JSON.stringify(updatedPlayers));
  
        // Update the batsmen array
        const updatedBatsmen = [...prevState.batsmen, newBatsman];
  
        // Properly update the new striker and non-striker
        const updatedState = {
          ...prevState,
          batsmen: updatedBatsmen,
          striker: newPlayer, // New player becomes the striker
          nonStriker: prevState.striker, // Previous striker becomes non-striker
          newPlayerName: '', // Clear the input field after adding the player
          dismissPlayer: false, // Reset the dismissPlayer flag
        };
  
        // Save updated striker and non-striker
        localStorage.setItem('striker', updatedState.striker);
        localStorage.setItem('nonStriker', updatedState.nonStriker);
        localStorage.setItem('batsmen', JSON.stringify(updatedBatsmen));
  
        return updatedState;
      });
    } else {
      alert('Please select a valid player name.');
    }
  };
  
  
  const handleAddBowler = (bowlerName) => {
    if (!bowlerName) {
      alert('Please select a bowler to add.');
      return;
    }
  
    // Check if bowler details already exist in localStorage
    const storedBowlerDetails = JSON.parse(localStorage.getItem('bowlerDetails') || '{}');
  
    // Default values for a new bowler
    const bowlerDetails = storedBowlerDetails[bowlerName] || {
      name: bowlerName,
      overs: 0,              
      runs: 0,               
      wickets: 0,            
      economy: 0.0,        
      currentOverRuns: 0,   
    };
  
    // Update gameState and localStorage
    setGameState((prevState) => ({
      ...prevState,
      bowler: bowlerDetails,
      showBowlerInput: false, // Hide the bowler input after adding
    }));
  
    // Reset over complete status when new bowler is added
    setIsOverComplete(false);
  
    // Save the updated bowler details in localStorage
    storedBowlerDetails[bowlerName] = bowlerDetails;
    localStorage.setItem('bowlerDetails', JSON.stringify(storedBowlerDetails));
  };
  
  const handleDismissal = (dismissalType) => {
    const playerOut = gameState.striker; // Player out is the striker
    const bowler = gameState.bowler.name;
    const dismissedBatsman = gameState.batsmen.find((batsman) => batsman.name === playerOut);
    const playerRuns = dismissedBatsman?.runs || 0;
    const playerBalls = dismissedBatsman?.balls || 0;
    const playerFours = dismissedBatsman?.fours || 0;
    const playerSixes = dismissedBatsman?.sixes || 0;
  
    // Send dismissal details to the backend
    fetch('https://scoreticker-6.onrender.com/add-dismissal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerOut,
        dismissalType,
        bowler,
        runs: playerRuns,
        balls: playerBalls,
        fours: playerFours,
        sixes: playerSixes,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Dismissal added successfully') {
          console.log('Dismissal successfully added to the database:', data.dismissal);
  
          setGameState((prevState) => {
            const currentOverIndex = Math.min(prevState.currentOver, prevState.runCounts.length - 1);
  
            // Update the run count for the current over
            const updatedRunCounts = [...prevState.runCounts];
            updatedRunCounts[currentOverIndex] = {
              ...updatedRunCounts[currentOverIndex],
              wickets: (updatedRunCounts[currentOverIndex]?.wickets || 0) + 1,
            };
  
            // Update bowler's stats
            const updatedBowler = {
              ...prevState.bowler,
              wickets: prevState.bowler.wickets + 1, // Increment wicket count
            };
  
            // Update localStorage for bowler stats
            const storedBowlerDetails = JSON.parse(localStorage.getItem('bowlerDetails') || '{}');
            storedBowlerDetails[updatedBowler.name] = updatedBowler;
            localStorage.setItem('bowlerDetails', JSON.stringify(storedBowlerDetails));
  
            // Remove the out player from replacement list (localStorage)
            const existingPlayers = JSON.parse(localStorage.getItem('players')) || [];
            const updatedPlayers = existingPlayers.filter((player) => player !== playerOut);
            localStorage.setItem('players', JSON.stringify(updatedPlayers));
  
            // Update the batsmen array
            const updatedBatsmen = prevState.batsmen.filter((batsman) => batsman.name !== playerOut);
  
            // Update striker and non-striker logic
            let newStriker = updatedBatsmen.length > 0 ? updatedBatsmen[0].name : '';
            let newNonStriker = updatedBatsmen.length > 1 ? updatedBatsmen[1].name : prevState.nonStriker;
  
            // Ensure new striker and non-striker do not overlap
            if (newStriker === newNonStriker) {
              newNonStriker = updatedBatsmen.length > 1 ? updatedBatsmen[1].name : '';
            }
  
            const isOverComplete = prevState.currentBall + 1 === 6;
  
            const updatedState = {
              ...prevState,
              currentBall: isOverComplete ? 0 : prevState.currentBall + 1,
              currentOver: isOverComplete ? prevState.currentOver + 1 : prevState.currentOver,
              wickets: prevState.wickets + 1,
              batsmen: updatedBatsmen,
              striker: newStriker,
              nonStriker: newNonStriker,
              bowler: updatedBowler,
              dismissPlayer: true, // Show input box for new player
              runCounts: updatedRunCounts,
            };
  
            // Save the updated state to localStorage
            localStorage.setItem('currentBall', updatedState.currentBall);
            localStorage.setItem('currentOver', updatedState.currentOver);
            localStorage.setItem('wickets', updatedState.wickets);
            localStorage.setItem('batsmen', JSON.stringify(updatedBatsmen));
            localStorage.setItem('striker', updatedState.striker);
            localStorage.setItem('nonStriker', updatedState.nonStriker);
            localStorage.setItem('runCounts', JSON.stringify(updatedRunCounts));
  
            return updatedState;
          });
        } else {
          console.error('Failed to add dismissal:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error during dismissal:', error);
      });
  };
  
  const handleExtraRun = (extraType, runs) => {
    setGameState((prevState) => {
      const currentOverIndex = Math.min(prevState.currentOver, prevState.runCounts.length - 1);
  
      // Use let instead of const for 'actualRuns' so that it can be reassigned
      let actualRuns = runs === 0 ? 1 : runs; // Default case for '0' run, converts it to 1
  
      // Adjust actualRuns based on the input
      if (runs === 1) {
        actualRuns = 2;
      } else if (runs === 2) {
        actualRuns = 3;
      } else if (runs === 3) {
        actualRuns = 4;
      }
  
      // Update the score and extras
      const updatedState = {
        ...prevState,
        score: prevState.score + actualRuns,
        extras: {
          ...prevState.extras,
          [extraType]: true, // Mark the extra type as true
        },
        bowler: {
          ...prevState.bowler,
          runs: prevState.bowler.runs + actualRuns, // Add runs to bowler's stats
        },
        runCounts: [
          ...prevState.runCounts.slice(0, currentOverIndex),
          {
            ...prevState.runCounts[currentOverIndex],
            singles: actualRuns === 1 ? prevState.runCounts[currentOverIndex].singles + 1 : prevState.runCounts[currentOverIndex].singles,
            doubles: actualRuns === 2 ? prevState.runCounts[currentOverIndex].doubles + 1 : prevState.runCounts[currentOverIndex].doubles,
            fours: actualRuns === 4 ? prevState.runCounts[currentOverIndex].fours + 1 : prevState.runCounts[currentOverIndex].fours,
            sixes: actualRuns === 6 ? prevState.runCounts[currentOverIndex].sixes + 1 : prevState.runCounts[currentOverIndex].sixes,
          },
          ...prevState.runCounts.slice(currentOverIndex + 1),
        ],
        lastUpdated: new Date().toISOString(),
      };
  
      // Save updated state to localStorage
      localStorage.setItem('score', updatedState.score);
      localStorage.setItem('extras', JSON.stringify(updatedState.extras));
      localStorage.setItem('runCounts', JSON.stringify(updatedState.runCounts));
      localStorage.setItem('lastUpdated', updatedState.lastUpdated);
  
      return updatedState;
    });
    
  };
  
  const handleExit = () => {
    // Clear localStorage data for this session
    localStorage.removeItem('teamA');
    localStorage.removeItem('teamB');
    localStorage.removeItem('striker');
    localStorage.removeItem('nonStriker');
    localStorage.removeItem('score');
    localStorage.removeItem('currentOver');
    localStorage.removeItem('currentBall');
    localStorage.removeItem('runCounts');
    localStorage.removeItem('lastUpdated');
    localStorage.removeItem('batsmen');
    localStorage.removeItem('wickets');
    localStorage.removeItem('extras');
    localStorage.removeItem('bowler');
  
    // Set game state to initial cleared state
    setGameState({
      teamA: "",
      teamB: "",
      striker: "",
      nonStriker: "",
      score: 0,
      currentOver: 0,
      currentBall: 0,
      totalOvers: 20,
      lastUpdated: null,
      runCounts: Array(20).fill({ singles: 0, doubles: 0, fours: 0, sixes: 0 }),
      batsmen: [
        { name: "", runs: 0, balls: 0, fours: 0, sixes: 0 },
        { name: "", runs: 0, balls: 0, fours: 0, sixes: 0 },
      ],
      bowler: { name: '', overs: 0, maidens: 0, runs: 0, wickets: 0, currentOverRuns: 0 },
      wickets: 0,
      extras: {
        wide: false,
        noBall: false,
        bye: false,
        legBye: false,
        wicket: false,
      },
      extraRun: 0,
      showBowlerInput: false,
    });
  
    // Ensure navigation happens after state reset
    navigate('/');
  };
  

 return (
  <div className="score-ticker-container">
     <div>
    {/* Your existing UI components */}
    <button onClick={handleExit} style={{ margin: "10px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>
      Exit
    </button>
  </div>
    <Card className="score-ticker-card">
      <CardHeader className="flex flex-row items-center justify-between score-ticker-header">
        <CardTitle className="score-ticker-title">{gameState.teamA} vs {gameState.teamB}</CardTitle>
        <Badge variant="secondary" className="live-badge">LIVE</Badge>
      </CardHeader>
      <CardContent className="score-ticker-content">
        <div className="score-display">
          <div className="score-number">
            {gameState.score}/{gameState.wickets}
            <span className="overs-display">({gameState.currentOver}.{gameState.currentBall} ov)</span>
          </div>
          <div className="last-updated">Last Updated: {new Date(gameState.lastUpdated).toLocaleTimeString()}</div>
        </div>

        <div className="batsmen-info">
          <h3 className="section-title">Batsmen</h3>
          <table className="batsman-table">
            <thead>
              <tr>
                <th>Batsman</th>
                <th>Runs</th>
                <th>Fours</th>
                <th>Sixes</th>
                <th>Strike Rate</th>
              </tr>
            </thead>
            <tbody>
              {gameState.batsmen
                .sort((a, b) => (a.name === gameState.striker ? -1 : 1))
                .map((batsman, index) => (
                  <tr key={`${batsman.name}-${index}`}>
                    <td>{batsman.name === gameState.striker ? `${batsman.name} *` : batsman.name}</td>
                    <td>{batsman.runs}</td>
                    <td>{batsman.fours}</td>
                    <td>{batsman.sixes}</td>
                    <td>{calculateStrikeRate(batsman.runs, batsman.balls)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="bowler-info">
          <h3 className="section-title">Bowler</h3>
          <table className="bowler-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>Overs</th>
                <th>Runs</th>
                <th>Wickets</th>
                <th>Economy</th>
                <th>Current Over Runs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{gameState.bowler.name}</td>
                <td>{gameState.bowler.overs}</td>
                <td>{gameState.bowler.runs}</td>
                <td>{gameState.bowler.wickets}</td>
                <td>{gameState.bowler.overs > 0 ? (gameState.bowler.runs / gameState.bowler.overs).toFixed(2) : '0.00'}</td>
                <td>{gameState.bowler.currentOverRuns}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Show the Bowler Input if Over Ends */}
        {/* {gameState.showBowlerInput && (
  <div className="bowler-input-container">
    <label htmlFor="bowlerName">Enter New Bowler: </label>
    <input
      type="text"
      id="bowlerName"
      value={newBowler}
      onChange={(e) => setNewBowler(e.target.value)}
      className="bowler-input"
    />
    <button onClick={handleAddBowler} className="add-bowler-button">
      Add Bowler
    </button>
  </div>
)} */}

{gameState.showBowlerInput && (
  <div className="bowler-input-container">
    <label htmlFor="bowlerName">Select Bowler: </label>

    <select
      id="bowlerName"
      value={gameState.bowler.name || ''}
      onChange={(e) =>
        setGameState({ ...gameState, bowler: { ...gameState.bowler, name: e.target.value } })
      }
      className="bowler-input"
    >
      <option value="" disabled>
        Select a bowler
      </option>
      {JSON.parse(localStorage.getItem('bowlers') || '[]').map((bowler, index) => (
        <option key={index} value={bowler}>
          {bowler}
        </option>
      ))}
    </select>

    <button
      onClick={() => handleAddBowler(gameState.bowler.name)}
      className="add-bowler-button"
      disabled={!gameState.bowler.name}
    >
      Add Bowler
    </button>
  </div>
)}

      </CardContent>
    </Card>

    {/* Run Buttons Section */}
    <Card className="run-buttons-card">
      <CardHeader>
        <CardTitle className="run-buttons-title">Run Buttons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="run-buttons-container">
          <table className="run-buttons-table">
            <thead>
              <tr>
                <th colSpan="4">Run Button</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><button onClick={() => addRun(1)} className="run-button">1</button></td>
                <td><button onClick={() => addRun(2)} className="run-button">2</button></td>
                <td><button onClick={() => addRun(3)} className="run-button">3</button></td>
                <td><button onClick={() => addRun(4)} className="run-button">4</button></td>
              </tr>
              <tr>
                <td><button onClick={() => addRun(5)} className="run-button">5</button></td>
                <td><button onClick={() => addRun(6)} className="run-button">6</button></td>
                <td colSpan="2"><button onClick={handleRefreshScore} className="reset-button">Reset</button></td>
              </tr>
            </tbody>
          </table>

          {/* Extra Buttons Section */}
          <table className="run-buttons-table">
            <thead>
              <tr>
                <th colSpan="5">Extra Buttons</th>
              </tr>
            </thead>
            <tbody>
              {["wide", "bye", "legBye", "noBall"].map((extraType) => (
                <tr key={extraType}> 
                  <td>
                    <input 
                      type="checkbox" 
                      checked={gameState.extras[extraType]} 
                      onChange={() => toggleExtraRunButtons(extraType)} 
                    /> 
                    {extraType.charAt(0).toUpperCase() + extraType.slice(1)}
                  </td>
                  {gameState.extras[extraType] && (
                    <td>
                      {[0, 1, 2, 3].map((run) => (
                        <button 
                          key={run} 
                          onClick={() => handleExtraRun(extraType, run)} 
                          className="run-button"
                        >
                          {run}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    type="checkbox"
                    checked={gameState.extras.wicket}
                    onChange={() => toggleExtraRunButtons('wicket')}
                  /> 
                  Wicket
                </td>

                {gameState.extras.wicket && (
                  <td>
                    {/* Dismissal types options */}
                    {["Caught", "Bowled", "LBW", "Stumps"].map((type) => (
                      <div key={type}>
                        <button onClick={() => handleDismissal(type)}>{type}</button>
                      </div>
                    ))}

                    {/* Player replacement input and button */}
                    {gameState.dismissPlayer && (
  <div>
    <label>Select Replacement Player:</label>
    <select
      value={gameState.newPlayerName || ''} // Fallback to empty string
      onChange={(e) =>
        setGameState({
          ...gameState,
          newPlayerName: e.target.value, // Update newPlayerName when a player is selected
        })
      }
    >
      <option value="" disabled>
        Select a player
      </option>
      {/* Fetch unique players from localStorage */}
      {[...new Set(JSON.parse(localStorage.getItem('players') || '[]'))].map(
        (player, index) => (
          <option key={index} value={player}>
            {player}
          </option>
        )
      )}
    </select>

    <button
      onClick={() => {
        if (gameState.newPlayerName) {
          handlePlayerReplacement(); // Replace the player
        } else {
          alert('Please select a player to replace.');
        }
      }}
    >
      Replace Player
    </button>
  </div>
)}


                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

};

export default ScoreTicker;












