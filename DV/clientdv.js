/*
Universidad del Valle de Guatemala
Redes
Cristian Aguirre 20231
Flooding.js
*/

const readline = require('readline');
const filesystem = require('fs');
const bf = require('./bellman-ford')
const { updateRoutingTable } = bf;

// Variables globales
let topology;
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

// Funcion para imprimir y preparar paquetes para enviar a vecinos
function outputPackage(){
  for (let i = 0; i < myVecinos.length; i++) {
    globResponse.headers.to = myVecinos[i]
    console.log(globResponse)
    let stringPackage = JSON.stringify(globResponse);
    console.log(stringPackage)
  }
}

//Funcion que anade el vector inicial del nodo que se esta ejecutando
function addMyVector(myvector){
  // Añadir mi vector a la respuesta global y llamar a outputPackage
  globResponse.payload[myIndex] = myvector
  outputPackage()
  globResponse.headers.to = ''
}

// Función para agregar un vecino y actualizar mi vector
function agregarVecino() {
  // Si ya hemos llegado al máximo, terminamos
  if (contadorVecinos >= nodos.length-1) {
    console.log("Has alcanzado el límite de vecinos.");
    console.log("Array final:", myvector);
    addMyVector(myvector);
    promptMenu2();
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
            promptMenu2();
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
  rl.question('Que quieres hacer ahora?\n1. Recibir vector\n2. Enviar mensaje\n3. Recibir mensaje\n', option => {
    if (option == '1') {
      rl.question('Ingrese el paquete: ', paquete => {
        let jsonPackage = JSON.parse(paquete);
        let newIndex = nodos.indexOf(jsonPackage.headers.from)
        let newVector = jsonPackage.payload[newIndex]
        let routingTable = globResponse.payload
        globResponse.payload = updateRoutingTable(routingTable, newIndex, newVector)
        outputPackage()
        promptMenu2()
      })
    } else if (option == '2') {
      globResponse.type = 'message'
      rl.question('A quien quieres enviar el mensaje: ', to => {
        if (nodos.includes(to)) {
          globResponse.headers.to = to
          rl.question('Ingrese el mensaje: ', message => {
            globResponse.payload = message
            console.log(globResponse)
            console.log(JSON.stringify(globResponse))
            promptMenu2()
          })
        } else {
          console.log('El nodo no existe');
        }
      })
    } else if (option == '3') {
      rl.question('Ingrese el input: ', paquete => {
        let jsonPackage = JSON.parse(paquete);
        if (jsonPackage.headers.to == globResponse.headers.from) {
          console.log('\nEl mensaje es ',jsonPackage.payload)
        } else {
          jsonPackage.headers.hop_count = jsonPackage.headers.hop_count + 1
          console.log(jsonPackage)
          console.log(JSON.stringify(jsonPackage))
        }
        promptMenu2()
      })
    } else {
      rl.close()
    }
  });
}

console.log('\tWELCOME TO ProXMPP')
promptMenu();