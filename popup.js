// popup.js

console.log('in popup.js GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG start');

async function sendApiRequest(method, url, apiToken) {
    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('in popup.js EEEEEEEEEEEEEEEEEEEEEEEEE Error:', error);
    }
}

function handleAction(actionType) {
    // ここでbackground.jsからトークンを取得する
    chrome.runtime.sendMessage({ request: "getApiToken" }, async function(response) {
        if (response && response.token) {
            const apiToken = response.token;
            console.log('in popup.js HHHHHHHHHHHHHHHHHHHHHHHHHHHH apiToken: ' + apiToken);
            // 現在のタブのURLを取得
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var currentTab = tabs[0];
                if (currentTab) {
                    const articleUrl = encodeURIComponent(currentTab.url);
                    const apiUrl = `http://techblog.shiroatohiro.com/api/${actionType}-article/url/${articleUrl}`;
                    sendApiRequest(actionType === 'unlike' || actionType === 'unbookmark' || actionType === 'unarchive' ? 'DELETE' : 'POST', apiUrl, apiToken);
                }
            });
        } else {
            console.error('in popup.js UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU User token not found. Please login.');
        }
    });
}

// ボタンにイベントリスナーを設定
document.getElementById("like").addEventListener("click", () => handleAction('like'));
document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//テスト
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