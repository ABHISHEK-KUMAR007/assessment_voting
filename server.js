require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const { createPinataClient } = require('@pinata/sdk');

const app = express();

// Initialize Pinata Client
const pinata = createPinataClient({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

app.use(bodyParser.json());

app.post('/upload-to-pinata', async (req, res) => {
    const { voterData } = req.body;

    try {
        const options = {
            pinataMetadata: { name: 'Voter Data' },
            pinataOptions: { cidVersion: 1 },
        };

        const result = await pinata.pinJSONToIPFS(voterData, options);
        res.status(200).json({ success: true, ipfsHash: result.IpfsHash });
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
