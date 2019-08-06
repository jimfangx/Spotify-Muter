
var appConfig = require('./appConfig.json')
var fs = require('fs')
var writePath = process.execPath.substring(0,process.execPath.indexOf("SpotiMuter.exe")) + "resources\\app\\appConfig.json"
function adBlockToggle() {
    if (appConfig.blockAds === true) {
        appConfig.blockAds = false
        fs.writeFile(writePath, JSON.stringify(appConfig, null, 2), function (err) {
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
        fs.writeFile(writePath, JSON.stringify(appConfig, null, 2), function (err) {
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
        fs.writeFile(writePath, JSON.stringify(appConfig, null, 2), function (err) {
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
        fs.writeFile(writePath, JSON.stringify(appConfig, null, 2), function (err) {
            console.log("change completed")
        });
        if (appConfig.sticky === true) {
            document.getElementById('sticky').innerHTML = `Is app sticky: Yes`
        } else if (appConfig.sticky === false) {
            document.getElementById('sticky').innerHTML = `Is app sticky: No`
        }
    }
}