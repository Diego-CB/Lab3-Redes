// Code based on https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/

/**
 * Finds the unvisited node with the minimun cost 
 * @param {Array[Array[number]]} route_tree
 * @param {Array[number]} visited_list 
 * @param {number} V
 * @returns the node with the min cost
 */
const min_distance = (route_tree,visited_list, V) => {
    // Initialize min value
    let min = Number.MAX_VALUE
    let min_index = -1
    
    for(let v = 0; v < V; v++) {
        if (!visited_list.includes(v) && route_tree[v][0] <= min){
            min = route_tree[v][0]
            min_index = v
        }
    }
    
    return min_index
}

/**
 * Dijkstra algorithm implementation
 * @param {Array[number[number]]} graph Adyasence graph of the topology
 * @param {number} src Source to calculate routes from
 * @returns 
 */
const dijkstra = (graph, src) => {
	const V = graph.length
    const visited_list = []
    const route_tree = new Array(V).fill([Number.MAX_VALUE, undefined])
    route_tree[src] = [0, src]
    
    // Find shortest path for all vertices (except src)
    for(let _ = 0; _ < V - 1; _++) {
        const actual_node = min_distance(route_tree, visited_list, V)        
        visited_list.push(actual_node)
        
        for(let v = 0; v < V; v++) {
            if (
				graph[actual_node][v] > 0 &&
                route_tree[actual_node][0] < Number.MAX_VALUE &&
                route_tree[actual_node][0] + graph[actual_node][v] < route_tree[v][0]
			){
                route_tree[v] = [
                    route_tree[actual_node][0] + graph[actual_node][v],
                    actual_node
                ]
            }
        }
    }

	return route_tree
}

module.exports = {
    dijkstra
}