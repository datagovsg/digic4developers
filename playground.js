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
  server: serverEl.value,
  clientid: 'CLIENT_ID',
  redirecturi: 'REDIRECT_URI',
  purpose: 'PURPOSE',
  scope: 'sgid name dob',
  state: 'STATE',
  clientsecret: 'CLIENT_SECRET',
  code: 'AUTH_CODE',
  accesstoken: 'ACCESS_TOKEN'
}

// STARTUP
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('select')
  M.FormSelect.init(elems, {})
  var collapsibles = document.querySelectorAll('.collapsible');
  M.Collapsible.init(collapsibles, {
    accordion: false
  });
})
window.onload = function () {
  [serverEl, clientIdEl, redirectUriEl, purposeEl, scopeEl, stateEl, clientSecretEl, codeEl].forEach(function (el) {
    el.oninput = debouncedUpdate.bind(this)
    el.onchange = debouncedUpdate.bind(this)
  })
  createAuthorizationUrl()
  updateTokenBody()
  updateUserInfoRequest()
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
POST ${data.server}/oauth/token
Content-Type: application/x-www-form-urlencoded

{
  "client_id": \"${data.clientid}\"
  "client_secret": \"${data.clientsecret}\"
  "redirect_uri": \"${data.redirecturi}\"
  "grant_type": "authorization_code"
  "code": \"${data.code}\"
}`
  getEl('token-body').innerText = tokenBody
}

getEl('token-test').onclick = function () {
  return fetch(`${data.server}/oauth/token`, {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      "client_id": data.clientid,
      "client_secret": data.clientsecret,
      "redirect_uri": data.redirecturi,
      "grant_type": "authorization_code",
      "code": data.code
    }),
  }).then(function (response) {
    return response.json()
  }).then(function (accessTokenJson) {
    getEl('token-response-div').classList.remove('hidden')
    getEl('token-response').innerText = JSON.stringify(accessTokenJson, null, 2);
  })
}

function updateUserInfoRequest() {
  getEl('userinfo-req').innerText = `\
GET ${data.server}/oauth/userinfo

Headers:
  Authorization: Bearer ${data.accesstoken}\
    `
}

getEl('userinfo-test').onclick = function () {
  return fetch(`${data.server}/oauth/userinfo`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + data.accesstoken
    }
  }).then(function (response) {
    return response.text()
  }).then(function (jwe) {
    getEl('userinfo-response-div').classList.remove('hidden')
    getEl('userinfo-response').innerText = jwe
  })
}
