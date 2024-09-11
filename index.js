const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Path to your service account key

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Import route modules
const leaguesRoutes = require('./routes/leagues');
const teamsRoutes = require('./routes/teams');

// Use route modules
app.use('/leagues', leaguesRoutes);
app.use('/teams', teamsRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
