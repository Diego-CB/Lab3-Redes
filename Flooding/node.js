/*
Universidad del Valle de Guatemala
Redes
Marco Jurado 20308
Diego Cordova
Cristian Aguirre
Node.js
*/

const { client, xml, jid } = require("@xmpp/client");
const fs = require("fs");

/*
Funcion read file
author: Diego Cordova
*/
const read_file = async filepath => {
    const data = await fs.readFileSync(filepath, 'utf8' )
    const parsed_data = JSON.parse(data)
    return parsed_data
}

class Node {
    /*
    Constructor de la clase Node
    Parámetro: name (string) - El nombre del nodo.
    Descripcion: Este método será utilizado para la creación de los nodos 
    o la representación de los mismos en la red implementada. 
    */
    constructor(name) {
        this.name = name; // Asigna el nombre del nodo.
        this.pass = 'redes2023'
        this.neighbors = []; // Inicializa la lista de vecinos del nodo.
        this.server = "alumchat.xyz";
        this.conn = null;
        this.errorLogPath = "./Flooding/error-log-xmpp.txt";
        this.initErrorLog();
        this.userJID;
    }

    initErrorLog() {
        fs.writeFileSync(this.errorLogPath, ""); // Limpia el archivo de registro de errores
    };

    logError(identifier, error) {
        const errorMsg = `Identifier: ${identifier}\nTimestamp: ${new Date().toISOString()}\nError: ${error}\n\n`;
        fs.appendFileSync(this.errorLogPath, errorMsg);
    };

    /*
    Funcion init para creacion de nodos en topologia
    author: Diego Cordova
    modificacion: no se realiza proceso de tablas requerido 
                  para link state y se simplifica la topologia
    */
    async init() {
        // Leer archivos
        this.adress_map = (await read_file('./names-g4.txt'))['config']
        this.userJID = this.adress_map[this.name].toLowerCase()
        this.username = this.userJID.split("@")[0]
        this.neighbors = (await read_file('./topo-g4.txt'))['config'][this.name]

        // Llenar topologia
        this.topology = []
        this.neighbors.map((node) => this.topology.push({
            from: this.name,
            to: node
        }))
    }

    /*
    Hacer login al servidor xmpp.
    Parámetro: n/a.
    Descripción: hace login del nodo con las descripciones de usuario
    y contraseña respectivas en el servidor xmpp
    */
    async login() {
        this.conn = client({
            service: "xmpp://alumchat.xyz:5222",
            domain: "alumchat.xyz",
            username: this.username,
            password: this.pass,
            terminal: true,
            tls: {
                rejectUnauthorized: true,
            }
        });
    
        this.conn.on("online", async (jid) => {
            this.userJID = jid.toString().split("/")[0];
            this.JIDdevice = jid.toString();
            
            // Cambiar el estado de presencia a "activo"
            const presenceStanza = xml(
                'presence', {},
                xml('show', {}, 'available')
            );
            await this.conn.send(presenceStanza);
            console.log("\n >> Login successful! JID:\n", this.JIDdevice);
        });
    
        this.conn.on("error", (err) => {
            const identifier = "login";
            this.logError(identifier, err);
        });

        
    
        try {
            this.conn.start().then(() => {

                
                this.conn.on("stanza", (stanza) => {
                    //console.log("\n\n\n >>>",stanza)
                    // opcion donde recibe los mensajes y comienza con flooding
                    if (stanza.is("message") && stanza.attrs.type === "chat") {
                        const contactJID = stanza.attrs.from;
                        const messageBody = stanza.getChildText("body");
                        if (messageBody === null) {

                            console.log(`\n------> The user ${contactJID} sent empty message.`)

                        } else {

                            console.log(`\n------> New messages from ${contactJID}`);

                            try {
                                const jsonObject = JSON.parse(messageBody);
                            
                                let messageType = jsonObject.type;
                                let from = jsonObject.headers.from;
                                let to = jsonObject.headers.to;
                                let receivers = jsonObject.headers.recievers;
                                let payload = jsonObject.payload;
                                let algorithm = jsonObject.alogorithm;
                    
                                if (algorithm != 'Flooding'){
                                    console.log(' >> Algorithm was not specified as Flooding. No action taken.')
                                }else {
                                    if (from == this.name){
                                        console.log(` >> Message was sent by this user. No action needed.`);
                                    } else {
                                        // si estoy en la lista no hago nada
                                        if (receivers.find(elemento => elemento === this.name)) {
                                            console.log(`          >> Message sent by ${contactJID} has been recieved already. No action needed. `);
                                        } else {
                                            // revisar si soy el to
                                            if (to == this.name){
                                                console.log(`          >> Message sent by ${contactJID} has been forwarded to you. The message is: \n\n          ${payload}`)
                                                receivers.push(this.name)
                                            } else {
                                                console.log(`          >> Message sent by ${contactJID} has been recieved and will now start flooding...`);
                                                // si no estoy en la lista y no soy en destinatario me agrego y envio el mensaje por flood a mis neighbors.
                                                receivers.push(this.name)
                            
                                                const paquete = {
                                                    type: messageType,
                                                    headers: {
                                                        from: from,
                                                        to: to,
                                                        recievers: receivers,
                                                        alogorithm: 'Flooding'
                                                    },
                                                    payload: payload
                                                }
                            
                                                this.floodMessage(paquete)
                            
                                            }
                                        }
                                    }
                                    
                                }
                                
                                
                                
                                
                            } catch (error) {
                                console.error("Error al analizar el JSON:", error.message);
                            }
                        }
                        
                    }

                });
            });
                
        } catch (error) {
            const identifier = "login";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during login: user might not exist (check error-log-xmpp.txt for info).");
            
        }
    }

