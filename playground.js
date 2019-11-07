// let server = "https://api-staging.id.gov.sg"
window.getEl = document.getElementById.bind(document)
window.scrollToView = function (el) {
  el.hidden = false;
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
  }, 200);
}

new ClipboardJS('.btn')

var serverEl = getEl('server')
var clientIdEl = getEl('clientid')
var redirectUriEl = getEl('redirecturi')
var purposeEl = getEl('purpose')
var scopeEl = getEl('scope')
var stateEl = getEl('state')
var clientSecretEl = getEl('clientsecret')
var codeEl = getEl('code')

var data = {
  server: server.value,
  clientid: 'CLIENT_ID',
  redirecturi: 'REDIRECT_URI',
  purpose: 'PURPOSE',
  scope: 'sgid name dob',
  state: 'STATE',
  clientsecret: 'CLIENT_SECRET',
  code: 'AUTH_CODE',
}

// STARTUP
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('select')
  M.FormSelect.init(elems, {})
})
window.onload = function () {
  [serverEl, clientIdEl, redirectUriEl, purposeEl, scopeEl, stateEl, clientSecretEl, codeEl].forEach(function (el) {
    el.oninput = debouncedUpdate.bind(this)
    el.onchange = debouncedUpdate.bind(this)
  })
  createAuthorizationUrl()
  updateTokenBody()
}

var debouncedUpdate = function (event) {
  _.debounce(function () {
    var id = event.srcElement.id;
    data[id] = event.srcElement.value;
    createAuthorizationUrl()
    updateTokenBody()
  }, 300)()
}

function createAuthorizationUrl() {
  var url = data.server + '/oauth/authorize\n\t'
    + '?client_id=' + encodeURIComponent(data.clientid) + '\n\t'
    + '&redirect_uri=' + encodeURIComponent(data.redirecturi) + '\n\t'
    + '&purpose=' + encodeURIComponent(data.purpose) + '\n\t'
    + '&scope=' + encodeURIComponent(data.scope) + '\n\t'
    + '&response_type=code' + '\n\t'
    + '&state=' + encodeURIComponent(data.state)
  getEl('auth-url').innerText = url
}

getEl('auth-test').onclick = function () {
  window.open(getEl('auth-url').innerText, '_blank');
}

function updateTokenBody() {

  var tokenBody = `\
  POST /oauth/token
  Content-Type: application/x-www-form-urlencoded

  {
    "client_id": \"${data.clientid}\"
    "client_secret": \"${data.clientsecret}\"
    "redirect_uri": \:${data.redirecturi}\"
    "grant_type": "authorization_code"
    "code": \"${data.code}\"
  }
  `

  getEl('token-body').innerText = tokenBody
}


//  Step 3: Generate Login Button
var step3 = getEl('step3')
var authCodeEl = getEl('auth-code')
var exchangeUrlEl = getEl('exchange-url')
var exchangeBtn = getEl('exchange-btn')
function checkUrlQuery() {
  var params = new URLSearchParams(window.location.search);
  var storedState = params.get('state')
  if (!storedState) {
    return
  }
  var state = JSON.parse(atob(storedState))
  var { name, redirectUri, id, secret } = state
  nameEl.value = name
  redirectUriEl.value = redirectUri
  fillDetails(state)
  createRequestUrlButton(state)
  step2.hidden = false;


  var authCode = params.get('code')
  authCodeEl.innerText = authCode

  scrollToView(step3);


  var exchangeUrl = `${server}/oauth/token`
  var exchangeBody = querystring.stringify({
    grant_type: 'authorization_code',
    code: authCode,
    client_id: id,
    client_secret: secret,
    redirect_uri: redirectUri
  })
  var exchangeCode = `\
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

var step4 = getEl('step4')
var tokenResponseEl = getEl('access-token');
var clientSecretEl2 = getEl('client-secret-2');
var decodeBtn = getEl('decode-id')

function handleAccessToken(accessTokenJson) {
  tokenResponseEl.innerText = JSON.stringify(accessTokenJson, null, 2);
  var { access_token, token_type, expires_in, id_token } = accessTokenJson

  clientSecretEl2.value = clientSecretEl.innerText
  // Update text field label 
  M.updateTextFields();

  decodeBtn.onclick = () => {
    var decodedId = jwt.verify(id_token, clientSecretEl2.value)
    onDecodedIdtoken(access_token, decodedId)
  }

  scrollToView(step4);
}

var step5 = getEl('step5')
var decodedIdEl = getEl('decoded-id')
var userinfoUrlEl = getEl('userinfo-url')
var userInfoBtn = getEl('userinfo-btn')
function onDecodedIdtoken(accessToken, decodedId) {
  decodedIdEl.innerText = JSON.stringify(decodedId, null, 2);
  var url = `${server}/oauth/userinfo/${decodedId.sub}`
  userinfoUrlEl.innerText = `\
    Headers:
      Authorization: Bearer ${accessToken}

    GET ${server}/oauth/userinfo/<sub of user>
    GET ${server}/oauth/userinfo/${decodedId.sub}
  `
  userInfoBtn.onclick = getUserInfo.bind(this, accessToken, url)
  scrollToView(step5);
}

var step6 = getEl('step6')
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

var jweEl = getEl('jwe')
var privateKeyEl2 = getEl('private-key-2')
var decryptBtnEl = getEl('decrypt-btn')
function handleJwe(jwe) {
  jweEl.innerText = jwe
  privateKeyEl2.innerText = privateKeyEl.innerText
  decryptBtnEl.onclick = async () => {
    var privateKey = await jose.JWK.asKey(privateKeyEl2.innerText, 'pem')
    var decrypted = await jose.JWE.createDecrypt(privateKey).decrypt(jwe)
    handleUserInfoJws(decrypted.payload.toString())
  }
  scrollToView(step6);
}

var step7 = getEl('step7')
var step8 = getEl('step8')
var userInfoEl = getEl('user-info')
var jwsEl = getEl('jws')
var decodeBtn2 = getEl('decode-btn')
var startOver = getEl('start-over-btn')
function handleUserInfoJws(jws) {
  scrollToView(step7);
  jwsEl.innerText = jws
  decodeBtn2.onclick = () => {
    var userInfo = jwt.verify(jws, clientSecretEl2.value)
    userInfoEl.innerText = JSON.stringify(userInfo, null, 2)
    scrollToView(step8);
    startOver.onclick = () => {
      window.location.href = '.'
    }
  }
}

function generateClientSnippet(url) {
  return `
  <button class="digic-login-btn">
    <a href="${url}"> Sign in with Digital-ID</a>
  </button>

  `
}

function generateExpressSnippet(clientId, redirectUri) {
  return `
      var accessTokenJson = await got.post('${server}/oauth/token', {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          body:
              querystring.stringify({
                  grant_type: 'authorization_code',
                  code: req.query.code,
                  client_id: '${clientId}',
                  client_secret: CLIENT_SECRET,
                  redirect_uri: '${redirectUri}'
              })

      })

      var { access_token, id_token } = JSON.parse(accessTokenJson.body)
      var { sub } = jwt.verify(id_token, CLIENT_SECRET)
      var jwe = await got('${server}/oauth/userinfo/' + sub, {
          headers: {
              Authorization: 'Bearer ' + access_token
          }
      })
      var privateKey = await jose.JWK.asKey(PRIVATE_KEY, 'pem')
      var decrypted = await jose.JWE.createDecrypt(privateKey).decrypt(jwe.body)
      var userInfo = jwt.verify(decrypted.payload.toString(), CLIENT_SECRET)
  `
}