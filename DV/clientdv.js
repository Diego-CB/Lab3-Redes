const readline = require('readline');
const filesystem = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//Cliente----------------------------------

function xmppConnection(username, password) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const domainName = 'alumchat.xyz'
  myJID = username + '@alumchat.xyz'
  sessionId = username + '@alumchat.xyz'

  // Creando el cliente XMPP
  const xmpp = client({
    service: `xmpp://alumchat.xyz`,
    domain: 'alumchat.xyz',
    resource: 'CristianAguirreClient',
    username: username,
    password: password,
    tls: {
      rejectUnauthorized: true,
    }
  });

  xmpp.on('error', err => {
    console.error('❌', err.toString());
  });
  xmpp.on('online', async (address) => {
    console.log('🟢 Connected as', address.toString());
  });

  xmpp.on('offline', async () => {
    console.log('🔴 Disconnected');
  });

  xmpp.start().then(() => {
    xmpp.on('stanza', async (stanza) => {

    });
  })
}


function promptMenu() {
  rl.question('Que nodo soy? ', nodeid => {

    filesystem.readFile('./DV/topology.json', 'utf8', (err, data) => {
      if (err) {
        console.log(`Error leyendo el archivo desde el disco: ${err}`);
      } else {
        const json = JSON.parse(data);
        let nodos = json.nodos
        if (nodos.includes(nodeid)) {
          console.log('El nodo existe')
          console.log(nodos);
          indexnode = nodos.indexOf(nodeid)
          let table = []
          let myTable = []
          for (let i = 0; i < nodos.length; i++) {
            if (i == indexnode) {
              table.push(json.topologia[i])
            } else {
              table.push(new Array(nodos.length).fill('∞'))
            }
            myTable.push(json.topologia[i])
          }
          console.log('')
          for (const elemento of table) {
            console.log(`| ${elemento} |`);
          }
          console.log('')
          for (const elemento of myTable) {
            console.log(`| ${elemento} |`);
          }
        } else {
          console.log('El nodo no existe')
        }
      }
    });
  });
}

console.log('\tWELCOME TO ProXMPP')
promptMenu();
