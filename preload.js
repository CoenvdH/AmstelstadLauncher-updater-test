// All of the Node.js APIs are available in the preload process.

const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { waitForDebugger } = require('inspector');

// It has the same sandbox as a Chrome extension.
const ipc = require('electron').ipcRenderer


window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded')
  checkOnce();
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
var i = 0;

function checkOnce() {
  var response = ipc.sendSync('synchronous-message', 'ping')
  var result = response
  console.log(result)
  var currPlayers = result.currentPlayers
  var maxPlayers = result.maximumPlayers
  var queue = result.currentQueue
  if (i == 1 && i < 2) {
    const playerCount = document.getElementById("playercount-text")
    const playerQueue = document.getElementById("queue-text")
    playerCount.innerHTML = currPlayers + " / " + maxPlayers
    playerQueue.innerHTML = "Wachtrij: " + queue
  }
  i++
}
checkOnce();
checkLoop();

function checkLoop() {
  setInterval(async function() {
    if ( ! winFocused ) {
      console.log("OUT FOCUS")
      return;
    }
    console.log("IN FOCUS")
    var response = ipc.sendSync('synchronous-message', 'ping')
    const playerCount = document.getElementById("playercount-text")
    const playerQueue = document.getElementById("queue-text")
    var result = response
    console.log(result)
    var currPlayers = result.currentPlayers
    var maxPlayers = result.maximumPlayers
    var queue = result.currentQueue
    console.log(currPlayers + "\n",
                maxPlayers + "\n",
                queue)
    playerCount.innerHTML = currPlayers + " / " + maxPlayers
    playerQueue.innerHTML = "Wachtrij: " + queue 
  }, 10000);
}

var winFocused = false;

window.onfocus = function() {
  winFocused = true;
}

window.onblur = function() {
  winFocused = false;
}

// setInterval(function() {
//   if ( ! winFocused) return;
//   console.log("IN FOCUS")
// }, 10);

window.addEventListener('keydown', (event) => { 
  if (event.ctrlKey && event.key === "d") {
    window.open("");
  }
 }, true)