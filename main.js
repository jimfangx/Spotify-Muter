var request = require('request')
const electron = require('electron')
const { ipcRenderer } = electron;
var config = require('./config.json')
var SpotifyWebApi = require('spotify-web-api-node');
var schedule = require('node-schedule');

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
var state = generateRandomString(16);

var scopes = ['user-read-currently-playing'],
    redirectUri = 'https://example.com/callback',
    clientId = '936ec326b81340c5bc4beb066f267d70',
    state = state;

var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: config.clientSecret,
    redirectUri: redirectUri

});
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
document.getElementById('status').innerHTML = "Current Status: Authorizing..."
// document.getElementById('test').innerHTML = authorizeURL
ipcRenderer.send('windowOpenReq', authorizeURL)

ipcRenderer.on('codeCallback', (event, code) => {
    // console.log(code)

    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            document.getElementById("status").innerHTML = "Current Status: Authorization Successful!"
            ipcRenderer.send("authWindowCloseReq")
            //add wait for a few second to 1 min then changve status to "monitoring & blocking"

            // spotifyApi.getMe()
            //     .then(function (data) {
            //         console.log('Some information about the authenticated user', data.body);
            //     }, function (err) {
            //         console.log('Something went wrong!', err);
            //     });
            function getPlaying() {
                spotifyApi.getMyCurrentPlayingTrack({ // Currently throwing 401
                })
                    .then(function (data) { // need to be able to detect an ad playing and show it
                        // Output items
                        console.log("Now Playing: ", data);
                        document.getElementById('nowPlaying').innerHTML = `Now Playing: ${data.body.item.name}`

                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });
            }
            setInterval(getPlaying, 3*1000)
        },
        function (err) {
            console.log('Something went wrong!', err);
        },



    );


    // schedule.scheduleJob('*/2 */1 * * *', function () {

    // spotifyApi.refreshAccessToken().then(
    //     function (data) {
    //         console.log('The access token has been refreshed!');

    //         // Save the access token so that it's used in future calls
    //         spotifyApi.setAccessToken(data.body['access_token']);
    //     },
    //     function (err) {
    //         console.log('Could not refresh access token', err);
    //     }
    // );

    // })


    // spotifyApi.getMyCurrentPlayingTrack({ // Currently throwing 401
    // })
    //     .then(function (data) {
    //         // Output items
    //         console.log("Now Playing: ", data.body.name);
    //     }, function (err) {
    //         console.log('Something went wrong!', err);
    //     });



})
console.log("I AM OUT OF THE CALLBACK FUNC")

//as soom as someone submits something, this triggers


// credentials are optional


// var authWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     show: false,
//     'node-integration': false,
//     'web-security': false
// });

// document.querySelector('#spotifyAuthSubmit').addEventListener('click', (event) => {
//     ipcRenderer.send('oauth', 'getToken')
//     console.log("sent")
// })
// ipcRenderer.on('authCode:sent', (event, code) => {
//     // document.querySelector('#spotifyAuthSubmit').parentNode.removeChild(document.getElementById("spotifyAuthSubmit"))
//     document.getElementById('success').innerHTML = "Auth successful!"
//     console.log("trading")
//     request({
//         url: "https://accounts.spotify.com/api/token",
//         body: {
//             grant_type: "authorization_code",
//             code: "code",
//             redirect_uri: "http://localhost:8888"
//             //https://medium.com/@davidjtomczyk/spotify-api-authorization-flow-with-react-and-rails-7f42845a43c
//         },
//         Headers: {
//             authorization: config.authorization
//         }, function(error, response, body) {
//             console.log('error:', error); // Print the error if one occurred
//             console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//             console.log('body:', body); // Print the HTML for the Google homepage.
//         }
//     })
// })
 // Watching for submit event in form tags

    // ipcRenderer.on('duration:sent', (event, duration) => {
    //     document.querySelector('#result').innerHTML = `Video is ${duration} seconds`;
    // })



 // Watching for submit event in form tags


