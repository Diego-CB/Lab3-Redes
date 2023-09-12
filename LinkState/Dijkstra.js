// Code based on https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/

class Dijkstra {

    constructor() {
        this.V = 0
        this.routing_table = []
    }

    /**
     * Finds the unvisited node with the minimun cost 
     * @param {Array[Array[number]]} route_tree
     * @param {Array[number]} visited_list 
     * @returns the node with the min cost
     */
    min_distance(route_tree, visited_list) {
        let min = Number.MAX_VALUE
        let min_index = -1
        
        for(let v = 0; v < this.V; v++) {
            if (!visited_list.includes(v) && route_tree[v][0] <= min){
                min = route_tree[v][0]
                min_index = v
            }
        }
        
        return min_index
    }

    /**
     * Dijkstra algorithm implementation
     * @param {number} src Source to calculate routes from
     * @returns 
     */
    dijkstra_alg(src) {
        const visited_list = []
        const route_tree = new Array(this.V).fill([Number.MAX_VALUE, undefined])
        route_tree[src] = [0, src]
        
        // Find shortest path for all vertices (except src)
        for (let _ = 0; _ < this.V - 1; _++) {
            const actual_node = this.min_distance(route_tree, visited_list)        
            visited_list.push(actual_node)
            
            for (let v = 0; v < this.V; v++) {
                if (
                    this.graph[actual_node][v] > 0 &&
                    route_tree[actual_node][0] < Number.MAX_VALUE &&
                    route_tree[actual_node][0] + this.graph[actual_node][v] < route_tree[v][0]
                ){
                    route_tree[v] = [
                        route_tree[actual_node][0] + this.graph[actual_node][v],
                        actual_node
                    ]
                }
            }
        }

        return route_tree
    }

    /**
     * Builds the rputing tables for all the nodes in topology
     * @param {Array[Array[number]]} graph adyascence graph of the topology
     */
    build_routing(graph) {
        this.V = graph.length
        this.routing_table = []
        this.graph = graph
        for (let src= 0; src < this.V; src++) {
            const new_tree = this.dijkstra_alg(src)
            this.routing_table.push(new_tree)
        }
    }

    /**
     * Gets the steps and cost to certain node
     * @param {number} target target node
     * @param {Array[Array[number]]} route_tree
     * @param {number} src source node
     * @returns the steps and costs of the route
     */
    get_route(target, src) {
        // Paso base, si el destino es igual al inicio
        if (target === src) return [[target], 0]
        
        // Se busca el proximo paso en la tabla de ruteo
        const [cost, next_node] = this.routing_table[src][target]

        // Paso base, si el destino es vecino del origen se devuelve ruta
        if (next_node === src) return [[src, target], cost]

        // Si la ruta es large, se calcula recursivamente
        const [next_setps, _] = this.get_route(target, next_node)

        return [[src, ...next_setps], cost]
    }
}

module.exports = {
    Dijkstra
}