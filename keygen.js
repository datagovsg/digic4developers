function generateRSAKeyPairs(b) {
  const key = new NodeRSA({ b });
  const publicKey = key.exportKey('pkcs8-public-pem')
  const privateKey = key.exportKey('pkcs8-private-pem')
  document.getElementById('public-key').innerText = publicKey
  document.getElementById('private-key').innerText = privateKey
}

document.getElementById('generate-keys').onclick = generateRSAKeyPairs.bind(this, 1024)
document.getElementById('generate-keys-big').onclick = generateRSAKeyPairs.bind(this, 2048)

new ClipboardJS('.btn')
