/**
 * Generates a json (as described in protocol) with the given parameters
 * @param {'info'|'echo'|'message'} type 
 * @param {string} from 
 * @param {string} to 
 * @param {*} payload 
 * @param {int} hop_count 
 * @returns json Object
 */
const makeJson = (type, from, to, payload, hop_count = 0) => {
    if (!['info', 'message', 'echo'].includes(type)) {
        throw new Error(`Type "${type}" not valid`)
    }

    return {
        type,
        headers: {
            from,
            to,
            hop_count,
        },
        payload,
    }
}

/**
 * @param {Array[Object{to, from, cost}]} topology 
 * @returns The discovery message to be sent to the other nodes
 */
const make_disc_msg = (topology) => {
    const desc_msg = []

    topology.map(node => {
        const node_name = node.from
        const name = node.to
        const cost = node.cost

        topology.map(next_node => {
            
            if (next_node.to !== name) {
                let msg_json = makeJson('info', node_name, next_node.to, `${name}->${cost}`)
                msg_json = JSON.stringify(msg_json)
                desc_msg.push(msg_json)
            }
        })
    })

    return desc_msg
}

/**
 * Build adyasence graph based on topology array of objects
 * @param {Array[Object{to, from, cost}]} topology 
 * @returns the adyascence graph as a 2D array
 */
const build_graph = (topology) => {
    const node_list = []

    // Get Distinct nodes from topology
    topology.map(info => {
        const to = info.to
        const from = info.from
        
        !node_list.includes(to) && node_list.push(to)
        !node_list.includes(from) && node_list.push(from)
    })
    
    // Initialize adyacense graph with 0's
    const graph = new Array(node_list.length).fill(0)
        .map(() => new Array(node_list.length).fill(0))

    // Make index map from nodes names to index
    const index_map = {}
    node_list.map((node, index) => index_map[node] = index)

    // Fill adyasence graph with information from topology
    topology.map(info => {
        graph[index_map[info.from]][index_map[info.to]] = info.cost
        graph[index_map[info.to]][index_map[info.from]] = info.cost
    })

    return [graph, index_map]
}

// const topology = [
//     { from: 'b', to: 'a', cost: 1 },
//     { from: 'a', to: 'c', cost: 2 },
//     // { from: 'c', to: 'a', cost: 2 },
//     // { from: 'c', to: 'd', cost: 3 },
// ]

// const [result_graph, index_map] = build_graph(topology)
// console.log(index_map)
// console.log(result_graph)
// const { Dijkstra } = require('./Dijkstra')
// const Dijkstra_calc = new Dijkstra() 
// Dijkstra_calc.build_routing(result_graph)
// console.log(Dijkstra_calc.routing_table)

// const [route, cost] = Dijkstra_calc.get_route(2, 1)
// console.log(route)
// console.log(cost)

module.exports = {
    makeJson,
    make_disc_msg,
    build_graph
}
