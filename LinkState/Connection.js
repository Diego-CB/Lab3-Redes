const { client, xml } = require('@xmpp/client')
const { print, read_file } = require('./util')
const { make_disc_msg, build_graph, makeJson } = require('./LS')
const { Dijkstra } = require('./Dijkstra')

class LS_Node {
    constructor(node_name) {
        this.adress_map = read_file('./names-g4.txt').config
        this.node_name = node_name
        this.username = this.adress_map[node_name]
        this.neighbors = read_file('./topo-g4.txt').config[node_name]
        this.topology = []
        this.neighbors.map((node) => this.topology.push({
            from: node_name,
            to: node,
            cost: 1,
        }))
        console.log(this.topology)
        this.password = 'redes2023'
        this.xmpp = undefined
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
        return client({
            service: 'xmpp://alumchat.xyz:5222',
            domain: 'alumchat.xyz',
            username: this.username,
            password: this.password,
            terminal: true,
            tls: {
                rejectUnauthorized: false
            },
        })
    }

    async login() {
        this.xmpp = this.#restart_xmpp()

        // Notificaciones
        this.xmpp.on('stanza', async (stanza) => {
            // Recibir mensajes directos
            if (stanza.is('message') && stanza.attrs.type == 'chat') {
                const body = stanza.getChildText('body')
                const json_body = Json.parse(body)
                const from = json_body.headers.from

                // Recibir mensajes
                if (json_body.type === 'message') {
                    const to = json_body.headers.to

                    // Recibir mensaje
                    if (to == this.node_name) {
                        print('> Se recibio mensaje de', from)
                        print(json_msg.payload)

                    // Reenviar mensaje (ruteo)
                    } else {
                        const [destin, src] = [this.index_map[to], this.index_map[this.node_name]]
                        const [steps, cost] = this.Dijkstra_calc.get_route(destin, src)
        
                        const to_send_msg = JSON.stringify(makeJson(
                            'message',
                            json_msg.headers.from,
                            to,
                            json_msg.payload,
                            json_msg.headers.hop_count + 1
                        ))
                            
                        await this.send(`G4_${to}@alumchat.xyz`, to_send_msg)
                        print('> Se reenvio mensaje a:', this.reverse_map[steps[1]][1])
                    }

                // Recibir nuevos mensajes de descubrimiento
                } else if (json_body.type === 'info') {
                    const [to, cost] = json_body.payload.split('->')
                    this.topology.push({from, to, cost})
                    this.neighbors.map(node => this.send(`G4_${node}@alumchat.xyz`), body)
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
            const to = JSON.parse(msg).headers.to
            await this.send(`G4_${to}@alumchat.xyz`, msg)
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