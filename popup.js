// popup.js

console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG(popup.js) Start.');
const baseUrl = "https://techblog.shiroatohiro.com/api";

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////サブ関数
//APIリクエスト
async function sendApiRequest(method, url, apiToken, body = null) {
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
    try {
        const response = await fetch(url, options);
        const responseData = await response.json(); 
        if (!response.ok) {
            const error = new Error(responseData.message || 'API request failed.');
            error.status = response.status;
            console.log('CCCCCCCCCCCCCCCCCCCCC(popup.js) error.message: ', error.message, ' YYYYYYYYYYY(popup.js) error.status: ', error.status);
            throw error;
        }
        return await responseData;
    } catch (error) {
        throw error;
    }
}

//APIトークンを取得
function getApiToken() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ request: "getApiToken" }, function(response) {
            if (response && response.token) {
                resolve(response.token);
            } else {
                reject('User token not found. Please login.');
            }
        });
    });
}

//現在のタブのURLを取得
function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                reject('No current tab.');
            } else {
                resolve(tabs[0].url);
            }
        });
    });
}

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////ボタンを押したときに発火する関数
//いいね（ブックマーク、アーカイブ）をつけるリクエストを飛ばすメイン関数
async function handleAction(actionType) {
    try {
        //methodを取得
        let method;
        if(actionType == 'like'||actionType == 'bookmark'||actionType == 'archive'){
            method ='POST';
        }else if(actionType == 'unlike'||actionType == 'unbookmark'||actionType == 'unarchive'){
            method ='DELETE';
        }
        //apiUrlを取得
        const articleUrl = await getCurrentTabUrl();
        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA(popup.js) articleUrl: ' + articleUrl);
        let apiUrl = baseUrl + `/${actionType}-article?articleUrl=${encodeURIComponent(articleUrl)}`;
        //apiTokenを取得
        const apiToken = await getApiToken();
        //APIへリクエスト
        const response = await sendApiRequest(method, apiUrl, apiToken);
        //画面に反映する
        document.getElementById("success_msg").textContent = response.message;
        updateButtonsVisibilityFromActionType(actionType);
    } catch (error) {
        document.getElementById("error_msg").textContent = error;
        console.error('BBBBBBBBBB(popup.js) Caught error: ', error);
    }
}

//いいね（ブックマーク、アーカイブ）をつけたり外したりしたら下記を実行して表示・非表示を切り替える。
function updateButtonsVisibilityFromActionType(actionType) {
    let actionTypeReversed;
    if (actionType.startsWith('un')) {
        actionTypeReversed = actionType.substring(2); // 'un'を取り除く
    } else {
        actionTypeReversed = 'un' + actionType; // 'un'を追加する
    }
    document.getElementById(actionTypeReversed).style.display = "block";
    document.getElementById(actionType).style.display = "none";
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ページを読み込んだ時に発火する関数
// ページを読み込んだ時に発火する関数
document.addEventListener('DOMContentLoaded', async () => {
    console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH(popup.js) DOMContentLoaded');
    //ログインしていないものとして表示する
    changeVisibilityFromIsLoggedIn(false);
    updateButtonsVisibility(null);
    //ボタンにイベントを設置
    setActionToButton();
    try {
        await updateUserState();
    } catch (error) {
        document.getElementById("error_msg").textContent = error;
        console.error('EEEEEEEEEEEEEEEEEEEEEEEEE(popup.js) Caught error: ', error);
    }
});

//ユーザ情報やいいね（ブックマーク、アーカイブ）の状態を取得して表示する。
async function updateUserState(){
    try{
        //ユーザ情報を取得
        const responseUserData = await getUserInfo();
        console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH(popup.js) responseUserData: ', responseUserData, ' CCCCCCCC');
        changeVisibilityFromIsLoggedIn(true);
        document.getElementById("userName").textContent = responseUserData.name;
        //いいね（ブックマーク、アーカイブ）の状態を取得
        const response = await getUserStateToArticle();
        console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW(popup.js) response: ', response, ' DDDDDDDD');
        updateButtonsVisibility(response);
        document.getElementById("success_msg").textContent = response.message;
    }catch (error) {
        throw error;
    }
}

// ボタンにイベントリスナーを設定
function setActionToButton(){
    //いいね（ブックマーク、アーカイブ）に対して。
    document.getElementById("like").addEventListener("click", () => handleAction('like'));
    document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
    document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
    document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
    document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
    document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));
    //ログインボタン
    document.getElementById('loginForm').addEventListener('submit', login);
}

