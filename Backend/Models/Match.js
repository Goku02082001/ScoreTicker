// models/Match.js
const mongoose = require('mongoose');

// Define Player schema
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },  // e.g., "Striker", "Non-Striker", "Bowler"
});

// Define Team schema
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  players: { type: [playerSchema], default: [] }
});

// Define Dismissal schema
const dismissalSchema = new mongoose.Schema({
  playerOut: { type: String, required: true },
  dismissalType: { type: String, required: true }, // e.g., "Caught Out", "Bowled", "LBW"
  bowler: { type: String, required: true },
  runs: { type: Number, required: true } // Runs scored by the player before dismissal
});

// Define Match schema
const matchSchema = new mongoose.Schema({
  teamA: { type: teamSchema, required: true },
  teamB: { type: teamSchema, required: true },
  tossWinner: { type: String, required: true },
  tossChoice: { type: String, required: true },
  overs: { type: String, required: true },
  score: { type: Number, default: 0 },
  striker: { type: String },
  nonStriker: { type: String },
  bowler: { type: String }, // Current bowler's name
  date: { type: Date, default: Date.now },
  dismissals: { type: [dismissalSchema], default: [] } // Array to store each dismissal event
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
