const readline = require('readline');
const filesystem = require('fs');
const { client, xml } = require('@xmpp/client');
const bf = require('./bellman-ford');
const { bellmanFord } = bf;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentContactJid = null;
let myJID = null;
let sessionId;
let globResponse = {
  type : "",
  headers : {from:"", to:"", algorithm: 'Distance Vector'},
  payload : []
}
let topoJson;
let namesJson;
let identifier;
let counter = 0;

function getStatus(show){
  switch (show) {
    case 'chat':
      return '🟢 Available'
      break
    case 'away':
      return '🟠 Away'
      break
    case 'xa':
      return '🔴 Unavailable'
      break
    case 'dnd':
      return '⛔ Busy'
      break
    default:
      return '⭕ Undefined'
      break
  }
}



function register(user, password){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const xmpp = client({
    service: `xmpp://alumchat.xyz`,
    domain: 'alumchat.xyz',
    resource: 'CristianAguirreClient',
    username: 'cristianaguirre',
    password: 'cristian',
    tls: {
      rejectUnauthorized: true,
    }
  });

  xmpp.on('error', (err) => {
      console.error('Error:', err);
  });
  
  try {
      xmpp.start();
  
      xmpp.on('online', async () => {
  
        const stanza = xml(
          'iq', 
          { type: 'set', id: 'register1'},
          xml('query', { xmlns: 'jabber:iq:register' },
          xml("username", {}, user),
          xml("password", {}, password),
          )
        );
        await xmpp.send(stanza);
        console.log('Account created successfully!!');
        
        xmpp.disconnect();
      });
      // xmppConnection(user, password);
  
  } catch (error) {
      console.error('Connection error:', error);
  }
}

