require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const stateKey = "spotify_auth_state";
const axios = require('axios');
const querystring = require("querystring");

app.get("/", (req, res) => {
    res.send("it should be working just fine");
});

const generateRandomString = length => {
    let text = "";
    const possibleCombinations = 
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possibleCombinations.charAt(Math.floor(Math.random() * possibleCombinations.length));
    }
    return text;
}

app.get("/login", (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email';
    const queryParams = new URLSearchParams([
        ["client_id", CLIENT_ID], 
        ["response_type", "code"],
        ["redirect_uri", REDIRECT_URI],
        ["state", state],
        ["scope", scope]
    ]);

    res.cookie(stateKey, state);
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
})
app.get("/callback",  (req, res) => {
    const code = req.query.code || null;
    axios({
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        data: new URLSearchParams([
            ["grant_type", "authorization_code"],
            ["code", code],
            ["redirect_uri", REDIRECT_URI]
        ]),
        headers: {
            "content_type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
    }).then(response => {
        if(response.status === 200) {
            const {access_token, token_type} = response.data;
            const {refresh_token} = response.data;
            // axios.get("https://api.spotify.com/v1/me", {
            //     headers: {
            //         Authorization: `${token_type} ${access_token}`
            //     }
            // }).then(response => {
            //     res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`)
            // }).catch(error => {
            //     res.send(error);
            // })
            axios.get(`http://localhost:8888/refresh_token?refresh_token=${refresh_token}`)
            .then(response => {
                res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
            })
            .catch(error => {
                res.send(error);
            })
        } else {
            res.send(response);
        }
    }).catch(err => {
        res.send(err)
    })
})
app.get("/refresh_token", (req, res) => {
    const {refresh_token} = req.query;

    axios({
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        data: new URLSearchParams([
            ["grant_type", "refresh_token"],
            ["refresh_token", refresh_token]
        ]),
        headers: {
            "content_type":  "application/x-www-form-urlencoded",
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
    }).then(response => {
        res.send(response.data);
    }).catch(error => {
        res.send(error);
    })
})
app.listen(PORT, () =>  { 
    console.log("all working just fine");
    console.log(`at port ${PORT}`);
});