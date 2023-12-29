// auth.js
const axios = require('axios');
const querystring = require('querystring');

const CLIENT_ID = '07d50571ba844065abb616fcab08cf46'; // Replace with your Spotify Client ID
const CLIENT_SECRET = '316d132c272b45aeada70e1f18f41909'; // Replace with your Spotify Client Secret

// Function to get the Spotify access token
async function getAccessToken() {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const authResponse = await axios.post(
    'https://accounts.spotify.com/api/token',
    querystring.stringify({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return authResponse.data.access_token;
}

module.exports = {
  getAccessToken,
};
