var request = require('request')
const electron = require('electron')
const { ipcRenderer } = electron;
var config = require('./config.json')
var SpotifyWebApi = require('spotify-web-api-node');
var schedule = require('node-schedule');
var robot = require("robotjs");
// var { getVolume, setVolume } = require('sysvol');  
// var robot = require("robotjs"); https://stackoverflow.com/questions/11178372/is-it-possible-to-simulate-keyboard-mouse-event-in-nodejs

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
var state = generateRandomString(16);

var currentPlaying = ""
var muted = false

var scopes = ['user-read-currently-playing'], //part of auth process
    redirectUri = 'http://localhost:8888',
    clientId = '936ec326b81340c5bc4beb066f267d70',
    state = state;

var spotifyApi = new SpotifyWebApi({ //Spotify Wrapper init according to https://github.com/thelinmichael/spotify-web-api-node#usage
    clientId: clientId,
    clientSecret: config.clientSecret,
    redirectUri: redirectUri

});
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state); // Start authorization process to get access token. --> https://github.com/thelinmichael/spotify-web-api-node#authorization || create auth url using wrapper init consturctor data. 
// var currentSysVol = getvolume

document.getElementById('status').innerHTML = "Current Status: Authorizing..."
// document.getElementById('test').innerHTML = authorizeURL
ipcRenderer.send('windowOpenReq', authorizeURL) // requiest main process to open auth window with the auth url in var authorizeURL

ipcRenderer.on('codeCallback', (event, code) => { // received after auth success then: 
    // console.log(code)

    spotifyApi.authorizationCodeGrant(code).then( // then: gets access & refresh token using the code returned.
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            document.getElementById("status").innerHTML = "Current Status: Authorization Successful!"
            ipcRenderer.send("authWindowCloseReq") // after getting access & refresh token, sends request to close auth window to index.js

            //add wait for a few second to 1 min then changve status to "monitoring & blocking"

            // spotifyApi.getMe()
            //     .then(function (data) {
            //         console.log('Some information about the authenticated user', data.body);
            //     }, function (err) {
            //         console.log('Something went wrong!', err);
            //     });

            // Use a var to store current playing (ad or song name), if it new one changes from what is in variable, execute mute or unmute (so insted of every 3 seconds it runs every song change). Do in getPlaying() but outside of getmycurrentplayingtrack call.
            let previousProgress = 0
            let currentProgress = 0

            // spotifyApi.getMyCurrentPlayingTrack({

            // }).then(function (data) { // [0] is old
            //     previousProgress = data.body.progress_ms;
            // })

            function getPlaying() { // get current playing every 3 seconds, and updates HTML.

                spotifyApi.getMyCurrentPlayingTrack({ // Currently throwing 401
                })
                    .then(function (data) { // need to be able to detect an ad playing and show it -- done
                        // Output items
                        console.log("Now Playing: ", data);

                        currentProgress = data.body.progress_ms;

                        console.log(`previous progress: ${previousProgress}`)
                        console.log(`current progress: ${currentProgress}`)
                        
                        console.log(`-------------------------------------------`)

                        try {
                            if (data.statusCode == 204) { // check if user is not playing anything
                                document.getElementById('nowPlaying').innerHTML = `Nothing is playing`
                            } else {


                                document.getElementById('nowPlaying').innerHTML = `Now Playing: ${data.body.item.name}`
                                // robot.keyTap("audio_mute");
                                if (data.body.item.name != "ad" && muted === true) { //unmute if ad stops playing
                                    robot.keyTap("audio_mute");
                                    muted = false
                                }
                                console.log(`muted1: ${muted}`)
                            }


                        } catch (err) {
                            document.getElementById('nowPlaying').innerHTML = `Now Playing: ${data.body.currently_playing_type}`
                            if (data.body.currently_playing_type === "ad" && muted === false && (previousProgress != currentProgress)) { //mute if ad starts
                                robot.keyTap("audio_mute");
                                muted = true
                            }
                            if (previousProgress == currentProgress && muted === true) { // unmute if paused during ad
                                robot.keyTap("audio_mute")
                                muted = false
                            }
                            console.log(`muted2: ${muted}`)
                            // robot.keyTap("audio_mute");
                            // currentSysVol=sysvol.getVolume()
                            // sysvol.setVolume(0).then(() => {
                            //     document.getElementById('blockingStatus').innerHTML = "Yes"
                            // })
                        }

                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });
                previousProgress = currentProgress;
            }
            setInterval(getPlaying, 1 * 1000) //end of get playing

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


