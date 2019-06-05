document.getElementById("credentials").addEventListener('click', getCredentials);
const NodeRSA = require('node-rsa')

function generateRSAKeyPairs () {
  const key = new NodeRSA({b: 1024});
  const publicKey = key.exportKey('pkcs8-public-pem');
  const privateKey = key.exportKey('pkcs8-private-pem')
  return { publicKey, privateKey }

}

function getCredentials (){
  const { publicKey, privateKey } = generateRSAKeyPairs()

  const publicKeyDisplay = publicKey.slice(26,247);
  const privateKeyDisplay = privateKey.slice(27,890);
   
  console.log(publicKeyDisplay);
    document.getElementById('public-key').innerHTML=
    `<label for="Public-Key"> Public Key </label>
    <textarea class= "form-control" id="public-key">${publicKeyDisplay}</textarea>`
    document.getElementById('private-key').innerHTML= 
  `<label for= "Private Key"> Private Key </label>
  <textarea class="form-control" id="private-key">${privateKeyDisplay}</textarea>`;  
}

