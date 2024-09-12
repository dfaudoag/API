const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Create a new league
router.post('/', async (req, res) => {
    const { name, description, startDate, endDate, maxTeams } = req.body;
  
    if (!name || !startDate || !endDate) {
      return res.status(400).send('Name, startDate, and endDate are required');
    }
  
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      // Check if the dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).send('Invalid startDate or endDate format');
      }
  
      const docRef = await db.collection('leagues').add({
        name,
        description,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        startDate: start, // Store as Date object
        endDate: end,     // Store as Date object
        maxTeams
      });
  
      res.status(201).send(`League added with ID: ${docRef.id}`);
    } catch (error) {
      res.status(500).send(`Error adding league: ${error}`);
    }
  });
  

// Get all leagues
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('leagues').get();
    const leagues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(leagues);
  } catch (error) {
    res.status(500).send(`Error fetching leagues: ${error}`);
  }
});

// Update a league
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await db.collection('leagues').doc(id).update({ name, description });
    res.status(200).send(`League ${id} updated`);
  } catch (error) {
    res.status(500).send(`Error updating league: ${error}`);
  }
});

// Delete a league
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('leagues').doc(id).delete();
    res.status(200).send(`League ${id} deleted`);
  } catch (error) {
    res.status(500).send(`Error deleting league: ${error}`);
  }
});

module.exports = router;
