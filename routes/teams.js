const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Create a new team in a specific league
router.post('/:leagueId/teams', async (req, res) => {
  const { leagueId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).send('Team name is required');
  }

  try {
    const teamRef = await db.collection('leagues').doc(leagueId).collection('teams').add({
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send(`Team added with ID: ${teamRef.id}`);
  } catch (error) {
    res.status(500).send(`Error adding team: ${error}`);
  }
});

// Get all teams in a specific league
router.get('/:leagueId/teams', async (req, res) => {
  const { leagueId } = req.params;

  try {
    const teamsSnapshot = await db.collection('leagues').doc(leagueId).collection('teams').get();
    const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).send(`Error fetching teams: ${error}`);
  }
});

module.exports = router;
