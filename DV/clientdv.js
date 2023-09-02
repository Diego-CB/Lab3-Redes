const readline = require('readline');
const filesystem = require('fs');

let topology;
let n_vecinos;
let contadorVecinos = 0;
let myvector;
let nodos;
let myIndex;
let myVecinos = [];
let globResponse = {
  "type" : "info",
  "headers" : {"from":"", "to":"", "hop_count":0},
  "payload" : []
}

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

function addMyVector(myvector){
  globResponse.payload[myIndex] = myvector
  for (let i = 0; i < myVecinos.length; i++) {
    globResponse.headers.to = myVecinos[i]
    console.log(globResponse)
    let stringPackage = JSON.stringify(globResponse);
    console.log(stringPackage)
  }
}

function agregarVecino() {
  // Si ya hemos llegado al máximo, terminamos
  if (contadorVecinos >= nodos.length-1) {
    console.log("Has alcanzado el límite de vecinos.");
    console.log("Array final:", myvector);
    addMyVector(myvector);
    rl.close();
    return;
  }
  // Si ya hemos llegado al máximo, terminamos
  rl.question("Nombre del vecino: ", nombre => {
    if (nodos.includes(nombre)){
      myVecinos.push(nombre)
      rl.question("Costo del vecino: ", costo => {
        const costoNumerico = parseInt(costo, 10);
        if (isNaN(costoNumerico)) {
          console.log("Por favor, introduce un número válido para el costo.");
        } else {
          myvector[nodos.indexOf(nombre)] = costoNumerico;
          contadorVecinos++;
        }
        
        // Preguntar si se quiere continuar agregando vecinos
        rl.question("¿Quieres agregar otro vecino? (Y/N): ", respuesta => {
          if (respuesta.toLowerCase() === 'y') {
            agregarVecino();
          } else {
            console.log("Array final:", myvector);
            addMyVector(myvector);
            rl.close();
          }
        });
      });
    } else {
      console.log('El nodo no existe');
      agregarVecino();
    }
  });
}


function promptMenu() {
  rl.question('Que nodo soy? ', nodeid => {
    globResponse.headers.from = nodeid;
    filesystem.readFile('./DV/topology.json', 'utf8', (err, data) => {
      if (err) {
        console.log(`Error leyendo el archivo desde el disco: ${err}`);
      } else {
        topology = JSON.parse(data);
        nodos = topology.nodos;
        
        //Agregar los vectores de todos los nodos
        for (let i = 0; i < nodos.length; i++) {
          let newarr = new Array(nodos.length).fill(0);
          globResponse.payload.push(newarr)
        }
        if (nodos.includes(nodeid)) {
          myIndex = nodos.indexOf(nodeid)
          //'El nodo existe'
          myvector = new Array(nodos.length).fill(0);
          rl.question(`Quieres agregar un vecino? (Y/N)`, addvec => {
            if(addvec.toLowerCase() === 'y') {
              agregarVecino()
            }else {
              promptMenu2();
            }
          })
        } else {
          console.log('El nodo no existe');
        }
      }
    });
  });
}

function promptMenu2() {
  rl.question('Que quieres hacer ahora?\n1. Recibir vector\n2. Enviar mensaje\n', option => {
    if (option == '1') {
      rl.question('Ingrese el paquete', paquete => {
        let jsonPackage = JSON.parse(paquete);
        console.log(jsonPackage)
      })
    } else {
      rl.close()
    }
  });
}

console.log('\tWELCOME TO ProXMPP')
promptMenu();