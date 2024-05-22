const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Enable CORS for all routes
app.use(cors());


app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (file) {
    const fileInfo = { filename: file.filename, originalname: file.originalname };
    const socketId = req.body.socketId; // Assume we get the socketId from the request body
    io.to(socketId).emit('mp3', fileInfo); // Send file info only to the uploader
    res.status(200).send('File uploaded successfully');
  } else {
    res.status(400).send('No file uploaded');
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
