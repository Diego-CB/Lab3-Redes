/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
*/

/* Con la ayuda de la pagina oficial de conn client en 
   npm io se sabe algunos de los comandos y la forma de
   escribir las funciones que se necesitan para el manejo
   del cliente.
   https://npm.io/package/@conn/client
*/

const { client, xml, jid } = require("@xmpp/client");
const { Node } = require("./node");
const fs = require("fs");

class xmClient {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.serverAT = "@alumchat.xyz";
        this.errorLogPath = "error-log-xmpp.txt";
        this.initErrorLog();
        this.contactosRoster = []; // Array para almacenar los contactos
        this.userJID;
        this.conn = null;
    }

    initErrorLog() {
        fs.writeFileSync(this.errorLogPath, ""); // Limpia el archivo de registro de errores
    };

    logError(identifier, error) {
        const errorMsg = `Identifier: ${identifier}\nTimestamp: ${new Date().toISOString()}\nError: ${error}\n\n`;
        fs.appendFileSync(this.errorLogPath, errorMsg);
    };

    async createNode() {
        /* Create new client connection to server
        */
        this.conn = client({
            service: "xmpp://alumchat.xyz:5222",
            domain: "alumchat.xyz",
            username: this.username,
            password: this.password,
            tls: {
                rejectUnauthorized: true,
            }
        });

        /* Connection on
        */
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

        /* Listen for connection errors on login
        */
        this.conn.on("error", (err) => {
            const identifier = "login";
            this.logError(identifier, err);
            console.error(" >> ERROR: error happened login (check error-log-xmpp.txt for info).");
        });

        /* Read incoming stanzas
        */
        try {
            this.conn.start().then(() => {
                // Read Stanzas
            });

        } catch (error) {
            const identifier = "connStart";
            this.logError(identifier, error);
            console.error(" >> ERROR: error happened during connStart (check error-log-xmpp.txt for info).");

        }
    }
}

module.exports = {
    xmClient
};