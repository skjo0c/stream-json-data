import express from 'express';

const app = express();
const PORT = 3000;

// Increase payload limit for large JSON
app.use(express.json({ limit: '2mb' }));

// Store chunks temporarily
let assembledData = '';

app.post('/api/upload', (req, res) => {
  try {
    const { chunk } = req.body;
    assembledData += chunk;
    res.status(200).json({ message: 'Chunk received successfully' });
  } catch (error) {
    console.error('Error processing chunk:', error);
    res.status(500).json({ error: 'Failed to process data chunk' });
  }
});

app.post('/api/upload/complete', (req, res) => {
  try {
    // Parse the complete JSON data
    const finalData = JSON.parse(assembledData);
    
    // Here you would typically:
    // 1. Validate the complete object
    // 2. Store it in a database
    // 3. Process it as needed
    
    // Reset the assembled data
    assembledData = '';
    
    res.status(200).json({ message: 'Upload completed successfully' });
  } catch (error) {
    console.error('Error completing upload:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

// Optional: Endpoint to retrieve processed data
app.get('/api/data', (req, res) => {
  try {
    const data = assembledData ? JSON.parse(assembledData) : null;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});