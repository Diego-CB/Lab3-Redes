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
 * 
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
    // TODO implementar build_graph
    return []
}

module.exports = {
    makeJson,
    make_disc_msg,
    build_graph
}