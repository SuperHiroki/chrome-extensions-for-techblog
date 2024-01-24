// popup.js

console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG(popup.js) Start.');
const baseUrl = "https://techblog.shiroatohiro.com/api";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////サブ関数
//APIリクエスト
async function sendApiRequest(method, apiToken, url, body = null) {

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
        const responseStateMsg = response.status + ": " + response.statusText;
        const responseData = await response.json(); 
        if (!response.ok) {
            const error = new Error(responseData.message || responseStateMsg);
            throw error;
        }
        return responseData;
    } catch (error) {
        throw error;
    }
}

//APIトークンを取得
function getApiToken() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ request: "getApiToken" }, function(response) {
            if (response && response.apiToken) {
                resolve(response.apiToken);
            } else {
                reject('User apiToken not found. Please login.');
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

//成功メッセージとエラーメッセージの表示
const error_msg = document.getElementById("error_msg");
const success_msg = document.getElementById("success_msg");

function errorOrSuccessMsg(errorOrSuccess = "error", msg = ""){
    if(errorOrSuccess == "error"){
        error_msg.textContent = msg;
        error_msg.style.display ="block";
        success_msg.textContent = "";
        success_msg.style.display ="none";
    }else if(errorOrSuccess == "success"){
        error_msg.textContent = "";
        error_msg.style.display ="none";
        success_msg.textContent = msg;
        success_msg.style.display ="block";
    }
}

//アクションタイプからPOSTなどのメソッドを取得する。
function getMethod(actionType){
    let method;
    if(actionType == 'like'||actionType == 'bookmark'||actionType == 'archive'||actionType == 'trash'||actionType == 'follow-author'||actionType == 'trash-author'){
        method ='POST';
    }else if(actionType == 'unlike'||actionType == 'unbookmark'||actionType == 'unarchive'||actionType == 'untrash'||actionType == 'unfollow-author'||actionType == 'untrash-author'){
        method ='DELETE';
    }
    return method;
}

//アクションタイプを反転する。
function reverseType(actionType){
    let actionTypeReversed;
    if (actionType.startsWith('un')) {
        actionTypeReversed = actionType.substring(2);
    } else {
        actionTypeReversed = 'un' + actionType;
    }
    return actionTypeReversed;
}

//アクションタイプからapiUrlを取得する。
function getApiUrl(actionType, articleUrl){
    let apiUrl;
    if(actionType == 'like'||actionType == 'bookmark'||actionType == 'archive'||actionType == 'trash'||actionType == 'unlike'||actionType == 'unbookmark'||actionType == 'unarchive'||actionType == 'untrash'){
        apiUrl = baseUrl + `/${actionType}-article?articleUrl=${encodeURIComponent(articleUrl)}`;
    }else if(actionType == 'follow-author'||actionType == 'trash-author'||actionType == 'unfollow-author'||actionType == 'untrash-author'){
        apiUrl = baseUrl + `/${actionType}?articleUrl=${encodeURIComponent(articleUrl)}`;
    }
    return apiUrl;
}

//オーバーレイ
function trashOverlay(actionType){
    if(actionType === "trash"){
        const grayOverlayElement = document.getElementById("gray-overlay-article");
        grayOverlayElement.style.display = "block";
    }else if(actionType === "untrash"){
        const grayOverlayElement = document.getElementById("gray-overlay-article");
        grayOverlayElement.style.display = "none";
    }else if(actionType === "trash-author"){
        const grayOverlayElement = document.getElementById("gray-overlay-author");
        grayOverlayElement.style.display = "block";
    }else if(actionType === "untrash-author"){
        const grayOverlayElement = document.getElementById("gray-overlay-author");
        grayOverlayElement.style.display = "none";
    }
}

//アイコン（ハートなど）の切り替え
function toggleIcon(actionType){
    document.getElementById(actionType).style.display = "none";
    document.getElementById(reverseType(actionType)).style.display = "block";
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ボタンを押したときに発火する関数を設定。
document.addEventListener('DOMContentLoaded', async () => {
    setActionToButton();
});

// ボタンにイベントリスナーを設定
function setActionToButton(){
    //いいね（ブックマーク、アーカイブ）に対して。
    document.getElementById("like").addEventListener("click", () => handleAction('like'));
    document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
    document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
    document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
    document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
    document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));
    document.getElementById("trash").addEventListener("click", () => handleAction('trash'));
    document.getElementById("untrash").addEventListener("click", () => handleAction('untrash'));
    //フォロー（アンフォロー）に対して
    document.getElementById("follow-author").addEventListener("click", () => handleAction('follow-author'));
    document.getElementById("unfollow-author").addEventListener("click", () => handleAction('unfollow-author'));
    document.getElementById("trash-author").addEventListener("click", () => handleAction('trash-author'));
    document.getElementById("untrash-author").addEventListener("click", () => handleAction('untrash-author'));
    //ログインボタン
    document.getElementById('loginForm').addEventListener('submit', login);
}

//いいね（ブックマーク、アーカイブ、ゴミ箱）をつけるリクエストを飛ばすメイン関数
async function handleAction(actionType) {
    try {
        const apiToken = await getApiToken();
        const method = getMethod(actionType);
        const articleUrl = await getCurrentTabUrl();
        const apiUrl = getApiUrl(actionType, articleUrl);
        const response = await sendApiRequest(method, apiToken, apiUrl);
        //画面に反映する
        updateButtonsVisibilityFromActionType(actionType);
        errorOrSuccessMsg("success", response.message);
    } catch (error) {
        errorOrSuccessMsg("error", error);
    }
}

//いいね（ブックマーク、アーカイブ）をつけたり外したりしたら下記を実行して表示・非表示を切り替える。
function updateButtonsVisibilityFromActionType(actionType) {
    toggleIcon(actionType);
    trashOverlay(actionType);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ユーザ情報、ユーザのいいね（ブックマーク、アーカイブ）の状態を取得する。
// ページを読み込んだ時に発火する関数
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await updateUserState();
    } catch (error) {
        errorOrSuccessMsg("error", error);
    }
});

