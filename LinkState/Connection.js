const { client, xml } = require('@xmpp/client')
const { print, read_file } = require('./util')
const { make_disc_msg, build_graph, makeJson } = require('./LS')
const { Dijkstra } = require('./Dijkstra')

class LS_Node {
    constructor(node_name) {
        this.node_name = node_name
        this.xmpp = undefined
        this.password = 'redes2023'
    }

    async init() {
        // Leer archivos
        this.adress_map = (await read_file('./names-g4.txt'))['config']
        this.username = this.adress_map[this.node_name].toLowerCase()
        this.neighbors = (await read_file('./topo-g4.txt'))['config'][this.node_name]

        // Llenar topologia
        this.topology = []
        this.neighbors.map((node) => this.topology.push({
            from: this.node_name,
            to: node,
            cost: 1,
        }))

        // construir tabla
        this.Dijkstra_calc = new Dijkstra()
        this.build_table()
    }

    build_table() {
        const [graph, index_map] = build_graph(this.topology)
        this.graph = graph
        this.index_map = index_map
        this.Dijkstra_calc.build_routing(this.graph)
        this.reverse_map = Object.entries(index_map).map(([key, value]) => [value, key])
    }

    #restart_xmpp() {
        const cleint_info = {
            service: 'xmpp://alumchat.xyz:5222',
            domain: 'alumchat.xyz',
            username: this.username.split('@')[0],
            password: this.password,
            terminal: true,
            tls: {
                rejectUnauthorized: false
            },
        }
        return client(cleint_info)
    }

    async disconnect() {
        await this.xmpp.stop()
        print('> Desconectado del server')
    }

    async login() {
        print('> Iniciando Login en el server')
        this.xmpp = this.#restart_xmpp()

        // Notificaciones
        this.xmpp.on('stanza', async (stanza) => {
            // Recibir mensajes directos
            if (stanza.is('message') && stanza.attrs.type == 'chat') {
                const body = stanza.getChildText('body')
                const json_body = JSON.parse(body)
                console.log(json_body)
                if (json_body.headers.algorithm === 'LS') {

                    const from = json_body.headers.from
                    
                    // Recibir mensajes
                    if (json_body.type === 'message') {
                        const to = json_body.headers.to
                        
                        // Recibir mensaje
                        if (to == this.node_name) {
                            print('> Se recibio mensaje de', from)
                            print(json_body.payload)
                            
                    // Reenviar mensaje (ruteo)
                    } else {
                        const [destin, src] = [this.index_map[to], this.index_map[this.node_name]]
                        const [steps, cost] = this.Dijkstra_calc.get_route(destin, src)
        
                        const to_send_msg = JSON.stringify(makeJson(
                            'message',
                            json_body.headers.from,
                            to,
                            json_body.payload,
                            json_body.headers.hop_count + 1
                            ))
                            
                            await this.send(`G4_${to}@alumchat.xyz`, to_send_msg)
                            print('> Se reenvio mensaje a:', this.reverse_map[steps[1]][1])
                        }
                        
                        // Recibir nuevos mensajes de descubrimiento
                    } else if (json_body.type === 'info') {
                        // Recibir mensaje
                        const [from, to] = json_body.payload.split('->')
                        print('> Mensaje de descubrimiento recibido de', from)
                        console.log(json_body)
                        
                        // Recalcular tablas de ruteo
                        this.topology.push({from, to, cost: 1})
                        this.build_table()
                        
                        const to_send = json_body
                        to_send.headers.from = this.node_name
                        
                        // Reenviar mensaje de descrubrimiento a vecinos
                        this.neighbors.map(node => node != from && this.send(`G4_${node}@alumchat.xyz`, body))
                    }
                }
            }
        })
        
        return new Promise((resolve, reject) => {
            this.xmpp.on('online', async (address) => {
                const online_stanza = xml('presence', {},
                    xml('show', {}, 'available')
                )
                await this.xmpp.send(online_stanza)

                print('>', this.username, 'online')
                resolve()
            })

            this.xmpp.on('error', (err) => {
                reject(err)
            })

            this.xmpp.start().catch(reject)
        })
    }

    async send_discover() {
        this.disc_msg = make_disc_msg(this.topology)
        await this.disc_msg.map(async msg => {
            const to_send = JSON.parse(msg)
            to_send.headers.algorithm = 'LS'
            const to = to_send.headers.to
            await this.send(`g4_${to}@alumchat.xyz`, JSON.stringify(to_send))
        })
        print('> Se enviaron los mensajes de descubrimiento a los nodos vecinos')
    }

    async send(destin, msg) {
        const msg_stanza = xml(
            'message', {
                from: this.username, 
                to: destin,
                type: 'chat',
            },
            xml('body', {}, msg)
        )
        await this.xmpp.send(msg_stanza)
    }
}

module.exports = {
    LS_Node
}