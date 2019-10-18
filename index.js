const electron = require('electron');
var request = require('request')
const { app, BrowserWindow, ipcMain, Menu, ClientRequest, session, powerSaveBlocker } = electron;
var config = require('./config.json')
var querystring = require('querystring');
const Sentry = require('@sentry/electron')
Sentry.init({dsn: 'https://baa4d45f52ac4c14a41c981b7bae0fa8@sentry.io/1726927'});
/* Load the HTTP library */
var http = require("http");
var appConfig = require('./appConfig.json')
var fs = require('fs')
var aes = require('aes-cross');
var AutoLaunch = require('auto-launch');
let mainWindow;

var spotiMuterAutoLauncher = new AutoLaunch({
    name: 'SpotiMuter'
});

/* Create an HTTP server to handle responses */

var authServer = http.createServer(function (request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Authorization Successful - This window will close automatically, if it does not in 3 seconds, please close this window.");
    response.end();
}).listen(8888);

//prevent app throttling / sleeping in background
app.commandLine.appendSwitch('disable-renderer-backgrounding')
const id = powerSaveBlocker.start('prevent-app-suspension');
console.log(id)

app.on('ready', () => {
    console.log(`I am ready @ ${Date()}`)
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false // prevent background sleeping
        }
    });
    mainWindow.setMenu(null)
    mainWindow.setAlwaysOnTop(appConfig.sticky)
    if (config.devMode === true) {
        // mainWindow.webContents.openDevTools()
        mainWindow.setResizable(true)
    } else if (config.devMode === false) {
        mainWindow.setResizable(false)
    }


    app.setLoginItemSettings({
        openAsHidden: true,
        openAtLogin: true
    })
    mainWindow.loadURL(`file://${__dirname}/main.html`)



    // var key = new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6]);
    // console.log(key)
    // fs.writeFile("bin.txt", key, "binary", function (err) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("The file was saved!");
    //         var enc = aes.encText(config.clientSecret, key)
    //         console.log(enc);
    //     }
    // });

    // mainWindow.webContents.send('codeDecode', aes.decText(config.clientSecret, key))

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


    // fs.readFile('bin.txt', function (err, key) {
    //     if (err) throw err;
    //     console.log(key);
    //     console.log(aes.decText(config.clientSecret, key))
    //     var clientSecret = aes.decText(config.clientSecret, key)
    //     mainWindow.webContents.send('secretDecode', clientSecret)
    // })

    ipcMain.on("windowOpenReq", (event, link) => { // listnes for auth window open request from main.js. Uses "link" which is the auth link to open a window

        var authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false }); // open auth window
        // var spotifyUrl = 'https://accounts.spotify.com/authorize?';
        // var authUrl = spotifyUrl + 'client_id=' + config.clientID + '&response_type=code' + `&redirect_uri=http://localhost:8888` + '&scope=' + config.scope + '&state' + state;
        console.log(link)
        authWindow.loadURL(link);
        authWindow.show();
        session.defaultSession.webRequest.onCompleted((details) => { //check if a page has finished loading
            // get the cookie after redirect from the page
            // console.log(details.webContentsId)
            // console.log(details)
            if (details.url.substring(0, 22) === "http://localhost:8888/") { // check if auth redirect site is loaded is complete
                var code = details.url.substring(details.url.indexOf("=") + 1, details.url.indexOf("&state"))

                mainWindow.webContents.send('codeCallback', code) // send the access code back to main.js where it is swapped into a access toke & a refresh token.
            }
        })
        ipcMain.on("authWindowCloseReq", (event) => { // after getting access & refresh token, index.js receives request from main.js to close the auth window.
            authWindow.close()
            mainWindow.webContents.send('authWindowCloseComplete')
            authServer.close();
        })
    })

    ipcMain.on("logoutReq", (event) => {
        var logoutWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });
        logoutWindow.loadURL('https://www.spotify.com/logout/');
        logoutWindow.show();
        session.defaultSession.webRequest.onCompleted((details) => { //check if a page has finished loading
            // get the cookie after redirect from the page
            // console.log(details.webContentsId)
            // console.log(details)
            console.log(details.url)
            if (details.url.length>23 && details.url.length<27 && details.url.length.indexOf("https://www.spotify.com")>=1) { // check if auth redirect site is loaded is complete
                logoutWindow.close()
            }
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

