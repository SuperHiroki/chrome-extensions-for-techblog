// popup.js

console.log('in popup.js GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG start');

let apiToken = null;

async function sendApiRequest(method, url, apiToken, body = null) {
    try {
        const options = {
            method: method,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`in popup.js AAAAAAAAA API request failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('in popup.js EEEEEEEE Error:', error);
    }
}

function getApiToken() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ request: "getApiToken" }, function(response) {
            if (response && response.token) {
                resolve(response.token);
            } else {
                reject('in popup.js UUUUUUUUUUU User token not found. Please login.');
            }
        });
    });
}

function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                reject('in popup.js CCCCCCCCCCC no current tab.');
            } else {
                resolve(tabs[0].url);
            }
        });
    });
}

async function handleAction(actionType) {
    try {
        apiToken = await getApiToken();
        const articleUrl = await getCurrentTabUrl();

        let apiUrl = `http://techblog.shiroatohiro.com/api/${actionType}-article`;
        let body = { url: articleUrl };

        const response_json = await sendApiRequest(actionType, apiUrl, apiToken, body);
        if(response_json && response_json.message) {
            document.getElementById("msg").textContent = response_json.message;
        }
    } catch (error) {
        console.error('in popup.js EEEEEEEEEEE Error: ', error);
    }
}
// ボタンにイベントリスナーを設定
document.getElementById("like").addEventListener("click", () => handleAction('like'));
document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////テスト
document.getElementById("test").addEventListener("click", () => handleAction_test());

function handleAction_test() {
    // ここでbackground.jsからトークンを取得する
    chrome.runtime.sendMessage({ request: "getApiToken" }, async function(response) {
        if (response && response.token) {
            const apiToken = response.token;
            console.log('in popup.js FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF apiToken: ' + apiToken);
            // 現在のタブのURLを取得
            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                var currentTab = tabs[0];
                if (currentTab) {
                    const articleUrl = encodeURIComponent(currentTab.url);
                    const apiUrl = `http://techblog.shiroatohiro.com/api/test`;
                    // 非同期リクエストを実行して応答を待つ
                    const response_json = await sendApiRequest('GET', apiUrl, apiToken);
                    document.getElementById("msg").textContent = response_json.message;
                }
            });
        } else {
            console.error('in popup.js VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV User token not found. Please login.');
        }
    });
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////