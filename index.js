const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const port = process.env.PORT || 3000;

const secretKey = uuid.v4();

const db = require('./config/config'); // Require the database connection



app.use(bodyParser.json());

app.use(cors());


function authenticateToken(req, res, next) {
  
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied. Invalid token.' });
    }

    
    req.user = user;
    // console.log(user);
    next();
  });
}



  // POST /auth: Authenticate users using JWT by providing a username and password
  app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    // console.log(username);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');


    
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }

      if (results.length === 1) {
        const user = results[0];
        const token = jwt.sign({ id: user.id, username: user.username, latitude: user.latitude, longitude: user.longitude }, secretKey);
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid username or password.' });
      }
    });
  });

  
  // route for accessing tourist spots
  app.get('/spots',authenticateToken, (req, res) => {
    const query = 'SELECT name, accessible_by_cycling FROM tourist_spots';

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }
  
      const simplifiedSpots = results.map((spot) => ({
        name: spot.name,
        accessible_by_cycling: spot.accessible_by_cycling,
      }));
  
      res.json(simplifiedSpots);
    });

  });

  // GET /spots/:spotName: Provide detailed information about a specific tourist spot
  app.get('/spots/:spotName', authenticateToken, (req, res) => {
    const spotName = req.params.spotName;
    const query = 'SELECT name, latitude, longitude, accessible_by_cycling FROM tourist_spots WHERE name = ?';
    db.query(query, [spotName], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }

      if (results.length === 1) {
        const spot = results[0];
        res.json(spot);
      } else {
        res.status(404).json({ error: 'Tourist spot not found.' });
      }
    });
  });

  
  
  
  // POST /calculate: Accept user input for cycling time estimation
  app.post('/calculate', authenticateToken, (req, res) => {
    
    const { latitude, longitude, selectedSpot, cyclingSpeed, dailyCyclingHours } = req.body;

    
    if (!latitude || !longitude || !selectedSpot || !cyclingSpeed || !dailyCyclingHours) {
      return res.status(400).json({ error: 'All input fields are required.' });
    }

    
    const query = 'SELECT accessible_by_cycling, latitude, longitude FROM tourist_spots WHERE name = ?';
    try {
      db.query(query, [selectedSpot], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error.' });
        }
  
        if (results.length === 1) {
          const isAccessible = results[0].accessible_by_cycling === 1;
  
          if (isAccessible) {
            
            const earthRadiusKm = 6371; // Radius of the Earth in kilometers
  
            function calculateDistance(lat1, lon1, lat2, lon2) {
              const dLat = (lat2 - lat1) * (Math.PI / 180);
              const dLon = (lon2 - lon1) * (Math.PI / 180);
  
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) *
                  Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
  
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return earthRadiusKm * c;
            }
  
            
            const userLatitude = parseFloat(latitude);
            const userLongitude = parseFloat(longitude);
  
            
            const query = 'SELECT latitude, longitude FROM tourist_spots WHERE name = ?';
            db.query(query, [selectedSpot], (err, results) => {
              if (err) {
                return res.status(500).json({ error: 'Database error.' });
              }
  
              if (results.length === 1) {
                const { latitude, longitude } = results[0];
  
                
                const distance = calculateDistance(
                  userLatitude,
                  userLongitude,
                  latitude,
                  longitude
                ); //total distance
  
                
                const estimatedTime = distance / cyclingSpeed; //time in hours
                const estimatedDays = estimatedTime / dailyCyclingHours //total days
  
                res.json({ distance,estimatedTime,estimatedDays });
              } else {
                res.status(404).json({ error: 'Tourist spot not found.' });
              }
            });
          } else {
            res.json({ error: 'This tourist spot is not accessible for cycling.' });
          }
        } else {
          res.status(404).json({ error: 'Tourist spot not found.' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
    
  });


  
  // GET /estimate: Return the estimated time it would take to cycle from the user's location to the chosen tourist spot
  app.get('/estimate', authenticateToken, (req, res) => {
    
    const { selectedSpot, cyclingSpeed, dailyCyclingHours } = req.query;

    
    if (!selectedSpot || !cyclingSpeed || !dailyCyclingHours) {
      return res.status(400).json({ error: 'All input fields are required.' });
    }

    
    const query = 'SELECT latitude, longitude FROM tourist_spots WHERE name = ?';
    db.query(query, [selectedSpot], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }

      if (results.length === 1) {
        const { latitude, longitude } = results[0];

        
        const earthRadiusKm = 6371; 

        function calculateDistance(lat1, lon1, lat2, lon2) {
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
              Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return earthRadiusKm * c;
        }

        
        const distance = calculateDistance(
          req.user.latitude, 
          req.user.longitude, 
          latitude, 
          longitude 
        ); //total distance
          // console.log(distance);
        const estimatedTime = distance / cyclingSpeed; //time in hour
        const estimatedDays = estimatedTime / dailyCyclingHours //total days

        res.json({distance, estimatedTime, estimatedDays });
      } else {
        res.status(404).json({ error: 'Tourist spot not found.' });
      }
    });
  });




  
  // Sample route for error handling (you should implement proper error handling)
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


