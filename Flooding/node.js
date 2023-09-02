/*
Universidad del Valle de Guatemala
Redes
Marco Jurado 20308
Diego Cordova
Cristian Aguirre
Node.js
*/

const { Flood } = require("./flood");

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
        console.log(` >> Node ${this.name} created`);

    }

    /*
    Agrega un vecino al nodo actual.
    Parámetro: neighbor (Node) - El nodo vecino que se agregará.
    Descripción: Agrega un vecino al nodo haciendo así entonces una conexión
    entre ambos nodos con la relación de vecinos en la red para definir que 
    estos cuentan con una conexión entre si.
    */
    addNeighbor(neighbor) {
        this.neighbors.push(neighbor); // Agrega el nodo vecino a la lista de vecinos
        console.log(` >> Node ${this.name} added neighbor ${neighbor}`);
    }

    /*
    Mostrar los vecinos del nodo actual.
    Parámetro: n/a
    Descripción: Muestra los nodos (si existen) del nodo actual.
    */
    showNeighbors() {
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
        console.log(` >> Node ${this.name} received message: ${message}`);
        // Flooding!
        Flood.floodMessage(this, message);
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