function readTopologyFile(route) {
    return new Promise((resolve, reject) => {
        filesystem.readFile(`./DV/${route}.txt`, 'utf8', (err, data) => {
            if (err) {
                reject(`Error leyendo el archivo desde el disco: ${err}`);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function showMenu(xmpp) {
  rl.question('Escoge una opcion:\n1. Iniciar descubrimiento\n2. Enviar mensaje\n3. Cerrar sesion\n', option => {
    switch (option.trim()) {
      case '1': //Mostrar todos los contactos y sus estados
        xmpp.send(
          xml(
            'iq',
            { type: 'get', id: 'roster_contacts' },
            xml('query', { xmlns: 'jabber:iq:roster' })
          )
        );
        break;
      case '2':
        console.log(`${'-'.repeat(80)}\n`)
        rl.question('Ingresa el JID del contacto al que deseas enviar un mensaje: ', toJid => {
          rl.question('Choose an option: \n1. Send text message\n2. Send .txt file\n3. Leave\n', option => {
            if (option == '1') {
              rl.question('Enter your message: ', async messageText => {
                if (!toJid.includes('@')) {
                  toJid = toJid + '@alumchat.xyz'
                } 
                const messageStanza = xml('message', { to: toJid, type: 'chat' }, xml('body', {}, messageText));
                await xmpp.send(messageStanza);
                console.log(`\n${'-'.repeat(80)}\n\tEl mensaje se ha enviado correctamente! :D\n${'-'.repeat(80)}`)
                showMenu(xmpp);
              });
            }  else {
              showMenu(xmpp);
            }
          })
        });
        break;
      case '3': //Cerrar sesion
        xmpp.send(xml('presence', {type: 'unavailable', id:'normalpresence'}));
        xmpp.stop();
        break;
      default:
        console.log('Opción no reconocida. Por favor, intenta de nuevo.');
        showMenu(); // Vuelve a mostrar el menú si la opción no es reconocida
        break;
    }
  });
};

function matricesAreDifferent(matrix1, matrix2) {

  // Verificar si ambas matrices tienen el mismo número de filas
  if (matrix1.length !== matrix2.length) {
    return true;
  }

  // Iterar sobre cada fila
  for (let i = 0; i < matrix1.length; i++) {
      // Verificar si ambas filas tienen el mismo número de columnas
      if (matrix1[i].length !== matrix2[i].length) {
        return true;
      }

      // Iterar sobre cada columna
      for (let j = 0; j < matrix1[i].length; j++) {
          if (matrix1[i][j] !== matrix2[i][j]) {
            return true;
          }
      }
  }

  // Si todas las comprobaciones pasan, las matrices son iguales
  return false;
}

function matricesAreEqual(matrix1, matrix2) {
  // Verificar si ambas matrices tienen el mismo número de filas
  if (matrix1.length !== matrix2.length) {
    return false;
  }

  // Iterar sobre cada fila
  for (let i = 0; i < matrix1.length; i++) {
      // Verificar si ambas filas tienen el mismo número de columnas
      if (matrix1[i].length !== matrix2[i].length) {
        return false;
      }

      // Iterar sobre cada columna
      for (let j = 0; j < matrix1[i].length; j++) {
          // console.log(`${matrix1[i][j]} !== ${matrix2[i][j]}?`)
          if (matrix1[i][j] !== matrix2[i][j]) {
            return false;
          }
      }
  }

  // Si todas las comprobaciones pasan, las matrices no son iguales
  return true;
}


//Cliente----------------------------------
  
function xmppConnection(username, password) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const domainName = 'alumchat.xyz'
    myJID = username.toUpperCase() + '@alumchat.xyz'
    sessionId = username.toUpperCase() + '@alumchat.xyz'
    let myTable
    
    globResponse.headers.from = sessionId

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
        console.log('🟢 Connected as', (username.toUpperCase() + '@alumchat.xyz'));
        xmpp.send(xml('presence',{type:'available', id:'normalpresence'}, xml('show', {}, 'chat')));
        try {
            namesJson = await readTopologyFile('names-g4');
            // console.log(names);
        } catch (error) {
            console.log(error);
        }

        //Encuentra el nombre del nodo
        for (let key in namesJson.config) {
            console.log(namesJson.config[key], username)
            
            if (namesJson.config[key] === sessionId) {
                identifier = key;
                break;
            }
        }

        try {
            topoJson = await readTopologyFile('topo-g4');
            // console.log(names);
        } catch (error) {
            console.log(error);
        }

        const positionNodes = Object.keys(topoJson.config) // Ex. [A, B, C, D, E, F...]
        const MyIndex = positionNodes.indexOf(identifier);

        let vecinos = topoJson.config[identifier]
        let table = [];

        let nodosNum = Object.keys(topoJson.config).length
        for (let i = 0; i < nodosNum; i++) {
          table.push(new Array(nodosNum).fill(999))
        }


        //Construir mi vector
        for (let i = 0; i < positionNodes.length; i++) {
          if (vecinos.includes(positionNodes[i])) {
            table[MyIndex][i] = 1;
          }
        }
        // console.log('Im',identifier, 'This is my vector')
        // console.log(table)
        myTable = table


      

        showMenu(xmpp);
    });
  
    xmpp.on('offline', async () => {
      console.log('🔴 Disconnected');
      promptMenu();
    });
  
    xmpp.start().then(()=>{
      xmpp.on('stanza', async (stanza) => {
        if (stanza.is('message')) {
            if (stanza.attrs.type === 'chat') {
              const from = stanza.attrs.from;  // Quién envió el mensaje
              // if (from !== sessionId.toLowerCase()+'/CristianAguirreClient') {
                const body = stanza.getChildText('body');  // Contenido del mensaje
                if (body) { // Algunos mensajes pueden no tener cuerpo, por lo que es importante verificar
                  let parsedBody = JSON.parse(body)
                  let payload = parsedBody.payload
                  if (parsedBody.type === 'info' && parsedBody.headers.algorithm === 'Distance Vector') {
                    console.log(`📩 Message from ${from}:`);
                    counter+=1
                    
                    receivedTable = payload
                    copyMyTable = myTable.map(row => [...row]);
                    console.log('Mi tabla es',myTable)
                    newTable = await bellmanFord(copyMyTable,receivedTable)
                    
                    console.log(matricesAreEqual(myTable,newTable))

                    console.log('La nueva tabla es',newTable)

                    // if (!matricesAreEqual(myTable,newTable)) {
                    if (counter <= 500) {
                      // console.log('Hubo cambios, se va a enviar')
                      myTable = newTable
                      await xmpp.send(
                        xml(
                          'iq',
                          { type: 'get', id: 'roster_contacts' },
                          xml('query', { xmlns: 'jabber:iq:roster' })
                        )
                      );
                    }
                  }
                }
              // }
              
              
              
              const coded_data = stanza.getChildText('attachment')
              if (coded_data) {
                  const decodedData = Buffer.from(coded_data, 'base64');
                  const filepath = `./downloads/${body}`
                  filesystem.writeFileSync(filepath, decodedData);
                  print('> archivo recibido guardado en:', filepath)
              }

            } else if (stanza.attrs.type === 'groupchat') {
              const from = stanza.attrs.from; // Quién envió el mensaje
              const body = stanza.getChildText('body'); // Contenido del mensaje
              // if (body) {
              //   console.log(`${'-'.repeat(80)}`)
              //   console.log('Group Chat')
              //   console.log(`${'-'.repeat(80)}`)  
              //   console.log(`📩 Group Message from ${from}: \n\t${body}`);
              // }
            }
            
        }

        if (stanza.is('presence')){
          if (stanza.attrs.type === 'subscribe'){
            const fromJid = stanza.attrs.from;

            // Responder automáticamente aceptando la solicitud de suscripción
            const subscribedStanza = xml('presence', { to: fromJid, type: 'subscribed' });
            xmpp.send(subscribedStanza);

            // También envía tu propia solicitud de suscripción a UserB
            const subscribeStanza = xml('presence', { to: fromJid, type: 'subscribe' });
            xmpp.send(subscribeStanza);

            

            const rosterAddStanza = xml(
                'iq',
                { type: 'set', id: 'add1' },
                xml('query', { xmlns: 'jabber:iq:roster' },
                    xml('item', { jid: fromJid, name: stanza.attrs.id })
                )
            );
            xmpp.send(rosterAddStanza);
          } 
          
          
          if (stanza.attrs.id == 'normalpresence') {
            const show = stanza.getChildText('show');
            const status = stanza.getChildText('status');
            const from = stanza.attrs.from;
            let type = stanza.attrs.type;

            if (show != null){
              type = getStatus(show)
              // console.log(`🔔 ${from} is ${type}.`);
              {status != null && console.log(`\tStatus message > ${status}`)}
            } else {
              if (type == 'unavailable') {
                type = '⚪ Offline'
              } else {
                type = '🟢 Available'
              }
              // console.log(`${'-'.repeat(80)}`);
              // console.log(`🔔 ${from} is ${type}.`);
              // console.log(`${'-'.repeat(80)}`);
            }
          }// else {
          //   console.log('Stanza probe', stanza.toString())
          // }

          

          
        }
        

        if (stanza.is('iq') && stanza.attrs.type === 'result') {
          const query = stanza.getChild('query');
          if (query && query.attrs.xmlns === 'jabber:iq:roster') {
            const contacts = query.getChildren('item');
            if (contacts.length > 0){
              contacts.forEach(async contact => {
                globResponse.type = 'info'
                globResponse.headers.to = contact.attrs.jid
                globResponse.payload = myTable
                // console.log(globResponse)
                const messageStanza = xml('message', { to: contact.attrs.jid, type: 'chat' }, xml('body', {}, JSON.stringify(globResponse)));
                await xmpp.send(messageStanza);
                console.log('📇 Table sent to', contact.attrs.jid);
              });
            }
            showMenu(xmpp);
          }
        }

        // Manejar la respuesta del roster
        

      });
    })
}


function promptMenu() {
  rl.question('Choose an option:\n1. Sign In\n2. Sign Up\n', option => {
    switch (option.trim()) {
      case '1':
        rl.question('Enter your username: ', username => {
          xmppConnection(username, 'redes2023');
            
        });
        break;
      case '2':
        rl.question('Enter your username: ', username => {
          rl.question('Enter your password: ', async password => {
            await register(username, password);
            
            promptMenu();
          });
        });
        break;
      default:
        console.log('Opción no reconocida. Por favor, intenta de nuevo.');
        promptMenu();
        break;
    }
  });
}

console.log('\tWELCOME TO ProXMPP')
promptMenu();
