require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const querystring = require("querystring");

app.get("/", (req, res) => {
    res.send("it should be working just fine");
});

app.get("/twice", (req, res) => {
    const data = {
        name: "androso", 
        isCool: true,
    }
    res.json(data);
});
app.get("/login", (req, res) => {
    // const queryParams = new URLSearchParams(`client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);
    const queryParams = new URLSearchParams([
        ["client_id", CLIENT_ID], 
        ["response_type", "code"],
        ["redirect_uri", REDIRECT_URI]
    ]);

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
})
app.get("/callback", (req, res) => {
    res.send("thank you for login in");
})

app.listen(PORT, () =>  { 
    console.log("all working just fine");
    console.log(`at port ${PORT}`);
});