    /*
    Hacer signup al servidor xmpp.
    Parámetro: n/a.
    Descripción: hace signup del nodo con las descripciones de usuario
    y contraseña respectivas en el servidor xmpp
    */
    async signup() {
        this.conn = client({
            service: "xmpp://alumchat.xyz:5222",
            domain: "alumchat.xyz",
            username: "jur20308main",
            password: "pass123",
        
            tls: {
              rejectUnauthorized: true,
            }
        });
    
        this.conn.on("error", (err) => {
            const identifier = "signup";
            this.logError(identifier, err);
            console.error(" >> ERROR: error happened during connection (check error-log-xmpp.txt for info).");
        });
        
        try {
            this.conn.start();
        
            this.conn.on("online", () => {
              console.log("XMPP connection online");
        
              const stanza = xml(
                "iq", 
                { type: "set", id: "register1"},
                xml("query", { xmlns: "jabber:iq:register" },
                xml("username", {}, this.username),
                xml("password", {}, this.pass),
                )
              );
            
                this.conn.send(stanza);
                console.log("Registration IQ sent successfully");
                
                this.conn.disconnect();
                console.log("Disconnected");
            });
            
        
        } catch (error) {
            const identifier = "signup";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during signup (check error-log-xmpp.txt for info).");
            
        }
    }

    /*
    Hacer logout al servidor xmpp.
    Parámetro: n/a.
    Descripción: hace logout del nodo con las descripciones de usuario
    y contraseña respectivas en el servidor xmpp
    */
    async logout() {
        try {
            // Espera a que se detenga la conexión
            // Cambiar el estado de presencia a "offline"
            const presenceStanza = xml(
                "presence",
                { xmlns: "jabber:client" },
                xml("show", {}, "chat"),
                xml("status", {}, "Offline")
            );
            this.conn.send(presenceStanza);

            await this.conn.stop();
            console.log(" >> Logout successful!")
            
        } catch (error) {
            const identifier = "logout";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during logout (check error-log-xmpp.txt for info).");
            
        }
    }

    /*
    Agrega un vecino al nodo actual.
    Parámetro: neighbor (Node) - El nodo vecino que se agregará.
    Descripción: Agrega un vecino al nodo haciendo así entonces una conexión
    entre ambos nodos con la relación de vecinos en la red para definir que 
    estos cuentan con una conexión entre si.
    */
    async addNeighbor(neighbor) {
        try {
            const subscribeStanza = xml(
                "presence",
                { from: this.userJID, to: neighbor, type: "subscribe" }
            );

            this.conn.send(subscribeStanza);
            //this.neighbors.push(neighbor); // Agrega el nodo vecino a la lista de vecinos

            console.log(` >> Node ${this.name} added neighbor ${neighbor}`);
        } catch (error) {
            const identifier = "addNeighbor";
            this.logError(identifier, error);
        }
    }

    /*
    Mostrar los vecinos del nodo actual.
    Parámetro: n/a
    Descripción: Muestra los nodos (si existen) del nodo actual.
    */
    async showNeighbors() {

        this.conn.send(xml(
            'iq',
            { type: 'get', id: 'roster1' },
            xml('query', { xmlns: 'jabber:iq:roster' })
        ));

        if (this.neighbors.length === 0) {
            console.log(`Node ${this.name} has no neighbors.`);
        } else {
            console.log(`Neighbors of Node ${this.name}:`);
            for (const neighbor of this.neighbors) {
                console.log(`  - ${neighbor}`);
            }
        }
    }
    

    /*
    Propaga un mensaje a través de los nodos vecinos usando el algoritmo de enrutamiento por inundación.
    Parámetro: message (string) - El mensaje que se va a propagar.
    Descripción: Este es el principal algoritmo de enrutamiento Flood donde se establece la logica 
    con la que operaran los nodos.
    */
    async floodMessage(message) {
        console.log('------------------------------------------------------------------------------------------')
        console.log(` >> Node ${this.name} is sending the message using Flooding Routing Algorithm.`);
        this.neighbors.forEach(neighbor => {

            let neighborJID = this.adress_map[neighbor].toLowerCase()

            console.log(`       - Message sent to ${neighbor} by ${this.name}`);
            const jsonString = JSON.stringify(message);
            console.log(`\n  >>${jsonString}`)

            this.sendMessagesDM(neighborJID, jsonString)

        });
        console.log(`The message sent was:\n     ->${message}.`);
        console.log('------------------------------------------------------------------------------------------')
    }

    /*
    Envia un mensaje.
    Parámetro: message (string) - El mensaje que se va a mandar.
               userJID (string) - El usuario al que se va a mandar
    Descripción: envia mensaje en servidor xmppp.
    */
    async sendMessagesDM(userJID, bodied) {
        try {
            const messageStanza = xml(
                "message", { 
                    to: userJID, 
                    type: "chat" },
                xml("body", {}, bodied)
            );
            
            const response = await this.conn.send(messageStanza);
        } catch (error) {
            const identifier = "sendMessage";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to send message (check error-log-xmpp.txt for more info).");
        }
    }
}

module.exports = {
    Node
};