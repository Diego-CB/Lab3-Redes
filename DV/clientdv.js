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

function inputVecino(json){
  let nodos = json.nodos


  rl.question('Quieres agregar un vecino? (Y/N)', option1 => {
    if (option.toLowerCase() === 'y') {
      rl.question('Como se llama el vecino', vecinoID => {
        if (nodos.includes(vecinoID)) {
          rl.close();
          //El vecino si existe
          neighborindex = nodos.indexOf(vecinoID)
          rl.question('Cual es el costo de enlace con este vecino', cost => {
            // Usando parseInt para convertir la cadena 'cost' en un número entero
            const cost = parseInt(cost, 10);
            // Asegurarte de que tienes un número
            if (isNaN(cost)) {
              console.log('Por favor, introduce un número válido.');
              return null
            } else {
              //Se ingreso un costo valido 
              return cost, neighborindex;
            }
          });
        } else {
          console.log('El vecino no existe en la topologia')
          return null, null
        }
      });
    } 
  });
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
          //'El nodo existe'
          inputVecino(json)
          indexnode = nodos.indexOf(nodeid)
          let myvector = new Array(nodos.length).fill(0);
          let localTopology = []
        } else {
          console.log('El nodo no existe')
        }
      }
    });
  });
}

console.log('\tWELCOME TO ProXMPP')
promptMenu();
