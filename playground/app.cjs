// app.js

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Express to use EJS and body-parser
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route for the home page with form
app.get('/', async (req, res) => {
  try {
    const module = await import('../src/NodeHiveClient.js');
    const NodeHiveClient = module.NodeHiveClient;
    const client = new NodeHiveClient(process.env.NODEHIVE_URL);
    const contentTypes = await client.getContentTypes();
    console.log(contentTypes.data);

    // Render the index page and pass the content types to the view
    res.render('index', { contentTypes });
  } catch (error) {
    console.error('Error loading content types:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Dynamic route for content types
app.get('/content/:contentType', async (req, res) => {
  try {
    const { contentType } = req.params;
    const module = await import('../src/NodeHiveClient.js');
    const NodeHiveClient = module.NodeHiveClient;
    const client = new NodeHiveClient(process.env.NODEHIVE_URL);
    
    const contentTypes = await client.getContentTypes();

    const items = await client.getNodes(contentType, { page: { limit: 10 } });
    // Render the view with the items and content type
    res.render('contentType', { items: items.data, contentType, contentTypes });
  } catch (error) {
    console.error('Error loading content type:', error);
    res.status(500).render('error', { error: error.message });
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
