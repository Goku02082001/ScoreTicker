import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeamSelection = () => {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tossWinner, setTossWinner] = useState("");
  const [tossChoice, setTossChoice] = useState("");
  const [overs, setOvers] = useState(0);
  const [error, setError] = useState(""); // State for error message
  const navigate = useNavigate();

  // Function to allow only alphabet characters and limit to 50 characters
  const handleTeamNameChange = (setter) => (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50); // Remove non-alphabetic characters and limit to 50
    setter(value);
  };
  const handleSubmit = async () => {
    // Trim spaces from inputs
    const trimmedTeamA = teamA.trim();
    const trimmedTeamB = teamB.trim();

    // Validate that all fields are filled and team names do not exceed 50 characters
    if (!trimmedTeamA || !trimmedTeamB || !tossWinner || !tossChoice || !overs) {
      setError("All fields are required. Please fill them out.");
      return;
    }

    if (trimmedTeamA.length > 50 || trimmedTeamB.length > 50) {
      setError("Team names must be 50 characters or fewer.");
      return;
    }

    setError(""); // Clear error if validation passes

    // Save trimmed values to localStorage
    localStorage.setItem('teamA', trimmedTeamA);
    localStorage.setItem('teamB', trimmedTeamB);
    localStorage.setItem('overs', overs);

    await fetch('https://scoreticker-6.onrender.com/set-teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamA: { name: trimmedTeamA },
        teamB: { name: trimmedTeamB },
        tossWinner,
        tossChoice,
        overs,
      }),
    });
    alert("Data saved successfully!");
    navigate('/player-selection');
  };

  
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Select Teams, Toss, and Overs</h2>

      {/* Error message display */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Teams' Names Section */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Teams' Names</h3>
        <div style={styles.teamInputContainer}>
          <input
            style={styles.input}
            placeholder="Host Team"
            value={teamA}
            onChange={handleTeamNameChange(setTeamA)}
          />
          <input
            style={styles.input}
            placeholder="Visitor Team"
            value={teamB}
            onChange={handleTeamNameChange(setTeamB)}
          />
        </div>
      </div>

      {/* Toss Won by Section */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Toss Won by</h3>
        <div style={styles.optionContainer}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="tossWinner"
              value={teamA}
              onChange={(e) => setTossWinner(e.target.value)}
            />
            {teamA || "Host Team"}
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="tossWinner"
              value={teamB}
              onChange={(e) => setTossWinner(e.target.value)}
            />
            {teamB || "Visitor Team"}
          </label>
        </div>
      </div>

      {/* Opted to Section */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Opted to</h3>
        <div style={styles.optionContainer}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="tossChoice"
              value="Bat"
              onChange={(e) => setTossChoice(e.target.value)}
            />
            Bat
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="tossChoice"
              value="Bowl"
              onChange={(e) => setTossChoice(e.target.value)}
            />
            Bowl
          </label>
        </div>
      </div>

      {/* Overs Input Section */}
      <div style={styles.section}>
        <h3 style={styles.subHeading}>Select Overs</h3>
        <div style={styles.oversContainer}>
          <input
            type="number"
            style={styles.oversInput}
            placeholder="Number of Overs"
            value={overs}
            min="1" 
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value, 10) || 1); // Ensure the value is at least 1
              setOvers(value);
            }}
          />
        </div>
      </div>

      <button style={styles.button} onClick={handleSubmit}>Start Match</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 'auto',
    backgroundColor: '#f0f8ff',
    padding: '20px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    marginTop: '40px',
  },
  error: {
    color: 'red',
    fontSize: '16px',
    marginBottom: '20px',
  },
  section: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  subHeading: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '10px',
  },
  teamInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
    backgroundColor: '#d1e7dd',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    minHeight: '90px',
  },
  input: {
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#ffd966',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '10px',
  },
  radioLabel: {
    marginRight: '15px',
  },
  oversContainer: {
    display: 'flex',
    width: '60%',
    justifyContent: 'center',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  oversInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '18px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: '#fff',
    transition: 'background-color 0.3s ease',
  },
};

export default TeamSelection;



  


  
