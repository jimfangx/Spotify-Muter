var request = require('request')
const electron = require('electron')
const { ipcRenderer } = electron;
var config = require('./config.json')

//as soom as someone submits something, this triggers



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
ipcRenderer.on('authCode:sent', (event, code) => {
    // document.querySelector('#spotifyAuthSubmit').parentNode.removeChild(document.getElementById("spotifyAuthSubmit"))
    document.getElementById('success').innerHTML = "Auth successful!"
    console.log("trading")
    request({
        url: "https://accounts.spotify.com/api/token",
        body: {
            grant_type: "authorization_code",
            code: "code",
            redirect_uri: "http://localhost:8888"
            //https://medium.com/@davidjtomczyk/spotify-api-authorization-flow-with-react-and-rails-7f42845a43c
        },
        Headers: {
            authorization: config.authorization
        }, function(error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
        }
    })
})
 // Watching for submit event in form tags

    // ipcRenderer.on('duration:sent', (event, duration) => {
    //     document.querySelector('#result').innerHTML = `Video is ${duration} seconds`;
    // })



 // Watching for submit event in form tags


