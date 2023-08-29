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
    constructor(name, password) {
        this.name = name; // Asigna el nombre del nodo.
        this.password = password // Asigna la contraseña del nodo en el cliente.
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
        console.log(` >> Node ${this.name} forwarding message: ${message}`);
        this.floodMessage(message); // Reenvía el mensaje a los nodos vecinos
    }
}

module.exports = {
    Node
};