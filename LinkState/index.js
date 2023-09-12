const { LS_Node } = require('./Connection')
const {
    input,
    print,
    intInput,
} = require('./util')

const menu_msg = '\n' + 
    '---------------------------- \n' +
    '1) Enviar mensaje \n' +
    's) Salir\n' +
    '>  '

// Main
const main = async () => {
    // Uncomment for xmpp connection
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    print('---- Link State Routing ----')
    const node_name = await input('Ingrese nombre del nodo: ')
    const topology = []

    print('\n---- Ingreso de nodos vecinos ----')
    let finish_neighbors

    while (finish_neighbors != 'n') {
        let neighbor_name = await input('Ingrese el nombre del nodo vecino: ')
        let cost = await intInput(`Ingrese el costo de ${neighbor_name}: `)

        topology.push({
            from: node_name,
            to: neighbor_name,
            cost: cost,
        })

        finish_neighbors = await input('hay mas nodos vecinos? (s/n) ')
    }

    let finish
    const node = new LS_Node(node_name)

    while (finish !== 's') {
        finish = await input(menu_msg)

        if (['s', '1'].includes(finish)) {
            if (finish !== '1') {
                print('Error: ingrese una opcion valida')
            }
            continue
        }

        const nodo = await input('Ingrese nodo a enviar mensaje: ')
        const msg = await input('Ingrese mensaje: ')
        const msg_json = {
            type: 'message',
            headers: {
                from: node_name,
                to: nodo,
                hop_count: 0,
                algorithm: 'LS'
            },
            payload: msg
        }
        const str_msg = JSON.stringify(msg_json)
        node.send(`G4_${nodo}@alumchat.xyz`, str_msg)
    }

    print('\nGracias por usar el cliente Link State!!')
}

main()
