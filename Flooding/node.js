/*
Universidad del Valle de Guatemala
Redes
Marco Jurado 20308
Diego Cordova
Cristian Aguirre
Node.js
*/

const { Flood } = require("./flood");
const { xmClient } = require("./xmClient");

class Node {
    /*
    Constructor de la clase Node
    Parámetro: name (string) - El nombre del nodo.
    Descripcion: Este método será utilizado para la creación de los nodos 
    o la representación de los mismos en la red implementada. 
    */
    constructor(name) {
        this.name = name; // Asigna el nombre del nodo.
        //this.password = password // Asigna la contraseña del nodo en el cliente.
        this.neighbors = []; // Inicializa la lista de vecinos del nodo.
        this.loggedClient = new xmClient(loggedInUser, loggedInPassword)

        this.server = "alumchat.xyz";
        this.conn = null;
        this.errorLogPath = "./Flooding/error-log-xmpp.txt";
        this.initErrorLog();
        this.userJID;
        this.addMessage = [];

        console.log(` >> Node ${this.name} created`);
    }

    initErrorLog() {
        fs.writeFileSync(this.errorLogPath, ""); // Limpia el archivo de registro de errores
    };

    logError(identifier, error) {
        const errorMsg = `Identifier: ${identifier}\nTimestamp: ${new Date().toISOString()}\nError: ${error}\n\n`;
        fs.appendFileSync(this.errorLogPath, errorMsg);
    };

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
            password: this.password,
            tls: {
                rejectUnauthorized: true,
            }
        });
    
        this.conn.on("online", async (jid) => {
            console.log("\n >> Login successful! JID:\n", jid.toString());
            this.userJID = jid.toString().split("/")[0];
            this.JIDdevice = jid.toString();
            
            // Cambiar el estado de presencia a "activo"
            const presenceStanza = xml(
                "presence",
                { xmlns: "jabber:client" },
                xml("show", {}, "chat"),
                xml("status", {}, "Active")
            );
            this.conn.send(presenceStanza);
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

                            console.log(` >> The user ${contactJID} sent empty message.`)

                        } else {

                            console.log(` >> New messages from ${contactJID}`);

                            try {
                                const jsonObject = JSON.parse(message);
                            
                                let messageType = jsonObject.type;
                                let from = jsonObject.headers.from;
                                let to = jsonObject.headers.to;
                                let hopCount = jsonObject.headers.hop_count;
                                let receivers = jsonObject.headers.recievers;
                                let payload = jsonObject.payload;
                    
                                if (from == this.name){
                                    console.log(` >> Message was sent by this user. No action needed.`);
                                    return 0
                                }
                                // si estoy en la lista no hago nada
                                if (receivers.find(elemento => elemento === this.name)) {
                                    console.log(` >> Message sent by ${contactJID} has been recieved already. No action needed. `);
                                    return 0
                                } else {
                                    // revisar si soy el to
                                    if (to == this.name){
                                        console.log(` >> Message sent by ${contactJID} has been forwarded to you.\n     The message is: ${payload}`)
                                        hopCount == 0
                                        receivers.push(this.name)
                                        return 2
                                    } else {
                                        // si no estoy en la lista y no soy en destinatario me agrego y envio el mensaje por flood a mis neighbors y reduzco el hopCount.
                                        hopCount = hopCount - 1
                                        receivers.push(this.name)
                    
                                        const paquete = {
                                            type: messageType,
                                            headers: {
                                                from: from,
                                                to: to,
                                                hop_count: hopCount,
                                                recievers: receivers
                                            },
                                            payload: payload
                                        }
                    
                                        this.floodMessage(paquete)
                    
                                    }
                                }
                                
                                
                                
                            } catch (error) {
                                console.error("Error al analizar el JSON:", error.message);
                            }
                        }
                        
                    }
                    
                    // añadir automaticamete a los vecinos
                    if (stanza.attrs.type === "subscribe") {
                        console.log(" >> Incoming contact request, approved!")
                        this.notifications.push(` New suscription from ${stanza.attrs.from} accepted.`)
                        // Aprobar automáticamente la solicitud de contacto
                        const approvePresence = xml(
                          "presence",
                          { to: stanza.attrs.from, type: "subscribed" }
                        );
                        this.conn.send(approvePresence);
                    }
                    
                    // revisar para tener vecinos actuales.
                    if (stanza.is("presence")) {
                        const presenceType = stanza.getChildText("status");
                        const contactJID = stanza.attrs.from;
                        const contactJIDWithoutResource = contactJID.toString().split("/")[0].trim();
                        const existingContact = this.contactosRoster.find(contact => contact[0] === contactJIDWithoutResource);
                        let  normalizedPresenceType;
                        

                        if(presenceType === null){
                            normalizedPresenceType = "online";
                            if (!existingContact) {
                                this.contactosRoster.push([contactJIDWithoutResource, "Active"]);
                            }

                        } else {
                            normalizedPresenceType = presenceType.toLowerCase().trim();
                            if (!existingContact) {
                                this.contactosRoster.push([contactJIDWithoutResource, stanza.getChildText("status"), presenceType]);
                            }
                        }
                        

                        if(contactJIDWithoutResource !== this.userJID) {
                            const tiempitostatus = new Date()
                            const hora = tiempitostatus.getHours();
                            const minutos = tiempitostatus.getMinutes();
                            const segundos = tiempitostatus.getSeconds();
                            
                            

                            if (
                                normalizedPresenceType === "offline" ||
                                normalizedPresenceType === "away" ||
                                normalizedPresenceType === "unavailable"
                            ) {
                                const contactJIDToRemove = contactJIDWithoutResource;

                                this.contactosRoster = this.contactosRoster.map(contact => {
                                    if (contact[0] === contactJIDToRemove) {
                                        return [contactJIDToRemove, "Offline"]; // Actualiza el estado
                                    }
                                    return contact;
                                });
                            }


                            if (presenceType === null) {
                                const contactJIDToRemove = contactJIDWithoutResource;


                                this.contactosRoster = this.contactosRoster.map(contact => {
                                    if (contact[0] === contactJIDToRemove) {
                                        return [contactJIDToRemove, "Active"]; // Actualiza el estado
                                    }
                                    return contact;
                                });
                            }

                            console.log(`\n >> The user ${contactJID} is now ${presenceType === null ? 'online' : presenceType}.\n`);
                            this.notifications.push(` ${contactJID} changed status to ${presenceType === null ? 'online' : presenceType} at ${hora}:${minutos}:${segundos}.\n`);


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
                xml("password", {}, this.password),
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
    Borrar una cuenta del servidor.
    Parámetro: n/a.
    Descripción: Borrar el nodo con las descripciones de usuario
    y contraseña respectivas en el servidor xmpp
    */
    async deleteAccount() {

        try {        
            
            const stanza = xml(
                "iq", 
                { type: "set", id: "delete-account"},
                xml("query", { xmlns: "jabber:iq:register" },
                xml("username", {}, this.username),
                xml("password", {}, this.password),
                xml("remove"),
            ));

            this.conn.send(stanza);
            console.log(" >> Account deleted succesfully! ")
        
        } catch (error) {
            const identifier = "deleteAccount";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during delete (check error-log-xmpp.txt for info).");
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
            this.neighbors.push(neighbor); // Agrega el nodo vecino a la lista de vecinos

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
    floodMessage(message) {
        console.log(` >> Node ${this.name} received message: ${message} and is now using Flooding Routing Algorithm.`);
        // Flooding!
        Flood.floodMessage(this, message);
    }

    /*
    Funcion para enviar el mensaje a un usuario en el servidor xmppp.
    Parámetro: userJID (string) - El JID o nombre de usuario completo de a quien se le enviará el mensaje.
               bodied (string) - El mensaje que se va a propagar.
    Descripción: Esta función toma xml de xmpp para JS y con la ayuda de la conexión
    abierta actualmente envía un mensaje el cual para flooding contendrá el JSON. 
    */
    async sendMessagesDM(userJID, bodied) {

        try {
            const messageStanza = xml(
                "message",
                { to: userJID, type: "chat" },
                xml("body", {}, bodied)
            );
            
            const response = await this.conn.send(messageStanza);
        } catch (error) {
            const identifier = "sendMessage";
            this.logError(identifier, error);
            console.error(" >> ERROR: Unable to send message (check error-log-xmpp.txt for more info).");
        }
    }

    /*
    Recibe un mensaje y lo reenvía a los nodos vecinos.
    Parámetro: message (string) - El mensaje que se está reenviando.
    Descripción: esta es una función ejecutada cuando un nodo recive un mensaje en la red
    es aqui donde para ejecutar la lógica de flooding se llama a la función de la clase
    Node floodMessage.
    */
    receiveMessage(message) {        
        try {
            const jsonObject = JSON.parse(message);
        
            let messageType = jsonObject.type;
            let from = jsonObject.headers.from;
            let to = jsonObject.headers.to;
            let hopCount = jsonObject.headers.hop_count;
            let receivers = jsonObject.headers.recievers;
            let payload = jsonObject.payload;

            if (from == this.name){
                console.log(` >> Message was sent by this user. No action needed.`);
                return 0
            }
            // si estoy en la lista no hago nada
            if (receivers.find(elemento => elemento === this.name)) {
                console.log("El elemento está en el array.");
                return 0
            } else {
                // revisar si soy el to
                if (to == this.name){
                    console.log(` >> Message recieved. The message is: ${payload}`)
                    hopCount == 0
                    receivers.push(this.name)
                    return 2
                } else {
                    // si no estoy en la lista y no soy en destinatario me agrego y envio el mensaje por flood a mis neighbors y reduzco el hopCount.
                    hopCount = hopCount - 1
                    receivers.push(this.name)

                    const paquete = {
                        type: messageType,
                        headers: {
                            from: from,
                            to: to,
                            hop_count: hopCount,
                            recievers: receivers
                        },
                        payload: payload
                    }

                    this.floodMessage(paquete)

                }
            }
            
            
            
        } catch (error) {
            console.error("Error al analizar el JSON:", error.message);
        }

        //this.floodMessage(message); // Reenvía el mensaje a los nodos vecinos
    }
}

module.exports = {
    Node
};