const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Create a match in a specific league
// Create a new match in a specific league
router.post('/:leagueId/matches', async (req, res) => {
    const { leagueId } = req.params;
    const { teams, startDate, place } = req.body;
  
    if (!teams || teams.length !== 2 || !startDate || !place) {
      return res.status(400).send('Teams, startDate, and place are required. Two teams must be provided.');
    }
  
    try {
      const start = new Date(startDate);
  
      // Default score to 0-0 when creating a match
      const defaultScore = {
        team1: 0,
        team2: 0
      };
  
      const docRef = await db.collection('leagues')
        .doc(leagueId)
        .collection('matches')
        .add({
          teams,
          startDate: start,
          score: defaultScore, // Automatically set the score to 0-0
          place,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
  
      res.status(201).send(`Match added with ID: ${docRef.id}`);
    } catch (error) {
      res.status(500).send(`Error adding match: ${error}`);
    }
  });

// Get all matches in a specific league
router.get('/:leagueId/matches', async (req, res) => {
  const { leagueId } = req.params;

  try {
    const matchesSnapshot = await db.collection('leagues').doc(leagueId).collection('matches').get();
    const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch team names for each match from the teams subcollection
    const matchesWithTeamNames = await Promise.all(matches.map(async (match) => {
      const team1Id = match.teams[0];
      const team2Id = match.teams[1];

      // Query the teams from the teams subcollection under the same league
      const team1Doc = await db.collection('leagues').doc(leagueId).collection('teams').doc(team1Id).get();
      const team2Doc = await db.collection('leagues').doc(leagueId).collection('teams').doc(team2Id).get();

      const team1Name = team1Doc.exists ? team1Doc.data().name : 'Unknown Team';
      const team2Name = team2Doc.exists ? team2Doc.data().name : 'Unknown Team';

      const startDate = match.startDate.toDate();
      const createdAt = match.createdAt.toDate();

      return {
        ...match,
        teams: {
          team1: { id: team1Id, name: team1Name },
          team2: { id: team2Id, name: team2Name }
        },
        startDate: startDate.toISOString(), 
        createdAt: createdAt.toISOString()
      };
    }));

    res.status(200).json(matchesWithTeamNames);
  } catch (error) {
    res.status(500).send(`Error fetching matches: ${error}`);
  }
});

module.exports = router;

