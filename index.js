const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();  // Load environment variables from .env file if needed

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

// Sample route
app.get('/test', (req, res) => {
  res.send('API is working correctly');
});

// Your actual routes
const leaguesRouter = require('./routes/leagues');
const teamsRouter = require('./routes/teams');
const matchesRouter = require('./routes/matches');

app.use('/leagues', leaguesRouter);
app.use('/teams', teamsRouter);
app.use('/matches', matchesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
