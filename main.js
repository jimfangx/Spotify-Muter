var fs = require('fs');
var config = require('./config.json')
var filePath = ""
const Sentry = require('@sentry/electron')
Sentry.init({ dsn: 'https://baa4d45f52ac4c14a41c981b7bae0fa8@sentry.io/1726927' });

if (config.devMode === true) {
    filePath = "bin.bin"
}
else if (process.platform === "win32") {
    filePath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.exe")) + "resources\\app\\bin.bin"
} else if (process.platform === "darwin") {
    filePath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.app")) + "SpotiMuter.app/contents/resources/app/bin.bin"
}
// console.log(filePath)
fs.readFile(filePath, function (err, key) {
    // DEV bin.bin
    // WIN ./resources/app/bin.bin ./SpotiMuter-win32-x64
    // MAC ./contents/resources/app/bin.bin
    // /Users/jim/Documents/Spotify Muter/spotify-muter-darwin-x64/spotify-muter.app/Contents/Resources/app/bin.bin (spotify-muter.app)


    // TODO: Fix welcome msg position (not completely in the middle)
    // Add [Not playing on current device] length in to current size changer algorithm
    // Bridge current progress_ms

    var request = require('request')
    const electron = require('electron')
    const { ipcRenderer } = electron;
    // dev ./config.json
    var appConfig = require('./appConfig.json')
    var SpotifyWebApi = require('spotify-web-api-node');
    var schedule = require('node-schedule');
    var robot = require("robotjs"); //macro for non win32
    const nircmd = require('nircmd'); //macro for win32
    const os = require('os');
    var aes = require('aes-cross');
    var Vibrant = require('node-vibrant')
    const { exec } = require('child_process');
    var cmd = require('node-cmd');
    const loudness = require('mwl-loudness')
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
    const doExec = (cmd, opts = {}) => {
        return new Promise((resolve, reject) => {
            exec(cmd, opts, (err, stdout, stderr) => {
                if (err) return reject({ stdout, stderr });
                resolve(stdout);
            });
        });
    };
    var state = generateRandomString(16);
    // fs.readFile('/etc/passwd', function (err, data) {
    //     if (err) throw err;
    //     console.log(data);
    // });
    // var enc = aes.encText(config.clientSecret, key)
    // console.log('enc:%s', enc);
    // var dec = aes.decText(enc, key)
    // console.log('dec:%s', dec);
    // var currentPlaying = ""
    var tokenExpTime;
    var numberOfTimesUpdated = 0;
    var muted = false
    var playingOnCurrentDevice = false;
    var adholderPath = ""
    var placeholderpath = ""
    var backgroundPath = ""
    var apiRequestTime = 1 * 1000;
    var apiRequestNumberDevices = 0;
    var apiRequestNumberPlaying = 0;
    var currentTime = 0;
    var doUpdateCurrentTime = false;
    var updateCurrentTimeIsPlaying = true;
    // console.log("I am out of main")

    //adholder path calculations
    if (config.devMode === true) {
        adholderPath = "./adholder.png"
    }
    else if (process.platform === "win32") {
        adholderPath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.exe")) + "resources\\app\\adholder.png"
    } else if (process.platform === "darwin") {
        adholderPath = "./contents/resources/app/adholder.png"
    }

    //placeholder img path calculations
    if (config.devMode === true) {
        placeholderpath = "./placeholder.jpg"
    }
    else if (process.platform === "win32") {
        placeholderpath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.exe")) + "resources\\app\\placeholder.jpg"
    } else if (process.platform === "darwin") {
        placeholderpath = "./contents/resources/app/placeholder.jpg"
    }

    // background path calculations
    if (config.devMode === true) {
        backgroundPath = "./background.jpg"
    }
    else if (process.platform === "win32") {
        backgroundPath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.exe")) + "resources/app/background.jpg"
        backgroundPath = backgroundPath.substring(2) // remove drive letter
        backgroundPath = backgroundPath.replace(/\\/g, "/")
    } else if (process.platform === "darwin") {
        backgroundPath = "./contents/resources/app/background.jpg"
    }

    if (process.platform == "win32") {
        console.log("UNMUTED FROM THE BEGINNING WIN32")
        nircmd('nircmd muteappvolume Spotify.exe 0')
        muted = false;
    } else {
        loudness.getMuted().then((adMuted) => {
            // console.log("AD MUTE START" + adMuted)
            muted = adMuted;
        })
    }

    // if (err) throw err;
    // console.log(key);
    // console.log(aes.decText(config.clientSecret, key))


    // ipcRenderer.on('secretDecode', (event, clientSecret) => {
    //     console.log(clientSecret)

    var scopes = ['user-read-currently-playing', 'user-read-playback-state'], //part of auth process
        redirectUri = 'http://localhost:8888',
        clientId = '936ec326b81340c5bc4beb066f267d70',
        state = state;


    // console.log(clientSecret)

    var spotifyApi = new SpotifyWebApi({ //Spotify Wrapper init according to https://github.com/thelinmichael/spotify-web-api-node#usage
        clientId: clientId,
        clientSecret: aes.decText(config.clientSecret, key),
        redirectUri: redirectUri

    });
    // });
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state); // Start authorization process to get access token. --> https://github.com/thelinmichael/spotify-web-api-node#authorization || create auth url using wrapper init consturctor data. 
    // var currentSysVol = getvolume

    document.getElementById('status').innerHTML = "Current Status: Authorizing..."
    // document.getElementById('test').innerHTML = authorizeURL
    if (appConfig.blockAds === true) {
        document.getElementById('blockingStatus').innerHTML = `Currently blocking Ads: Yes`;
    } else if (appConfig.blockAds === false) {
        document.getElementById('blockingStatus').innerHTML = `Currently blocking Ads: No`;
    }
    if (appConfig.sticky === true) {
        document.getElementById('sticky').innerHTML = `Is app sticky: Yes`
    } else if (appConfig.sticky === false) {
        document.getElementById('sticky').innerHTML = `Is app sticky: No`

    }
    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
    }
    ipcRenderer.send('windowOpenReq', authorizeURL) // requiest main process to open auth window with the auth url in var authorizeURL

    ipcRenderer.on('codeCallback', (event, code) => { // received after auth success then: 
        // console.log(code)

        spotifyApi.authorizationCodeGrant(code).then( // then: gets access & refresh token using the code returned.
            async function (data) {
                // console.log('The token expires in ' + data.body['expires_in']);
                // console.log('The access token is ' + data.body['access_token']);
                // console.log('The refresh token is ' + data.body['refresh_token']);

                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                // tokenExpTime = new Date().getTime() / 1000 + data.body['expires_in'];
                // tokenExpTime = tokenExpTime - new Date().getTime() / 1000; //convert from epoch to seconds
                tokenExpTime = new Date().getTime();

                console.log(
                    `Retrieved token. It expires in ${tokenExpTime / 1000} seconds!`
                );
                document.getElementById("status").innerHTML = "Current Status: Authorization Successful!"
                ipcRenderer.send("authWindowCloseReq") // after getting access & refresh token, sends request to close auth window to index.js

                //add wait for a few second to 1 min then changve status to "monitoring & blocking"
                let authUserName = ""
                let pictureURL = ""
                spotifyApi.getMe() // get user details
                    .then(function (data) {
                        console.log('Some information about the authenticated user', data.body);
                        authUserName = data.body.display_name;
                        pictureURL = data.body.images[0].url;
                        document.getElementById("avatar").src = pictureURL;
                        document.getElementById("usersNameText").innerHTML = `Welcome, ${authUserName} (Logout)`;
                        console.log(document.getElementById("usersNameText").innerHTML)
                        var usersNameTextWidth = document.getElementById("usersNameText").clientWidth;
                        console.log(usersNameTextWidth)
                        var viewPortWidth = document.documentElement.clientWidth;
                        console.log(viewPortWidth)
                        var avatarPos = parseInt((viewPortWidth - usersNameTextWidth) - 60)
                        console.log(`avatarPOS: ${avatarPos}`)
                        document.getElementById("avatarImg").style.left = `${avatarPos}px`;
                    }, function (err) {
                        console.log('Something went wrong!', err);
                    });

                // Use a var to store current playing (ad or song name), if it new one changes from what is in variable, execute mute or unmute (so insted of every 3 seconds it runs every song change). Do in getPlaying() but outside of getmycurrentplayingtrack call.
                let previousProgress = 0
                let currentProgress = 0
                var hostDeviceName = ""
                if (process.platform === 'darwin') {
                    hostDeviceName = await doExec('scutil --get ComputerName');
                    hostDeviceName = (' ' + hostDeviceName).slice(1).toLowerCase()
                    hostDeviceName = hostDeviceName.replace(/(\r\n|\n|\r)/gm, "");
                } else {
                    hostDeviceName = (' ' + os.hostname).slice(1).toLowerCase()
                }
                console.log(`HOST DEVICE NAME ${hostDeviceName}`)
                var tokenRefTimer = 0
                var artists = ""
                let colorSwatch = []
                let paletteCopy;

                setInterval(getDevices, 1 * 1000) // getDevices every 1 sec

                function getDevices() {
                    spotifyApi.getMyDevices()
                        .then(function (data1) {

                            // apiRequestNumberDevices++;
                            // console.log(`apiRequestNumberDevices: ${apiRequestNumberDevices}`)

                            for (var i = 0; i < data1.body.devices.length; i++) {
                                if (data1.body.devices[i].name.toLowerCase() === hostDeviceName && data1.body.devices[i].is_active === true) { //&& data1.body.devices[parseInt(i)].is_active === true
                                    playingOnCurrentDevice = true;
                                    break;
                                } else {
                                    playingOnCurrentDevice = false;
                                }
                            }

                        }, function (err) {
                            console.error(err);
                        });
                }
                //     console.log(`Device Data: ${data1.body}`)
                // var getPlayingTime = setInterval(getPlaying, apiRequestTime) //end of get playing //REPEATED REQUESTS NEED TO DEBUG
                // var getPlayingTime = setTimeout(getPlaying(), 1*1000)

                var getPlayingTime = setInterval(getPlaying, apiRequestTime)

                // setTimeout(getPlaying, apiRequestTime);
                // getPlaying();

                function getPlaying() { // get current playing every 3 (now think its 1 sec) seconds, and updates HTML.
                    spotifyApi.getMyCurrentPlayingTrack({
                    })
                        .then(function (data) { // need to be able to detect an ad playing and show it -- done

                            // apiRequestNumberPlaying++;
                            // console.log(`apiRequestNumberPlaying: ${apiRequestNumberPlaying}`)

                            // Output items
                            console.log(`DATA CODE: ${data.statusCode}`)
                            // console.log("Now Playing: ", data);
                            tokenRefTimer = 0;
                            // console.log(`Token REF TIMER RESET: ${tokenRefTimer}`)
                            document.getElementById("status").innerHTML = "Current Status: Monitoring & Blocking"
                            if (playingOnCurrentDevice === false) { // not playing on current device
                                if (data.statusCode == 204) { // check if user is not playing anything
                                    document.getElementById('nowPlaying').innerHTML = `Nothing is playing`
                                    document.getElementById('artist').innerHTML = ``;
                                    document.getElementById('explicit').innerHTML = ``;
                                    document.getElementById('songRunTime').innerHTML = '';
                                    document.getElementById('currentTime').innerHTML = '';
                                    document.getElementById("albumCover").src = placeholderpath
                                    document.body.style.backgroundColor = `rgb(255,255,255)`
                                    document.body.style.backgroundImage = 'url(' + backgroundPath + ')'
                                    //`url('./background.jpg')`

                                    document.getElementById('nowPlaying').style.fontSize = "2rem"
                                    document.getElementById('artist').style.fontSize = "1.5rem"
                                    document.getElementById('explicit').style.fontSize = "large"
                                    document.getElementById('songRunTime').style.fontSize = "large"
                                    document.getElementById('currentTime').style.fontSize = "large"
                                    document.getElementById('blockingStatus').style.fontSize = "large"
                                    document.getElementById('sticky').style.fontSize = "large"
                                    document.title = `SpotiMuter | AD Block Mode: ${appConfig.blockAds ? "Enabled" : "Disabled"}`;
                                    clearInterval(getPlayingTime)
                                    apiRequestTime = 10000;
                                    getPlayingTime = setInterval(getPlaying, apiRequestTime)
                                    // getPlayingTime = setInterval(getPlaying(), apiRequestTime)
                                    console.log("204 NO PLAYING SEGMENT")
                                } else if (data.statusCode === 401) { //401
                                    // reauth
                                    console.log("reauthorizing")
                                    spotifyApi.refreshAccessToken().then(
                                        function (data) {
                                            // Save the access token so that it's used in future calls
                                            spotifyApi.setAccessToken(data.body['access_token']);
                                            tokenExpTime = new Date().getTime();
                                            console.log(`The access token has been refreshed! EXP in ${tokenExpTime} `);
                                            tokenRefTimer++;
                                        },
                                        function (err) {
                                            console.log('Could not refresh access token', err);
                                        }
                                    );

                                    if (process.platform == "win32") { //make sure speakers are unmuted after computer sleep. 
                                        nircmd('nircmd muteappvolume Spotify.exe 0')
                                        muted = false;
                                    } else {
                                        loudness.getMuted().then((adMuted) => {
                                            // console.log("AD MUTE START" + adMuted)
                                            muted = adMuted;
                                        })
                                    }
                                }
                                else {
                                    clearInterval(getPlayingTime) // reset (for beginning so it can update gui elements); before getting changed to 5000ms again
                                    currentTime = data.body.progress_ms;
                                    updateCurrentTimeIsPlaying = data.body.is_playing;
                                    apiRequestTime = 1000;
                                    getPlayingTime = setInterval(getPlaying, apiRequestTime);
                                    try { //see if its a song on another device
                                        // console.log('LEN' + data.body.item.name.length)
                                        if (data.body.item.name.length > 31) {
                                            document.getElementById('nowPlaying').innerHTML = `${data.body.item.name} [NOT ON CURRENT DEVICE]`
                                            document.getElementById('nowPlaying').style.fontSize = "1.3rem"
                                            document.getElementById('artist').style.fontSize = "medium"
                                            document.getElementById('explicit').style.fontSize = "medium"
                                            document.getElementById('songRunTime').style.fontSize = "medium"
                                            document.getElementById('currentTime').style.fontSize = "medium"
                                            document.getElementById('blockingStatus').style.fontSize = "medium"
                                            document.getElementById('sticky').style.fontSize = "medium"
                                            // console.log("Font changed")
                                        } else {
                                            document.getElementById('nowPlaying').innerHTML = `${data.body.item.name} [NOT ON CURRENT DEVICE]`
                                            document.getElementById('nowPlaying').style.fontSize = "2rem"
                                            document.getElementById('artist').style.fontSize = "1.5rem"
                                            document.getElementById('explicit').style.fontSize = "large"
                                            document.getElementById('songRunTime').style.fontSize = "large"
                                            document.getElementById('currentTime').style.fontSize = "large"
                                            document.getElementById('blockingStatus').style.fontSize = "large"
                                            document.getElementById('sticky').style.fontSize = "large"
                                        }
                                        //set album cover
                                        document.getElementById("albumCover").src = data.body.item.album.images[1].url
                                        //set barText
                                        document.title = `${data.body.item.artists[0].name}: ${data.body.item.name} | AD Block Mode: ${appConfig.blockAds ? "Enabled" : "Disabled"} - SpotiMuter`;
                                        // remove background img
                                        document.body.style.backgroundImage = ``
                                        //set background using k-means clustering
                                        Vibrant.from(data.body.item.album.images[1].url).getPalette((err, palette) => {
                                            // console.log(palette);
                                            colorSwatch[0] = parseInt(palette.DarkMuted.population)
                                            colorSwatch[1] = parseInt(palette.DarkVibrant.population)
                                            colorSwatch[2] = parseInt(palette.LightMuted.population)
                                            colorSwatch[3] = parseInt(palette.LightVibrant.population)
                                            colorSwatch[4] = parseInt(palette.Muted.population)
                                            colorSwatch[5] = parseInt(palette.Vibrant.population)
                                            // console.log(`COLOR SWATCH: ${colorSwatch}`)
                                            paletteCopy = palette;
                                        })
                                        let chosen = 0
                                        // console.log(Math.max.apply(Math, colorSwatch))
                                        for (var j = 0; j < colorSwatch.length; j++) {
                                            if (colorSwatch[j] === Math.max.apply(Math, colorSwatch)) {
                                                chosen = j;
                                            }

                                        }
                                        console.log(chosen)
                                        if (chosen === 0) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.DarkMuted.rgb[0]}, ${paletteCopy.DarkMuted.rgb[1]}, ${paletteCopy.DarkMuted.rgb[2]}, 0.5)`
                                            // console.log("I am in 0")
                                        } else if (chosen === 1) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.DarkVibrant.rgb[0]}, ${paletteCopy.DarkVibrant.rgb[1]}, ${paletteCopy.DarkVibrant.rgb[2]}, 0.5)`
                                            // console.log("I am in 1")
                                        } else if (chosen === 2) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.LightMuted.rgb[0]}, ${paletteCopy.LightMuted.rgb[1]}, ${paletteCopy.LightMuted.rgb[2]}, 0.5)`
                                            // console.log("I am in 3")
                                        } else if (chosen === 3) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.LightVibrant.rgb[0]}, ${paletteCopy.LightVibrant.rgb[1]}, ${paletteCopy.LightVibrant.rgb[2]}, 0.5)`
                                            // console.log("I am in 4")
                                        } else if (chosen === 4) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.Muted.rgb[0]}, ${paletteCopy.Muted.rgb[1]}, ${paletteCopy.Muted.rgb[2]}, 0.5  )`
                                            // console.log("I am in 5")
                                        } else if (chosen === 5) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.Vibrant.rgb[0]}, ${paletteCopy.Vibrant.rgb[1]}, ${paletteCopy.Vibrant.rgb[2]}, 0.5)`
                                            // console.log("I am in 6 Vibrant")
                                        }
                                        //get artists
                                        for (var k = 0; k < data.body.item.artists.length; k++) {
                                            if (data.body.item.artists.length - k === 1) {
                                                artists += data.body.item.artists[k].name
                                            } else {
                                                artists += `${data.body.item.artists[k].name}, `
                                            }
                                        }
                                        document.getElementById('artist').innerHTML = artists
                                        artists = ""
                                        //explicit
                                        if (data.body.item.explicit === true) {
                                            document.getElementById('explicit').innerHTML = `Explicit Rating by Spotify: Explicit`
                                        } else if (data.body.item.explicit === false) {
                                            document.getElementById('explicit').innerHTML = `Explicit Rating by Spotify: Not Explicit`
                                        }
                                        //run time

                                        // document.getElementById('songRunTime').innerHTML = `Duration: ${millisToMinutesAndSeconds(data.body.item.duration_ms)}`

                                        document.getElementById('currentTime').innerHTML = `Current Progress: ${millisToMinutesAndSeconds(data.body.item.progress_ms)} `
                                        currentTime = data.body.item.progress_ms;
                                        updateCurrentTimeIsPlaying = data.body.item.is_playing;


                                        // debugger;

                                        if ((data.body.item.duration_ms - data.body.progress_ms) > 30000) { // if song is not ending
                                            if (data.body.progress_ms < 7000) {
                                                setTimeout(() => {
                                                    clearInterval(getPlayingTime) // use setTimeout
                                                    // apiRequestTime = 1000;
                                                    apiRequestTime = 5000;
                                                    getPlayingTime = setInterval(getPlaying, apiRequestTime);
                                                    doUpdateCurrentTime = true;
                                                }, 2000);
                                            } else {
                                                clearInterval(getPlayingTime) // use setTimeout
                                                // apiRequestTime = 1000;
                                                apiRequestTime = 5000;
                                                getPlayingTime = setInterval(getPlaying, apiRequestTime);
                                                doUpdateCurrentTime = true;
                                            }
                                            console.log("SONG NOT ENDING SEGMENT")
                                        } else if (data.statusCode == 204) { // if no song is playing
                                            // clearInterval(getPlayingTime)
                                            // clearTimeout(getPlayingTime)
                                            // clearInterval(getPlayingTime);
                                            // apiRequestTime = 1000;
                                            clearInterval(getPlayingTime)
                                            apiRequestTime = 10000;
                                            getPlayingTime = setInterval(getPlaying, apiRequestTime)
                                            // getPlayingTime = setInterval(getPlaying(), apiRequestTime)
                                            console.log("204 NO PLAYING SEGMENT")
                                        }
                                        else if (data.body.currently_playing_type === 'ad') { // playing ad
                                            // clearInterval(getPlayingTime)
                                            clearInterval(getPlayingTime)
                                            apiRequestTime = 5000;
                                            getPlayingTime = setInterval(getPlaying, apiRequestTime)
                                            console.log("AD PLAYING INTERVAL")
                                        }
                                        else {
                                            clearInterval(getPlayingTime)
                                            apiRequestTime = 1000;
                                            getPlayingTime = setTimeout(getPlaying, apiRequestTime)
                                            doUpdateCurrentTime = false;
                                        }

                                        console.log(`${apiRequestTime} + 1`)
                                        console.log("DURATION: " + data.body.item.duration_ms)
                                        console.log("PROGRESS: " + data.body.progress_ms)
                                        // console.log(getPlayingTime)
                                        console.log("----------------------")

                                        //current time
                                        document.getElementById('currentTime').innerHTML = `Current Progress: ${millisToMinutesAndSeconds(data.body.progress_ms)}`
                                        currentTime = data.body.progress_ms;
                                        updateCurrentTimeIsPlaying = data.body.is_playing;
                                    } catch (err) { //its an ad... on another device
                                        if (data.body.currently_playing_type === 'ad') {
                                            document.getElementById('nowPlaying').innerHTML = `Spotify is currently playing an AD. [NOT ON CURRENT DEVICE]` //ad
                                            document.getElementById('nowPlaying').style.fontSize = "2rem"
                                            document.getElementById('artist').innerHTML = ``;
                                            document.getElementById('explicit').innerHTML = ``;
                                            document.getElementById('songRunTime').innerHTML = '';
                                            document.getElementById('currentTime').innerHTML = '';
                                            document.body.style.backgroundColor = `rgb(255,255,255)`
                                            document.body.style.backgroundImage = 'url(' + backgroundPath + ')'
                                            //  `url('./background.jpg')`
                                            document.getElementById("albumCover").src = adholderPath
                                            document.getElementById('artist').style.fontSize = "1.5rem"
                                            document.getElementById('explicit').style.fontSize = "large"
                                            document.getElementById('songRunTime').style.fontSize = "large"
                                            document.getElementById('currentTime').style.fontSize = "large"
                                            document.getElementById('blockingStatus').style.fontSize = "large"
                                            document.getElementById('sticky').style.fontSize = "large"
                                            document.title = `Currently Playing AD | AD Block Mode: ${appConfig.blockAds ? "Enabled" : "Disabled"} - SpotiMuter`;
                                        }
                                    }
                                }
                            }
                            else if (playingOnCurrentDevice) { // playing on current device
                                currentProgress = data.body.progress_ms;
                                currentTime = data.body.progress_ms;
                                updateCurrentTimeIsPlaying = data.body.is_playing;
                                // console.log(`DATA CODE: ${data.statusCode}`)
                                // console.log(`previous progress: ${previousProgress}`)
                                // console.log(`current progress: ${currentProgress}`)


                                try { //see if its a song
                                    if (data.statusCode == 204) { // check if user is not playing anything
                                        document.getElementById('nowPlaying').innerHTML = `Nothing is playing`
                                        document.getElementById('artist').innerHTML = ``;
                                        document.getElementById('explicit').innerHTML = ``;
                                        document.getElementById('songRunTime').innerHTML = '';
                                        document.getElementById('currentTime').innerHTML = '';
                                        document.getElementById("albumCover").src = placeholderpath
                                        document.body.style.backgroundColor = `rgb(255,255,255)`
                                        document.body.style.backgroundImage = 'url(' + backgroundPath + ')'
                                        // `url('./background.jpg')`

                                        document.getElementById('nowPlaying').style.fontSize = "2rem"
                                        document.getElementById('artist').style.fontSize = "1.5rem"
                                        document.getElementById('explicit').style.fontSize = "large"
                                        document.getElementById('songRunTime').style.fontSize = "large"
                                        document.getElementById('currentTime').style.fontSize = "large"
                                        document.getElementById('blockingStatus').style.fontSize = "large"
                                        document.getElementById('sticky').style.fontSize = "large"
                                        document.title = `SpotiMuter | AD Block Mode: ${appConfig.blockAds ? "Enabled" : "Disabled"}`;
                                        clearInterval(getPlayingTime)
                                        apiRequestTime = 10000;
                                        getPlayingTime = setInterval(getPlaying, apiRequestTime)
                                        // getPlayingTime = setInterval(getPlaying(), apiRequestTime)
                                        console.log("204 NO PLAYING SEGMENT")
                                    } else if (data.statusCode === 401) { //401
                                        // reauth
                                        console.log("reauthorizing")
                                        spotifyApi.refreshAccessToken().then(
                                            function (data) {
                                                // Save the access token so that it's used in future calls
                                                spotifyApi.setAccessToken(data.body['access_token']);
                                                tokenExpTime = new Date().getTime();
                                                console.log(`The access token has been refreshed! EXP in ${tokenExpTime} `);
                                                tokenRefTimer++;
                                            },
                                            function (err) {
                                                console.log('Could not refresh access token', err);
                                            }
                                        );
                                    }
                                    else { // playing song
                                        clearInterval(getPlayingTime) // reset (for beginning so it can update gui elements); before getting changed to 5000ms again
                                        // apiRequestTime = 1000;
                                        apiRequestTime = 1000;
                                        getPlayingTime = setInterval(getPlaying, apiRequestTime);
                                        //set now playing
                                        // console.log("LEN" + data.body.item.name.length)
                                        if (data.body.item.name.length > 45) {
                                            document.getElementById('nowPlaying').innerHTML = `${data.body.item.name}`
                                            document.getElementById('nowPlaying').style.fontSize = "1.5rem"
                                            document.getElementById('artist').style.fontSize = "medium"
                                            document.getElementById('explicit').style.fontSize = "medium"
                                            document.getElementById('songRunTime').style.fontSize = "medium"
                                            document.getElementById('currentTime').style.fontSize = "medium"
                                            document.getElementById('blockingStatus').style.fontSize = "medium"
                                            document.getElementById('sticky').style.fontSize = "medium"
                                            // console.log("Font changed")
                                        } else {
                                            document.getElementById('nowPlaying').innerHTML = `${data.body.item.name}`
                                            document.getElementById('nowPlaying').style.fontSize = "2rem"
                                            document.getElementById('artist').style.fontSize = "1.5rem"
                                            document.getElementById('explicit').style.fontSize = "large"
                                            document.getElementById('songRunTime').style.fontSize = "large"
                                            document.getElementById('currentTime').style.fontSize = "large"
                                            document.getElementById('blockingStatus').style.fontSize = "large"
                                            document.getElementById('sticky').style.fontSize = "large"
                                        }
                                        //set barText
                                        document.title = `${data.body.item.artists[0].name}: ${data.body.item.name} | AD Block Mode: ${appConfig.blockAds ? "Enabled" : "Disabled"} - SpotiMuter`;
                                        //set album cover
                                        document.getElementById("albumCover").src = data.body.item.album.images[1].url
                                        // remove background img
                                        document.body.style.backgroundImage = ``
                                        //set background using k-means clustering
                                        Vibrant.from(data.body.item.album.images[1].url).getPalette((err, palette) => {
                                            // console.log(palette);
                                            colorSwatch[0] = parseInt(palette.DarkMuted.population)
                                            colorSwatch[1] = parseInt(palette.DarkVibrant.population)
                                            colorSwatch[2] = parseInt(palette.LightMuted.population)
                                            colorSwatch[3] = parseInt(palette.LightVibrant.population)
                                            colorSwatch[4] = parseInt(palette.Muted.population)
                                            colorSwatch[5] = parseInt(palette.Vibrant.population)
                                            // console.log(`COLOR SWATCH: ${colorSwatch}`)
                                            paletteCopy = palette;
                                        })
                                        let chosen = 0
                                        // console.log(Math.max.apply(Math, colorSwatch))
                                        for (var j = 0; j < colorSwatch.length; j++) {
                                            if (colorSwatch[j] === Math.max.apply(Math, colorSwatch)) {
                                                chosen = j;
                                            }

                                        }
                                        // console.log(chosen)
                                        if (chosen === 0) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.DarkMuted.rgb[0]}, ${paletteCopy.DarkMuted.rgb[1]}, ${paletteCopy.DarkMuted.rgb[2]}, 0.5)`
                                            // console.log("I am in 0")
                                        } else if (chosen === 1) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.DarkVibrant.rgb[0]}, ${paletteCopy.DarkVibrant.rgb[1]}, ${paletteCopy.DarkVibrant.rgb[2]}, 0.5)`
                                            // console.log("I am in 1")
                                        } else if (chosen === 2) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.LightMuted.rgb[0]}, ${paletteCopy.LightMuted.rgb[1]}, ${paletteCopy.LightMuted.rgb[2]}, 0.5)`
                                            // console.log("I am in 3")
                                        } else if (chosen === 3) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.LightVibrant.rgb[0]}, ${paletteCopy.LightVibrant.rgb[1]}, ${paletteCopy.LightVibrant.rgb[2]}, 0.5)`
                                            // console.log("I am in 4")
                                        } else if (chosen === 4) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.Muted.rgb[0]}, ${paletteCopy.Muted.rgb[1]}, ${paletteCopy.Muted.rgb[2]}, 0.5  )`
                                            // console.log("I am in 5")
                                        } else if (chosen === 5) {
                                            document.body.style.backgroundColor = `rgba(${paletteCopy.Vibrant.rgb[0]}, ${paletteCopy.Vibrant.rgb[1]}, ${paletteCopy.Vibrant.rgb[2]}, 0.5)`
                                            // console.log("I am in 6 Vibrant")
                                        }
                                        //get artists
                                        for (var k = 0; k < data.body.item.artists.length; k++) {
                                            if (data.body.item.artists.length - k === 1) { //last one
                                                artists += data.body.item.artists[k].name
                                            } else {
                                                artists += `${data.body.item.artists[k].name}, `
                                            }
                                        }
                                        document.getElementById('artist').innerHTML = artists
                                        artists = ""
                                        //explicit
                                        if (data.body.item.explicit === true) {
                                            document.getElementById('explicit').innerHTML = `Explicit Rating by Spotify: Explicit`
                                        } else if (data.body.item.explicit === false) {
                                            document.getElementById('explicit').innerHTML = `Explicit Rating by Spotify: Not Explicit`
                                        }
                                        //run time
                                        document.getElementById('songRunTime').innerHTML = `Duration: ${millisToMinutesAndSeconds(data.body.item.duration_ms)} `
                                        currentTime = data.body.item.progress_ms;

                                        // if (data.body.item.duration_ms - data.body.progress_ms<10000){ // if song is ending
                                        //     apiRequestTime = 1;
                                        //     clearInterval(getPlayingTime);
                                        // } 
                                        // else {
                                        //     apiRequestTime = parseInt((data.body.item.duration_ms)-10000);
                                        //     clearInterval(getPlayingTime);
                                        // }
                                        // console.log(`${apiRequestTime}+2`)
                                        // current progress

                                        if ((data.body.item.duration_ms - data.body.progress_ms) > 30000) { // if song is not ending
                                            if (data.body.progress_ms < 7000) {
                                                setTimeout(() => {
                                                    clearInterval(getPlayingTime) // use setTimeout
                                                    // apiRequestTime = 1000;
                                                    apiRequestTime = 5000;
                                                    getPlayingTime = setInterval(getPlaying, apiRequestTime);
                                                    doUpdateCurrentTime = true;
                                                }, 2000);
                                            } else {
                                                clearInterval(getPlayingTime) // use setTimeout
                                                // apiRequestTime = 1000;
                                                apiRequestTime = 5000;
                                                getPlayingTime = setInterval(getPlaying, apiRequestTime);
                                                doUpdateCurrentTime = true;
                                            }
                                            console.log("SONG NOT ENDING SEGMENT")
                                        } else if (data.statusCode == 204) { // if no song is playing
                                            // clearInterval(getPlayingTime)
                                            // clearTimeout(getPlayingTime)
                                            // clearInterval(getPlayingTime);
                                            // apiRequestTime = 1000;
                                            clearInterval(getPlayingTime)
                                            apiRequestTime = 10000;
                                            getPlayingTime = setInterval(getPlaying, apiRequestTime)
                                            // getPlayingTime = setInterval(getPlaying(), apiRequestTime)
                                            console.log("204 NO PLAYING SEGMENT")
                                        }
                                        else if (data.body.currently_playing_type === 'ad') { // playing ad
                                            // clearInterval(getPlayingTime)
                                            clearInterval(getPlayingTime)
                                            apiRequestTime = 5000;
                                            getPlayingTime = setInterval(getPlaying, apiRequestTime)
                                            console.log("AD PLAYING INTERVAL")
                                        }
                                        else {
                                            clearInterval(getPlayingTime)
                                            apiRequestTime = 1000;
                                            getPlayingTime = setTimeout(getPlaying, apiRequestTime)
                                            doUpdateCurrentTime = false;
                                        }

                                        console.log(`${apiRequestTime} + 1`)
                                        console.log("DURATION: " + data.body.item.duration_ms)
                                        console.log("PROGRESS: " + data.body.progress_ms)
                                        // console.log(getPlayingTime)
                                        console.log("----------------------")

                                        document.getElementById('currentTime').innerHTML = `Current Progress: ${millisToMinutesAndSeconds(data.body.progress_ms)} `
                                        currentTime = data.body.progress_ms;


                                        // robot.keyTap("audio_mute");
                                        if (data.body.item.name != "ad" && muted === true) { //unmute if ad stops playing
                                            if (process.platform === "win32") {
                                                nircmd('nircmd muteappvolume Spotify.exe 0')
                                                muted = false
                                            } else {
                                                robot.keyTap("audio_mute");
                                                muted = false
                                            }
                                            // document.getElementById('blockingStatus').innerHTML = "Currently Blocking Ads: No"
                                        }
                                    }


                                } catch (err) { //its an ad
                                    document.getElementById('nowPlaying').innerHTML = `Spotify is currently playing an AD.` //ad
                                    document.getElementById('nowPlaying').style.fontSize = "2rem"
                                    document.getElementById('artist').innerHTML = ``;
                                    document.getElementById('explicit').innerHTML = ``;
                                    document.getElementById('songRunTime').innerHTML = '';
                                    document.getElementById('currentTime').innerHTML = '';
                                    document.body.style.backgroundColor = `rgb(255,255,255)`
                                    document.body.style.backgroundImage = 'url(' + backgroundPath + ')'
                                    // `url('./background.jpg')`
                                    document.getElementById("albumCover").src = adholderPath

                                    document.getElementById('artist').style.fontSize = "1.5rem"
                                    document.getElementById('explicit').style.fontSize = "large"
                                    document.getElementById('songRunTime').style.fontSize = "large"
                                    document.getElementById('currentTime').style.fontSize = "large"
                                    document.getElementById('blockingStatus').style.fontSize = "large"
                                    document.getElementById('sticky').style.fontSize = "large"
                                    document.title = `Currently Playing AD | AD Block Mode: ${appConfig.blockAds ? "Enabled" : "Disabled"} - SpotiMuter`;
                                    if (appConfig.blockAds === true) {
                                        if (data.body.currently_playing_type === "ad" && muted === false && (data.body.is_playing === true)) { //mute if ad starts previousProgress != currentProgress
                                            if (process.platform === "win32") {
                                                nircmd('nircmd muteappvolume Spotify.exe 1')
                                                muted = true
                                                // document.getElementById('blockingStatus').innerHTML = "Currently Blocking Ads: Yes"
                                            } else {
                                                robot.keyTap("audio_mute");
                                                muted = true
                                            }
                                        }
                                        if (process.platform != "win32") { // if speakers unmuted during ad - does not apply on win32
                                            if (data.body.is_playing === true && data.body.currently_playing_type === "ad") {
                                                loudness.getMuted().then((adMuted) => {
                                                    if (!adMuted) {
                                                        // console.log("AD MUTE" + adMuted)
                                                        robot.keyTap("audio_mute");
                                                    }
                                                })
                                            }
                                        }
                                        if (data.body.is_playing === false && muted === true) { // unmute if paused during ad previousProgress == currentProgress
                                            if (process.platform === "win32") {
                                                // nircmd('nircmd muteappvolume Spotify.exe 0')
                                                // muted = false
                                                // console.log('Win - Does not require unmuting')
                                            } else {
                                                robot.keyTap("audio_mute")
                                                muted = false
                                            }
                                        }
                                        // console.log(`muted2: ${ muted } `)
                                        // robot.keyTap("audio_mute");
                                        // currentSysVol=sysvol.getVolume()
                                        // sysvol.setVolume(0).then(() => {
                                        //     document.getElementById('blockingStatus').innerHTML = "Yes"
                                        // })
                                    } else if (appConfig.blockAds === false) {
                                        if (process.platform === "win32") {
                                            nircmd('nircmd muteappvolume Spotify.exe 0')
                                            muted = false
                                        } else {
                                            if (muted === true) {
                                                robot.keyTap("audio_mute")
                                                // DONT MUTE if blockads is false! :/
                                                muted = false
                                            }
                                        }
                                    }
                                }
                            }

                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });

                    previousProgress = currentProgress;
                    //FIX: Access Token Refresh Loop: http://prntscr.com/o09vg6 - Fixed
                    //refresh token every 3500 seconds. Expiration time is 6000 seconds or 1 hour.

                    // }
                    // setInterval(refreshToken, 3500 * 1000)

                    // DEV IMPORTENT
                    // console.log(`Token expires in ${Math.round(3600 - (Math.abs(new Date().getTime() / 1000 - tokenExpTime / 1000)))} `)


                    // console.log( // !!! ENABLE FOR LOGGING OF TOKEN EXP TIMES
                    //     'Time left: ' +
                    //     Math.floor(tokenExpTime - new Date().getTime() / 1000) +
                    //     ' seconds left!'
                    // );

                    // OK, we need to refresh the token. Stop printing and refresh.

                    // Refresh token and print the new time to expiration.
                    // if (tokenExpTime < 500 && tokenRefTimer == 0) {
                    //     spotifyApi.refreshAccessToken().then(
                    //         function (data) {
                    //             tokenExpTime = new Date().getTime() / 1000 + data.body['expires_in'];
                    //             tokenExpTime = tokenExpTime - new Date().getTime() / 1000; //convert from epoch to seconds
                    //             console.log(
                    //                 `Refreshed token.It now expires in ${ tokenExpTime } seconds!`
                    //             );
                    //             tokenRefTimer++;
                    //             console.log(`TOKENREFTIMER ${ tokenRefTimer } `)
                    //         },
                    //         function (err) {
                    //             console.log('Could not refresh the token!', err.message);
                    //         }
                    //     );
                    // }
                    // console.log(muted)

                }
                function checkToken() {
                    console.log("Getting Token")
                    if (new Date().getTime() - tokenExpTime > 3500000 && tokenRefTimer == 0) {
                        spotifyApi.refreshAccessToken().then(
                            function (data) {


                                // Save the access token so that it's used in future calls
                                spotifyApi.setAccessToken(data.body['access_token']);
                                tokenExpTime = new Date().getTime();
                                console.log(`The access token has been refreshed! EXP in ${tokenExpTime} `);
                                tokenRefTimer++;
                            },
                            function (err) {
                                console.log('Could not refresh access token', err);
                            }
                        );
                    }
                }
                setInterval(checkToken, 1 * 1000)

                function updateCurrentTime() {
                    if (doUpdateCurrentTime === true && updateCurrentTimeIsPlaying === true) {
                        currentTime += 1000;
                        document.getElementById('currentTime').innerHTML = `Current Progress: ${millisToMinutesAndSeconds(currentTime)} `
                        console.log("UPDATE CURRENT TIME")
                    }

                }
                setInterval(updateCurrentTime, 1 * 1000)
                //     setInterval(getDevices, 1 * 1000) // getDevices every 1 sec
                //   var getPlayingTime = setInterval(getPlaying, 1 * 1000) //end of get playing //REPEATED REQUESTS NEED TO DEBUG

                // console.log(`jsaslfjaslfjlasjfl OuT OF TIMED FUNCTION`)
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
    // console.log("I AM OUT OF THE CALLBACK FUNC")
    // });
    // console.log('Not authorized')
    //as soom as someone submits something, this triggers
})
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
    //     document.querySelector('#result').innerHTML = `Video is ${ duration } seconds`;
    // })



 // Watching for submit event in form tags