//ユーザ情報やいいね（ブックマーク、アーカイブ）の状態を取得して表示する。
async function updateUserState(){
    try{
        //ユーザ情報を取得
        const responseUserData = await getUserInfo();
        changeVisibilityFromIsLoggedIn(true);
        showUserState(responseUserData);
        //いいね（ブックマーク、アーカイブ）の状態を取得
        const response = await getUserStateToArticle();
        updateButtonsVisibility(response);
        //フラッシュ
        errorOrSuccessMsg("success", response.message);
    }catch (error) {
        throw error;
    }
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////ユーザ情報を取得
//ユーザ情報を取得する。
async function getUserInfo() {
    try {
        const apiToken = await getApiToken();
        const apiUrl = baseUrl + '/user';
        const response = await sendApiRequest('GET', apiToken, apiUrl);
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

//ユーザ情報を表示する。
function showUserState(responseUserData){
    document.getElementById("userName").textContent = responseUserData.name;
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////ユーザのいいね（ブックマーク、アーカイブ）の状態を取得する。
// 現在の記事のいいね、ブックマーク、アーカイブの状態を取得
async function getUserStateToArticle() {
    try {
        const articleUrl = await getCurrentTabUrl();
        const apiToken = await getApiToken();//rejectされたときにcatchで捕捉されない？マジで疑問です。
        const apiUrl = baseUrl + `/get-state?articleUrl=${encodeURIComponent(articleUrl)}`;
        const response = await sendApiRequest('GET', apiToken, apiUrl);
        return response;
    } catch (error) {
        throw error;
    }
}

// ボタンの表示を更新する関数
function updateButtonsVisibility(response) {
    //全体のボタンに適用する
    document.getElementById("allButtons").style.display = "block";

    //////////////////////////////////////////////////
    // likeの状態に基づいてボタンを表示・非表示
    if (response.like) {
        toggleIcon("like");
    } else {
        toggleIcon("unlike");
    }

    // bookmarkの状態に基づいてボタンを表示・非表示
    if (response.bookmark) {
        toggleIcon("bookmark");
    } else {
        toggleIcon("unbookmark");
    }

    // archiveの状態に基づいてボタンを表示・非表示
    if (response.archive) {
        toggleIcon("archive");
    } else {
        toggleIcon("unarchive");
    }

    //trashについて
    if (response.trash) {
        toggleIcon("trash");
        trashOverlay("trash");
    } else {
        toggleIcon("untrash");
        trashOverlay("untrash");
    }

    //////////////////////////////////////////////////
    //followについて
    if (response.followAuthor) {
        toggleIcon("follow-author");
    } else {
        toggleIcon("unfollow-author");
    }

    //trashについて
    if (response.trashAuthor) {
        toggleIcon("trash-author");
        trashOverlay("trash-author");
    }else{
        toggleIcon("untrash-author");
        trashOverlay("untrash-author");
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ログインの処理
//ログインボタンを押すと発火する。
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await sendApiRequest('POST', null, baseUrl + '/login', { 'email': email, 'password': password });
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
        errorOrSuccessMsg("error", error);
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////