// 現在の記事のいいね、ブックマーク、アーカイブの状態を取得
async function getUserStateToArticle() {
    try {
        const articleUrl = await getCurrentTabUrl();
        console.log('DDDDDDDDDDDDDDDDDD(popup.js) Current Article URL: ' + articleUrl);

        const apiToken = await getApiToken();//rejectされたときにcatchで捕捉されない？マジで疑問です。
        const apiUrl = baseUrl + `/get-state?articleUrl=${encodeURIComponent(articleUrl)}`;
        console.log('SSSSSSSSSS(popup.js) apiToken: ' + apiToken);

        const response = await sendApiRequest('GET', apiUrl, apiToken);
        console.log('XXXXXXXXXXXXXXXXXXX(popup.js) user state to article: ', response);
        return response;
    } catch (error) {
        throw error;
    }
}

//ログインできているかどうかで表示・非表示を切り替える。
function changeVisibilityFromIsLoggedIn(isLoggedIn = false) {
    if(isLoggedIn==true){
        document.getElementById("isLoggedIn").style.display = "block";
        document.getElementById("notIsLoggedIn").style.display = "none";
    }else{
        document.getElementById("isLoggedIn").style.display = "none";
        document.getElementById("notIsLoggedIn").style.display = "block";
    }
}

// ボタンの表示を更新する関数
function updateButtonsVisibility(response = null) {
    //全体のボタンに適用する
    if(response==null){
        document.getElementById("allButtons").style.display = "none";
        return;
    }else{
        document.getElementById("allButtons").style.display = "block";
    }

    // likeの状態に基づいてボタンを表示・非表示
    if (response.like) {
        document.getElementById("like").style.display = "none";
        document.getElementById("unlike").style.display = "block";
    } else {
        document.getElementById("like").style.display = "block";
        document.getElementById("unlike").style.display = "none";
    }

    // bookmarkの状態に基づいてボタンを表示・非表示
    if (response.bookmark) {
        document.getElementById("bookmark").style.display = "none";
        document.getElementById("unbookmark").style.display = "block";
    } else {
        document.getElementById("bookmark").style.display = "block";
        document.getElementById("unbookmark").style.display = "none";
    }

    // archiveの状態に基づいてボタンを表示・非表示
    if (response.archive) {
        document.getElementById("archive").style.display = "none";
        document.getElementById("unarchive").style.display = "block";
    } else {
        document.getElementById("archive").style.display = "block";
        document.getElementById("unarchive").style.display = "none";
    }
}

//ユーザ情報を取得する。
async function getUserInfo() {
    try {
        const apiToken = await getApiToken();
        const apiUrl = baseUrl + '/user';
        const response = await sendApiRequest('GET', apiUrl, apiToken);
        console.log('XXXXXXXXXXXXXXXXXXX(popup.js) User Info:', response);
        return response;
    } catch (error) {
        throw error;
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ログインの処理
//ログインボタンを押すと発火する。
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await sendApiRequest('POST', baseUrl + '/login', null, { 'email': email, 'password': password });
        if (response.apiToken) {
            // トークンをストレージに保存
            const apiToken = response.apiToken;
            chrome.runtime.sendMessage({ apiToken: apiToken });
            //画面を更新
            updateUserState();
        } else {
            throw new Error('Login failed.');
        }
    } catch (error) {
        document.getElementById("error_msg").textContent = error.message;
        console.error('ZZZZZZZZZZZZZZZ(popup.js) login error: ', error);
    }
}