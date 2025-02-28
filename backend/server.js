require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import routes
const initiativRoutes = require('./routes/initiativRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Funksjon for å koble til MongoDB
async function connectToDatabase() {
  try {
    // Bruk MongoDB Memory Server hvis vi ikke har en lokal MongoDB-installasjon
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
      console.log('Bruker MongoDB Memory Server...');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB Memory Server tilkoblet på', mongoUri);
    } else {
      // Bruk den konfigurerte URI-en hvis den finnes
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB tilkoblet på', process.env.MONGODB_URI);
    }
  } catch (err) {
    console.error('MongoDB tilkoblingsfeil:', err);
    process.exit(1);
  }
}

// Koble til databasen og start serveren
connectToDatabase().then(() => {
  // Routes
  app.use('/api/initiativer', initiativRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Serverfeil',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Intern serverfeil'
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server kjører på port ${PORT}`);
  });
}); 