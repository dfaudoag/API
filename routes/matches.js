const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Create a match in a specific league
// Create a new match in a specific league
router.post('/:leagueId/matches', async (req, res) => {
    const { leagueId } = req.params;
    const { teams, startDate, place, score } = req.body;

    // Validate teams, startDate, and place
    if (!teams || teams.length !== 2 || !startDate || !place) {
      return res.status(400).send('Teams, startDate, and place are required. Two teams must be provided.');
    }

    // Validate score if provided
    if (score && (typeof score.team1 !== 'number' || typeof score.team2 !== 'number')) {
      return res.status(400).send('Score must include valid numbers for both teams.');
    }

    try {
      const start = new Date(startDate);

      // Default score to 0-0 if not provided
      const matchScore = score || {
        team1: 0,
        team2: 0
      };

      const docRef = await db.collection('leagues')
        .doc(leagueId)
        .collection('matches')
        .add({
          teams,
          startDate: start,
          score: matchScore, // Use provided score or default to 0-0
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

router.get('/:leagueId/matches/upcoming', async (req, res) => {
    const { leagueId } = req.params;
    const now = new Date();

    try {
        const matchesSnapshot = await db.collection('leagues').doc(leagueId).collection('matches')
            .where('startDate', '>', now)
            .get();
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
        res.status(500).send(`Error fetching upcoming matches: ${error}`);
    }
});

router.get('/:leagueId/matches/finished', async (req, res) => {
    const { leagueId } = req.params;
    const now = new Date();

    try {
        const matchesSnapshot = await db.collection('leagues').doc(leagueId).collection('matches')
            .where('startDate', '<', now)
            .get();
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
        res.status(500).send(`Error fetching upcoming matches: ${error}`);
    }
});

// Update a matches date, score or place in a specific league
router.put('/:leagueId/matches/:matchId', async (req, res) => {
    const { leagueId, matchId } = req.params;
    const { startDate, score, place } = req.body;
  
    // Validate input
    if (!startDate && !score && !place) {
      return res.status(400).send('At least one of startDate, score, or place must be provided.');
    }
  
    try {
      const matchRef = db.collection('leagues').doc(leagueId).collection('matches').doc(matchId);
  
      // Prepare update object
      const updateData = {};
      if (startDate) {
        updateData.startDate = new Date(startDate); // Convert to Date object
      }
      if (score) {
        updateData.score = score; // Assume score is an object like { team1: 2, team2: 3 }
      }
      if (place) {
        updateData.place = place; // Update place
      }
  
      // Update match
      await matchRef.update(updateData);
  
      res.status(200).send(`Match ${matchId} updated`);
    } catch (error) {
      res.status(500).send(`Error updating match: ${error}`);
    }
  });
  
module.exports = router;

