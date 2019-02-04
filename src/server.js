const express = require('express');
const notion = require('./notion.js');

const PORT = parseInt(process.env.PORT || 16710);

const app = express();

app.get('/', (req, res) => res.send("it's alive!!!"));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
