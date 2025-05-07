const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Match = require('./Models/Match');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://score-ticker-cm2m.vercel.app", 
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "https://score-ticker-cm2m.vercel.app", methods: ["GET", "POST"] }));
app.use(express.json());

mongoose.connect("mongodb+srv://shyamolroy12353:Gaurav02@cluster0.5vkc2jw.mongodb.net/")
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("MongoDB connection error:", error));

// Add or update players
app.post('/add-players', async (req, res) => {
  const { striker, nonStriker, bowler } = req.body;

  if (!striker || !nonStriker || !bowler) {
    return res.status(400).json({ message: 'Striker, non-striker, and bowler names are required' });
  }

  try {
    const match = await Match.findOne().sort({ _id: -1 });
    if (!match) return res.status(404).json({ message: 'No match found' });

    match.striker = striker;
    match.nonStriker = nonStriker;
    match.bowler = bowler;

    await match.save();

    io.emit('playersUpdated', { striker, nonStriker, bowler });

    res.status(200).json({ message: 'Players added successfully', players: { striker, nonStriker, bowler } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/set-teams', async (req, res) => {
  const { teamA, teamB, tossWinner, tossChoice, overs } = req.body;

  if (!teamA || !teamB || !tossWinner || !tossChoice || !overs) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const match = new Match({
      teamA,
      teamB,
      tossWinner,
      tossChoice,
      overs
    });

    await match.save();

    io.emit('matchDataUpdated', { teamA, teamB, tossWinner, tossChoice, overs });

    res.status(201).json({ message: 'Match data saved successfully', match });
  } catch (error) {
    console.error("Error saving match data:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add dismissal details
app.post('/add-dismissal', async (req, res) => {
  const { playerOut, dismissalType, bowler, runs } = req.body;

  if (!playerOut || !dismissalType || !bowler || typeof runs !== 'number') {
    return res.status(400).json({ message: 'All fields are required: playerOut, dismissalType, bowler, and runs' });
  }

  try {
    const match = await Match.findOne().sort({ _id: -1 });
    if (!match) return res.status(404).json({ message: 'No match found' });

    const dismissal = { playerOut, dismissalType, bowler, runs };
    match.dismissals.push(dismissal);

    await match.save();

    io.emit('dismissalAdded', dismissal);

    res.status(200).json({ message: 'Dismissal added successfully', dismissal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Socket.io connection and initial data fetch
io.on('connection', async (socket) => {
  console.log('A user connected');

  try {
    const latestMatch = await Match.findOne().sort({ _id: -1 }).limit(1);

    if (latestMatch) {
      socket.emit('initialData', {
        teamA: latestMatch.teamA.name,
        teamB: latestMatch.teamB.name,
        tossWinner: latestMatch.tossWinner,
        tossChoice: latestMatch.tossChoice,
        striker: latestMatch.striker,
        nonStriker: latestMatch.nonStriker,
        score: latestMatch.score,
        dismissals: latestMatch.dismissals
      });
    } else {
      socket.emit('initialData', { message: "No match data available" });
    }
  } catch (error) {
    console.error('Error fetching initial match data:', error.message);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => console.log('Server is running on http://localhost:3000'));
