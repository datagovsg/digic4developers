const NodeRSA = require('node-rsa')
const querystring = require('querystring');
const jwt = require('jsonwebtoken')
const jose = require('node-jose')
const server = "https://staging.digital-ic.sg"

window.getEl = document.getElementById.bind(document)

function generateRSAKeyPairs() {
  const key = new NodeRSA({ b: 1024 });
  const publicKey = key.exportKey('pkcs8-public-pem');
  const privateKey = key.exportKey('pkcs8-private-pem')
  return { publicKey, privateKey }
}

function scrollToView(el) {
  el.hidden = false;
  setTimeout(() => {
    el.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
  }, 200);
}

window.scrollToView = scrollToView

// STEP 1: Client Registration Form
const step1 = getEl('step1')
const nameEl = getEl('client-name')
const redirectUriEl = getEl('redirect-url')
redirectUriEl.value = document.location.href
step1.onsubmit = getCredentials;

// STEP 2: Client ID, Secret, key pair
const step2 = getEl('step2');
const publicKeyEl = getEl('public-key');
const privateKeyEl = getEl('private-key');
const loginBtn = getEl('login-btn');
const authUrl = getEl('auth-url');

function getCredentials(e) {
  e.preventDefault();
  const { publicKey, privateKey } = generateRSAKeyPairs()

  fetch(server + '/oauth/newclient', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: nameEl.value,
      redirectUri: redirectUriEl.value,
      publicKey
    })
  }).then(async (res) => {
    const body = await res.json()
    if (!res.ok) {
      getEl('error').innerText = body.message;
    } else {
      const { id, secret } = body

      const thingsToStore = {
        name: nameEl.value,
        redirectUri: redirectUriEl.value,
        id,
        secret,
        publicKey,
        privateKey
      }

      console.log(thingsToStore)
      fillDetails(thingsToStore)
      // Create Authorization Request URL
      createRequestUrlButton(thingsToStore)
      scrollToView(step2);
    }
  })
}

const clientIdEl = getEl('client-id')
const clientSecretEl = getEl('client-secret')

function fillDetails({ id, secret, publicKey, privateKey }) {
  clientIdEl.innerText = id;
  clientSecretEl.innerText = secret;
  publicKeyEl.innerText = publicKey;
  privateKeyEl.innerText = privateKey;
}

function createRequestUrlButton(thingsToStore) {
  const { id, redirectUri } = thingsToStore
  const url = server + '/oauth/authorize?'
    + 'client_id=' + id
    + '&redirect_uri=' + redirectUri
    + '&response_type=code'
    + '&scope=openid%20name%20sex%20race'
    + '&state='
  authUrl.innerHTML = url.replace(/[\?&]/g, (k) => `<br>${k}`) + 'SOME_RANDOM_STRING'
  loginBtn.href = url + btoa(JSON.stringify(thingsToStore))
}

//  Step 3: Generate Login Button
const step3 = getEl('step3')
const authCodeEl = getEl('auth-code')
const exchangeUrlEl = getEl('exchange-url')
const exchangeBtn = getEl('exchange-btn')
function checkUrlQuery() {
  const params = new URLSearchParams(window.location.search);
  const storedState = params.get('state')
  if (!storedState) {
    return
  }
  const state = JSON.parse(atob(storedState))
  const { name, redirectUri, id, secret } = state
  nameEl.value = name
  redirectUriEl.value = redirectUri
  fillDetails(state)
  createRequestUrlButton(state)
  step2.hidden = false;


  const authCode = params.get('code')
  authCodeEl.innerText = authCode

  scrollToView(step3);


  const exchangeUrl = `${server}/oauth/token`
  const exchangeBody = querystring.stringify({
    grant_type: 'authorization_code',
    code: authCode,
    client_id: id,
    client_secret: secret,
    redirect_uri: redirectUri
  })
  const exchangeCode = `\
  POST ${exchangeUrl}
  Content-Type: application/x-www-form-urlencoded

    ${exchangeBody.replace(/[&]/g, (a) => `${a}\n`)}
  `

  exchangeUrlEl.innerText = exchangeCode
  exchangeBtn.onclick = onExchangeClick.bind(this, exchangeUrl, exchangeBody)

}
checkUrlQuery()

function onExchangeClick(exchangeUrl, exchangeBody) {
  console.log(exchangeUrl)
  return fetch(exchangeUrl, {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: exchangeBody,
  })
    .then(response => {
      return response.json()
    })
    .then(handleAccessToken)
}

const step4 = getEl('step4')
const tokenResponseEl = getEl('access-token');
const clientSecretEl2 = getEl('client-secret-2');
const decodeBtn = getEl('decode-id')

function handleAccessToken(accessTokenJson) {
  tokenResponseEl.innerText = JSON.stringify(accessTokenJson, null, 2);
  const { access_token, token_type, expires_in, id_token } = accessTokenJson

  clientSecretEl2.value = clientSecretEl.innerText
  // Update text field label 
  M.updateTextFields();

  decodeBtn.onclick = () => {
    const decodedId = jwt.verify(id_token, clientSecretEl2.value)
    onDecodedIdtoken(access_token, decodedId)
  }

  scrollToView(step4);
}

const step5 = getEl('step5')
const decodedIdEl = getEl('decoded-id')
const userinfoUrlEl = getEl('userinfo-url')
const userInfoBtn = getEl('userinfo-btn')
function onDecodedIdtoken(accessToken, decodedId) {
  decodedIdEl.innerText = JSON.stringify(decodedId, null, 2);
  const url = `${server}/oauth/userinfo/${decodedId.sub}`
  userinfoUrlEl.innerText = `\
    Headers:
      Authorization: Bearer ${accessToken}

    GET ${server}/oauth/userinfo/<sub of user>
    GET ${server}/oauth/userinfo/${decodedId.sub}
  `
  userInfoBtn.onclick = getUserInfo.bind(this, accessToken, url)
  scrollToView(step5);
}

const step6 = getEl('step6')
function getUserInfo(token, url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(response => response.text())
    .then(handleJwe)
}

const jweEl = getEl('jwe')
const privateKeyEl2 = getEl('private-key-2')
const decryptBtnEl = getEl('decrypt-btn')
function handleJwe(jwe) {  
  jweEl.innerText = jwe
  privateKeyEl2.innerText = privateKeyEl.innerText
  decryptBtnEl.onclick = async () => {
    const privateKey = await jose.JWK.asKey(privateKeyEl2.innerText, 'pem')
    const decrypted = await jose.JWE.createDecrypt(privateKey).decrypt(jwe)
    handleUserInfoJws(decrypted.payload.toString())
  }
  scrollToView(step6);
}

const step7 = getEl('step7')
const step8 = getEl('step8')
const userInfoEl = getEl('user-info')
const jwsEl = getEl('jws')
const decodeBtn2 = getEl('decode-btn')
const startOver = getEl('start-over-btn')
function handleUserInfoJws(jws) {
  scrollToView(step7);
  jwsEl.innerText = jws
  decodeBtn2.onclick = () => {
    const userInfo = jwt.verify(jws, clientSecretEl2.value)
    userInfoEl.innerText = JSON.stringify(userInfo, null, 2)
    scrollToView(step8);
    startOver.onclick = () => {
      window.location.href = '.'
    }
  }
}