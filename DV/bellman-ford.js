/*
Universidad del Valle de Guatemala
Redes
Cristian Aguirre 20231
Flooding.js
*/

const updateRoutingTable = (routingTable, newNodeIndex, newNodeVector) => {
  // Actualizamos el vector de distancia del nodo que recibió el nuevo vector
  routingTable[newNodeIndex] = newNodeVector;

  // Recorremos cada vector de distancia en la tabla de enrutamiento
  for (let i = 0; i < routingTable.length; i++) {
    // Saltamos el nodo que envió el nuevo vector, ya que su vector ya fue actualizado
    if (i === newNodeIndex) continue;

    // Recorremos cada distancia en el vector de distancia actual
    for (let j = 0; j < routingTable[i].length; j++) {
      // Saltamos la distancia del nodo a sí mismo
      if (i === j) continue;

      // Aplicamos Bellman-Ford para actualizar la distancia de 'i' a 'j'
      const currentDistance = routingTable[i][j];
      const newDistance = routingTable[i][newNodeIndex] + newNodeVector[j];
      routingTable[i][j] = Math.min(currentDistance, newDistance);
    }
  }

  return routingTable;
}

const bellmanFord = (tableA, tableB) => {
  const INF = 999;
  const linkCost = 1; // Costo de enlace entre A y B

  for (let i = 0; i < tableA.length; i++) {
      for (let j = 0; j < tableA[i].length; j++) {
          // Si pasando por B hay un camino más corto a j, actualizamos la tabla de A
          if (tableA[i][j] > tableB[i][j] + linkCost) {
              tableA[i][j] = tableB[i][j] + linkCost;
          }
      }
  }
  return tableA;
}

module.exports = {
  updateRoutingTable,
  bellmanFord
};