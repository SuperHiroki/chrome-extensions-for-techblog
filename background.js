// background.js

console.log('in background.js VVVVVVVVVVVVVVVVVVVVVVVVVVVV start');

let apiToken = null;

console.log('in background.js QQQQQQQQQQQQQQQQQQ apiToken: ' + apiToken);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.token) {
        // content.jsからトークンを受信する。
        apiToken = message.token;
        console.log('in background.js XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX apiToken: ' + apiToken);
    } else if (message.request === "getApiToken") {
        //popup.jsにトークンを送信する。
        console.log('in background.js YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY apiToken: ' + apiToken);
        sendResponse({ token: apiToken });
    }
    return true;
});

