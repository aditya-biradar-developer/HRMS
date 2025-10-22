import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const distPath = path.join(__dirname, 'dist');
  const exists = fs.existsSync(distPath);
  
  res.status(200).json({ 
    status: 'healthy',
    service: 'frontend',
    environment: process.env.NODE_ENV || 'development',
    distExists: exists,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  fallthrough: true,
  index: false // Let our catch-all handle index.html
}));

// Handle client-side routing by serving index.html for all routes
app.get('*', (req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found in dist directory');
    return res.status(500).send('Server configuration error - Build files not found');
  }

  res.sendFile(indexPath, err => {
    if (err) {
      console.error('Error sending index.html:', err);
      next(err);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log('🚀 Frontend server starting...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Port:', PORT);
  console.log('Current directory:', __dirname);
  console.log('Dist path exists:', fs.existsSync(path.join(__dirname, 'dist')));
  console.log('Server is ready!');
});
