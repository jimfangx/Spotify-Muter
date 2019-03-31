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

document.querySelector('#spotifyAuthSubmit').addEventListener('click', (event) => {
    ipcRenderer.send('oauth', 'getToken')
    console.log("sent")
})
 // Watching for submit event in form tags

    // ipcRenderer.on('duration:sent', (event, duration) => {
    //     document.querySelector('#result').innerHTML = `Video is ${duration} seconds`;
    // })



 // Watching for submit event in form tags


