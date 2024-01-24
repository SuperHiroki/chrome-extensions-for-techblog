// background.js

console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVV(background.js) Start.');

let apiToken = null;

console.log('QQQQQQQQQQQQQQQQQQ(background.js) apiToken: ' + apiToken);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.apiToken) {
        // 「https://techblog.shiroatohiro.com/*」を訪れたときにcontent.jsからAPIトークンを受信する。
        apiToken = message.apiToken;
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX(background.js) apiToken: ' + apiToken);
        //ページが切り替わってもAPIトークンを失わないようにストレージに保存する。
        chrome.storage.local.set({ 'apiToken': apiToken }, () => {
            console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHH(background.js) Token saved.');
        });
    } else if (message.request === "getApiToken") {
        //拡張機能のストレージからAPIトークンを取得する。
        chrome.storage.local.get('apiToken', (result) => {
            if (result.apiToken) {
                apiToken = result.apiToken;
            }
            console.log('GGGGGGGGGGGGGGGGGG(background.js) apiToken from chrome extension storage: ' + apiToken);
            //popup.jsにトークンを送信する。
            sendResponse({ apiToken: apiToken });
        });
    }
    return true;//sendResponseの処理が終わるまでチャネルを閉じないでほしいと送信する。
});

