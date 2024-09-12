const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

// Import route files
const leaguesRouter = require('./routes/leagues');
const teamsRouter = require('./routes/teams'); 
const matchesRouter = require('./routes/matches'); 

// Use routes
app.use('/leagues', leaguesRouter);
app.use('/leagues', teamsRouter);  
app.use('/leagues', matchesRouter); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
