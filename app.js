const NodeRSA = require('node-rsa')

const server = "http://localhost:3000"

function generateRSAKeyPairs() {
  const key = new NodeRSA({ b: 1024 });
  const publicKey = key.exportKey('pkcs8-public-pem');
  const privateKey = key.exportKey('pkcs8-private-pem')
  return { publicKey, privateKey }

}

const result = document.getElementById('result');
const publicKeyEl = document.getElementById('public-key');
const privateKeyEl = document.getElementById('private-key');
document.getElementById('form').onsubmit = getCredentials;

function getCredentials(e) {
  e.preventDefault();
  const { publicKey, privateKey } = generateRSAKeyPairs()
  publicKeyEl.innerText = publicKey;
  privateKeyEl.innerText = privateKey;

  const name = document.getElementById('client-name').value
  const redirectUri = document.getElementById('redirect-url').value
  fetch(server + '/oauth/newclient', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      redirectUri,
      publicKey
    })
  }).then(async (res) => {
    const body = await res.json()
    if (!res.ok) {
      document.getElementById('error').innerText = body.message;
    } else {
      const { id, secret } = body
      document.getElementById('client-id').innerText = id;
      document.getElementById('client-secret').innerText = secret;
      result.hidden = false;
    }
  })
}
