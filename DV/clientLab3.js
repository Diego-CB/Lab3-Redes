const readline = require('readline');
const filesystem = require('fs');
const { client, xml } = require('@xmpp/client');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentContactJid = null;
let myJID = null;
let sessionId;


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
  rl.question('Choose an option:\n1. View Contacts\n2. Add New Contact\n3. Show Contact Details\n4. Send Message\n5. Group Message\n6. Change Status\n7. Log Out\n8. Delete Account\n', option => {
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
        // Agregar un nuevo contacto
        rl.question('Ingresa el JID del contacto que deseas agregar (ejemplo: usuario@alumchat.xyz): ', newContactJid => {
          rl.question('Name for your contact: ', contactName => {
            if (!newContactJid.includes('@')) {
                newContactJid = newContactJid + '@alumchat.xyz'
              } 
              // Solicita agregar el contacto al roster (lista de contactos)
              const subscribeStanza = xml('presence', { to: newContactJid, type: 'subscribe', id:contactName });
              xmpp.send(subscribeStanza);
              console.log(`Solicitud de subscripcion enviada a ${newContactJid}`)
              showMenu(xmpp);
            })
        });
        break;
      case '3': //Mostrar detalle de contacto 
        rl.question('Ingresa el JID del contacto que deseas ver (ejemplo: usuario@alumchat.xyz): ', contactJid => {
          currentContactJid = contactJid
          const contactDetailRequest = xml(
            'iq',
            { type: 'get', id: 'roster_detail' },
            xml('query', { xmlns: 'jabber:iq:roster' })
          );
          xmpp.send(contactDetailRequest);
          if (!contactJid.includes('@')) {
            contactJid = contactJid + '@alumchat.xyz'
          } 
          // const presenceProbe = xml('presence', { type: 'probe', to: contactJid, from:myJID, id:'probe' });
          // xmpp.send(presenceProbe);
        });
        showMenu(xmpp);
        break;
      case '4':
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
            } else if (option == '2') {
              rl.question('Enter the file path: ', async filepath => {
                const file = filesystem.readFileSync(filepath, { encoding: 'base64' })
                const payload = filepath.replace('./', '')
                await xmpp.send(
                  xml(
                      'message',
                      { to: toJid, type: 'chat' },
                      xml('body', {}, payload),
                      xml('attachment', { 
                          xmlns: 'urn:xmpp:attachment',
                          id: 'attachment1',
                          encoding: 'base64'
                      }, file)
                  )
                )
                console.log(`File sent to: ${toJid}`)
                showMenu(xmpp);
              })
            } else {
              showMenu(xmpp);
            }
          })
        });
        break;
      case '5':
        console.log(`${'-'.repeat(80)}\n`)
        rl.question('Enter the name of the group chat: ', async roomId => {
          const roomJid = `${roomId}@conference.alumchat.xyz`;
          const myNick = myJID;
          const createRoomStanza = xml('presence', { to: `${roomJid}/${myNick}` });
          await xmpp.send(createRoomStanza);

          rl.question('Enter your message: ', async groupMessage => {
            const groupMessageStanza = xml('message', { to: roomJid, type: 'groupchat' }, xml('body', {}, groupMessage));
            await xmpp.send(groupMessageStanza);
            showMenu(xmpp);
          })
          

        });
        break;
      case '6':
        console.log(`\n${'-'.repeat(80)}`)
        rl.question('Que estado desea establecer? \n1. Available\n2. Away\n3. Not available\n4. Busy\n', statusOption => {
          let statusValue;
          switch (statusOption.trim()) {
            case '1':
              statusValue = 'chat'
              break
            case '2':
              statusValue = 'away'
              break
            case '3':
              statusValue = 'xa'
              break
            case '4':
              statusValue = 'dnd'
              break
          }
          console.log(`${'-'.repeat(80)}`)
          rl.question('Status Message: ', async statusMessage => {
            await xmpp.send(xml('presence', {type:'available', id:'normalpresence'},  xml('show',{}, statusValue),xml('status', {}, statusMessage)));
            console.log(`The account status was set to ${statusValue} successfully.`)
            console.log(`${'-'.repeat(80)}`)
            setTimeout(() => {
              showMenu(xmpp);
            }, 500);
          });
        });
        break;
      case '7': //Cerrar sesion
        xmpp.send(xml('presence', {type: 'unavailable', id:'normalpresence'}));
        xmpp.stop();
        break;
      case '8': //Borrar Cuenta
        rl.question('Enter your password to confirm: ', pass => {
          xmpp.send(xml('presence', {type: 'unavailable', id:'normalpresence'}));
          console.log('🗑️ Your account has been deleted!')
          xmpp.send(
            xml(
            'iq', 
            { type: 'set', id: 'delete-account'},
            xml('query', { xmlns: 'jabber:iq:register' },
            xml("username", {}, sessionId),
            xml("password", {}, pass),
            xml("remove"),
            ))
          )
          xmpp.stop();
        });
        break;
      default:
        console.log('Opción no reconocida. Por favor, intenta de nuevo.');
        showMenu(); // Vuelve a mostrar el menú si la opción no es reconocida
        break;
    }
  });
};

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
        console.log('🟢 Connected as', (username + 'alumchat.xyz'));
        xmpp.send(xml('presence',{type:'available', id:'normalpresence'}, xml('show', {}, 'chat')));
        let names;

        readTopologyFile()
            .then(data => {
                names = data;
                console.log(topology);
            })
            .catch(error => {
                console.log(error);
            });
        console.log(names)
        showMenu(xmpp);
    });
  
    xmpp.on('offline', async () => {
      console.log('🔴 Disconnected');
      promptMenu();
    });
  
    xmpp.start().then(()=>{
      xmpp.on('stanza', async (stanza) => {
        // console.log('📝 Stanza recibida:', stanza.toString(), stanza.attrs.id);
        if (stanza.is('message')) {
            if (stanza.attrs.type === 'chat') {
              console.log('se recibio algo ')
              const from = stanza.attrs.from;  // Quién envió el mensaje
              const body = stanza.getChildText('body');  // Contenido del mensaje
              if (body) { // Algunos mensajes pueden no tener cuerpo, por lo que es importante verificar
                console.log(`${'-'.repeat(80)}`)
                console.log('Direct Chat')
                console.log(`${'-'.repeat(80)}`)  
                console.log(`📩 Message from ${from}: \n\t${body}`);
              }
              
              
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
              if (body) {
                console.log(`${'-'.repeat(80)}`)
                console.log('Group Chat')
                console.log(`${'-'.repeat(80)}`)  
                console.log(`📩 Group Message from ${from}: \n\t${body}`);
              }
            }
            console.log(`${'-'.repeat(80)}`)
            
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
            console.log(`🔔 You are now suscribed with ${stanza.attrs.id}|${fromJid}`);
          } 
          
          
          if (stanza.attrs.id == 'normalpresence') {
            const show = stanza.getChildText('show');
            const status = stanza.getChildText('status');
            const from = stanza.attrs.from;
            let type = stanza.attrs.type;

            if (show != null){
              type = getStatus(show)
              console.log(`${'-'.repeat(80)}`);
              console.log(`🔔 ${from} is ${type}.`);
              {status != null && console.log(`\tStatus message > ${status}`)}
              console.log(`${'-'.repeat(80)}`);
            } else {
              if (type == 'unavailable') {
                type = '⚪ Offline'
              } else {
                type = '🟢 Available'
              }
              console.log(`${'-'.repeat(80)}`);
              console.log(`🔔 ${from} is ${type}.`);
              console.log(`${'-'.repeat(80)}`);
            }
          }// else {
          //   console.log('Stanza probe', stanza.toString())
          // }

          

          
        }
        

        switch (stanza.attrs.id) {
          case 'roster_contacts':
            if (stanza.is('iq') && stanza.attrs.type === 'result') {
              const query = stanza.getChild('query');
              console.log(`\n${'-'.repeat(80)}\n\tContacts roster\n${'-'.repeat(80)}`)
              if (query && query.attrs.xmlns === 'jabber:iq:roster') {
                const contacts = query.getChildren('item');
                if (contacts.length > 0){
                  contacts.forEach(contact => {
                    console.log('📇 ', contact.attrs.jid);
                  });
                } else {
                  console.log('  You have no contacts....')
                }
                console.log(`${'-'.repeat(80)}`)
                showMenu(xmpp);
              }
            }
            break;
          case 'roster_detail':
            if (stanza.is('iq') && stanza.attrs.type === 'result') {
              const query = stanza.getChild('query');
              console.log(`\n${'-'.repeat(80)}\n\tResultado de busqueda\n${'-'.repeat(80)}`)
              if (query && query.attrs.xmlns === 'jabber:iq:roster') {
                const contacts = query.getChildren('item');
                if (!currentContactJid.includes('@')) {
                    currentContactJid = currentContactJid + '@' + domainName
                } 
                
                const specificContact = contacts.find(contact => contact.attrs.jid === currentContactJid);
                if (specificContact) {
                    console.log('Name: ', specificContact.attrs.name);
                    console.log('JID: ', specificContact.attrs.jid);
                    console.log('Subscription: ', specificContact.attrs.subscription);
                } else {
                    console.log("Contact doesn't exist");
                }
                console.log(`${'-'.repeat(80)}\n`)
                showMenu(xmpp);
              }
            }
            break;
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
          rl.question('Enter your password: ', async password => {
            // xmppConnection(username, password);
            let namesJson;
            try {
                namesJson = await readTopologyFile('names-g4');
                // console.log(names);
            } catch (error) {
                console.log(error);
            }

            let identifier;

            for (let key in namesJson.config) {
                if (namesJson.config[key] === username) {
                    identifier = key;
                    break;
                }
            }

            let topoJson;
            try {
                topoJson = await readTopologyFile('topo-g4');
                // console.log(names);
            } catch (error) {
                console.log(error);
            }
            let vecinos = topoJson.config[identifier]
            let table = [];

            for (let vecino of vecinos) {
                console.log(vecino)
                table.push([vecino, 1,vecino])
            }
            console.log(table)
          });
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
