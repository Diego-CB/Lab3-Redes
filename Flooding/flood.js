/*
Universidad del Valle de Guatemala
Redes
Marco Jurado 20308
Flooding.js
*/
class Flood {
    static floodMessage(node, message) {
        console.log(`Node ${node.name} received message: ${message}`);
        node.neighbors.forEach(neighbor => {
            neighbor.receiveMessage(message);
        });
    }
}

module.exports = {
    Flood
};