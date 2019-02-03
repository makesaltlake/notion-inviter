const express = require('express')

const PORT = 16710;

const app = express();

app.get('/', (req, res) => res.send("it's alive!!!"));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));