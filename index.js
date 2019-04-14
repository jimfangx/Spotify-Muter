const electron = require('electron');
var request = require('request')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session } = electron;
var config = require('./config.json')
var querystring = require('querystring');
/* Load the HTTP library */
var http = require("http");

let mainWindow;



/* Create an HTTP server to handle responses */

http.createServer(function (request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Auth Successful - Please close this window.");
    response.end();
}).listen(8888);

app.on('ready', () => {
    console.log(`I am ready @ ${Date()}`)
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(`file://${__dirname}/main.html`)

    // const mainMenu = Menu.buildFromTemplate(menuTemplate);
    // Menu.setApplicationMenu(mainMenu)
    // ipcMain.on('authButtonPressed', (event, buttonPressed) => {
    //     console.log(buttonPressed)
    //     app.get('/login', function (req, res, config) {
    //         var scopes = 'user-read-currently-playing';
    //         var redirect_uri = "localhost:8888"
    //         res.redirect('https://accounts.spotify.com/authorize' +
    //             '?response_type=code' +
    //             '&client_id=' + config.clientID +
    //             (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    //             '&redirect_uri=' + encodeURIComponent(redirect_uri));
    //     });
    // })
    // ipcMain.on("oauth", (event, getToken) => {
    // var generateRandomString = function (length) {
    //     var text = '';
    //     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    //     for (var i = 0; i < length; i++) {
    //         text += possible.charAt(Math.floor(Math.random() * possible.length));
    //     }
    //     return text;
    // };
    // var state = generateRandomString(16);
    ipcMain.on("windowOpenReq", (event, link) => {

        var authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
        // var spotifyUrl = 'https://accounts.spotify.com/authorize?';
        // var authUrl = spotifyUrl + 'client_id=' + config.clientID + '&response_type=code' + `&redirect_uri=http://localhost:8888` + '&scope=' + config.scope + '&state' + state;
        console.log(link)
        authWindow.loadURL(link);
        authWindow.show();

        session.defaultSession.webRequest.onCompleted((details) => {
            // get the cookie after redirect from the page
            // console.log(details.webContentsId)
            if (details.url.substring(0, 28) === "https://example.com/callback") {
                var code = details.url.substring(details.url.indexOf("=") + 1, details.url.indexOf("&state"))

                mainWindow.webContents.send('codeCallback', code)
            }
        })
        ipcMain.on("authWindowCloseReq", (event) => {
            authWindow.close()
            mainWindow.webContents.send('authWindowCloseComplete')
        })
    })


    // request(authUrl, function (error, response, body) {
    //     console.log('error:', error); // Print the error if one occurred
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //     console.log('body:', body); // Print the HTML for the Google homepage.
    // })
    // console.log(authUrl)

})

// })


// const menuTemplate = [
//     {
//         label: 'File'
//     }
// ]

