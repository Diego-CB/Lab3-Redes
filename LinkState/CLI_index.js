const { Dijkstra } = require('./Dijkstra')
const { makeJson, make_disc_msg, build_graph } = require('./LS')
const {
    input,
    print,
    intInput,
    show_discover,
} = require('./util')

const menu_discover = '\n' + 
    '---------------------------- \n' +
    '1) Ingresar mensaje de descubrimiento \n' +
    '2) Mostrar mensajes de descubrimiento\n' +
    '3) Ya no hay mensajes\n' +
    '>  '

const menu_msg = '\n' + 
    '---------------------------- \n' +
    '1) Enviar mensaje \n' +
    '2) Recibir mensaje\n' +
    's) Salir\n' +
    '>  '

// Main
const main = async () => {
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

    print('\n---- Fase de descrubrimiento ----')
    print('\n-> Mensjaes de descubrimiento salientes:')
    
    const desc_msg = make_disc_msg(topology)
    await show_discover(desc_msg)
    
    let finish_discover

    while (finish_discover != '3') {
        finish_discover = await input(menu_discover)

        if (finish_discover === '1') {
            let discover_msg = await input('Ingrese el mensaje: ')
            discover_msg = JSON.parse(discover_msg)
            const from = discover_msg.headers.from
            const payload_info = discover_msg.payload.split('->')
            const to = payload_info[0]
            const cost = parseInt(payload_info[1])
            topology.push({from, to, cost})

        } else if (finish_discover === '2') {
            await show_discover(desc_msg)
        }
    }

    print('\n---- Fase Calculo de tablas de enrutamiento ----\n')

    const [graph, index_map] = build_graph(topology)
    const Dijkstra_calc = new Dijkstra() 
    Dijkstra_calc.build_routing(graph)
    print('\n> Se calculo la tabla de ruteo exitosamente')

    print('---- Fase de envio de mensajes ----')
    const reverse_map = Object.entries(index_map).map(([key, value]) => [value, key])
    let option_msg

    while (option_msg != 's') {
        option_msg = await input(menu_msg)

        if (option_msg === '1') {
            const destin = await input('Ingrese destinatario: ')
            const payload = await input('Ingrese Payload: ')

            // Calcular ruta
            const [steps, cost] = Dijkstra_calc.get_route(index_map[destin], index_map[node_name])
            
            // Preparar prints
            const str_steps = steps.map(node => reverse_map[node][1])
                .reduce((acc, value) => acc + ' -> ' + value, '')
            const to_send_msg = JSON.stringify(makeJson('message', node_name, destin, payload))

            //prints
            print('---- Ruta calculada ----')
            print('Ruta a seguir' + str_steps)
            print('Costo:', cost)
            console.log('Enviar mensaje a:', reverse_map[steps[1]][1])

            print('Mensaje a Enviar:')
            print(to_send_msg)

        } else if (option_msg === '2') {
            const msg = await input('Ingrese el mensaje entrante: ')
            const json_msg = JSON.parse(msg)
            const to = json_msg.headers.to

            if (to == node_name) {
                print('mensaje recibido de', json_msg.headers.from)
                print('>', json_msg.payload)

            } else {
                const [destin, src] = [index_map[to], index_map[node_name]]
                const [steps, cost] = Dijkstra_calc.get_route(destin, src)

                const str_steps = steps.map(node => reverse_map[node][1])
                    .reduce((acc, value) => acc + ' -> ' + value, '')

                print('---- Reenviar mensaje ----')
                print('Ruta a seguir' + str_steps)
                print('Costo faltante:', cost)

                print('Reenviar mensaje a:', reverse_map[steps[1]][1])
                const to_send_msg =
                    JSON.stringify(makeJson(
                        'message',
                        json_msg.headers.from,
                        to,
                        json_msg.payload,
                        json_msg.headers.hop_count + 1
                    ))

                print(to_send_msg)
            }
        }
    }

    print('\nGracias por usar el cliente Link State!!')
}

main()

