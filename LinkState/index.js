const { input, print, intInput } = require('./util')
const { dijkstra } = require('./Dijkstra')

const menu_discover = '\n' + 
    '---------------------------- \n' +
    '1) Ingresar mensaje de descubrimiento \n' +
    '2) Ya no hay mensajes\n' +
    '>  '

const menu_msg = '\n' + 
    '---------------------------- \n' +
    '1) Enviar mensaje \n' +
    '2) Recibir mensaje\n' +
    '3) Mostrar mensajes de descubrimiento\n' +
    's) Salir\n' +
    '>  '

// Main
const main = async () => {
    // Uncomment for xmpp connection
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    print('---- Link State Routing ----')
    const node_name = await input('Ingrese nombre del nodo: ')
    const neighbors = []

    print('\n---- Ingreso de nodos vecinos ----')
    let finish_neighbors

    while (finish_neighbors != 'n') {
        let neighbor_name = await input('Ingrese el nombre del nodo vecino: ')
        let cost = await intInput(`Ingrese el costo de ${neighbor_name}: `)

        neighbors.push({
            name: neighbor_name,
            cost: cost,
        })

        finish_neighbors = await input('hay mas nodos vecinos? (s/n) ')
    }

    print('\n---- Fase de descrubrimiento ----')
    print('\n-> Mensjaes de descubrimiento salientes:')
    
    //TODO fix discovery msg
    const desc_msg = []
    neighbors.map(node => {
        const name = node.name
        const cost = node.cost

        const new_msg = neighbors.map(next_node => {
            if (next_node.name !== name) {
                desc_msg.push(`To ${next_node.name} from ${node_name}: Puedor ir a ${name} con costo ${cost}`)
            }
        })
    })

    desc_msg.map(msg => print(msg))
    await input('\nPresione ENTER para continuar')
    return

    let finish_discover

    while (finish_discover != '2') {
        finish_discover = await input(menu_discover)

        if (finish_discover === '1') {
            //TODO HANDLE discover msg
        }
    }

    //TODO calcular dijstra
    print('Se calculo la tabla de ruteo exitosamente')


    print('---- Fase de envio de mensajes ----')
    let option_msg

    while (option_msg != 's') {
        option_msg = await input(menu_msg)

        if (finish_discover === '1') {
            //TODO HANDLE enviar mensaje
        } else if (finish_discover === '2') {
            //TODO HANDLE Recibir mensaje
        } else if (finish_discover === '3') {
            desc_msg.map(msg => print(msg))
        }
    }

    print('\nGracias por usar el cliente Link State!!')
}

main()
