function updateRoutingTable(routingTable, newNodeIndex, newNodeVector) {
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
  
  // Ejemplo de uso
  let routingTable = [
    [0, 3, 7],
    [0, 0, 0],
    [0, 0, 0]
  ];
  
  // Nodo A (índice 0) recibe un nuevo vector de Nodo B (índice 1)
  let newNodeIndex = 1;
  let newNodeVector = [3, 0, 2];
  
  console.log("Tabla de enrutamiento original:", routingTable);
  routingTable = updateRoutingTable(routingTable, newNodeIndex, newNodeVector);
  console.log("Tabla de enrutamiento actualizada:", routingTable);
  