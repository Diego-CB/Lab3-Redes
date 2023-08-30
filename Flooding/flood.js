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
            // neighbor.receiveMessage(message);
            console.log(` >> Message was sent to ${neighbor} by ${node.name}. The JSON sent was:\n${JSON.stringify(message, null, 2)}`);
            const jsonString = JSON.stringify(message);
            console.log(`\n  >>${jsonString}`)
        });
    }
}

module.exports = {
    Flood
};