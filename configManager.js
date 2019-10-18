var fs = require('fs');
var appConfigPath = ""
var config = require('./config.json')
const electron = require('electron')
const { ipcRenderer } = electron;

if (config.devMode === true) {
    appConfigPath = "./appConfig.json"
}
else if (process.platform === "win32") {
    appConfigPath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.exe")) + "resources\\app\\appConfig.json"
} else if (process.platform === "darwin") {
    appConfigPath = process.execPath.substring(0, process.execPath.indexOf("SpotiMuter.app")) + "SpotiMuter.app/contents/resources/app/appConfig.json"
}
console.log(appConfigPath)
var appConfig = require(appConfigPath)
var fs = require('fs')
// var writePath = process.execPath.substring(0,process.execPath.indexOf("SpotiMuter.exe")) + "resources\\app\\appConfig.json"
function adBlockToggle() {
    if (appConfig.blockAds === true) {
        appConfig.blockAds = false
        fs.writeFile(appConfigPath, JSON.stringify(appConfig, null, 2), function (err) {
            console.log("change completed")
        });
        if (appConfig.blockAds === true) {
            document.getElementById('blockingStatus').innerHTML = `Currently blocking Ads: Yes`;
        } else if (appConfig.blockAds === false) {
            document.getElementById('blockingStatus').innerHTML = `Currently blocking Ads: No`;
        }
    }
    else if (appConfig.blockAds === false) {
        appConfig.blockAds = true
        fs.writeFile(appConfigPath, JSON.stringify(appConfig, null, 2), function (err) {
            console.log("change completed")
        });
        if (appConfig.blockAds === true) {
            document.getElementById('blockingStatus').innerHTML = `Currently blocking Ads: Yes`;
        } else if (appConfig.blockAds === false) {
            document.getElementById('blockingStatus').innerHTML = `Currently blocking Ads: No`;
        }
    }
}

function stickyToggle() {
    if (appConfig.sticky === true) {
        appConfig.sticky = false
        fs.writeFile(appConfigPath, JSON.stringify(appConfig, null, 2), function (err) {
            console.log("change completed")
        });
        if (appConfig.sticky === true) {
            document.getElementById('sticky').innerHTML = `Is app sticky: Yes`
        } else if (appConfig.sticky === false) {
            document.getElementById('sticky').innerHTML = `Is app sticky: No`
        }
    }
    else if (appConfig.sticky === false) {
        appConfig.sticky = true
        fs.writeFile(appConfigPath, JSON.stringify(appConfig, null, 2), function (err) {
            console.log("change completed")
        });
        if (appConfig.sticky === true) {
            document.getElementById('sticky').innerHTML = `Is app sticky: Yes`
        } else if (appConfig.sticky === false) {
            document.getElementById('sticky').innerHTML = `Is app sticky: No`
        }
    }
}

function logout() {
    ipcRenderer.send('logoutReq')
}