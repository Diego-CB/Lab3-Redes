/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
  About:
  Client for connecting to an XMPP server using a JS script with the ability to manage accounts.
*/


/* Se importa el módulo xmClient desde el archivo "xmClient.js".
   Este es utilizado para crear las instancias de conexión necesarias
   para comunicarse con el servidor XMPP.
*/
const { xmClient } = require("./xmClient");

/* Se crea una función para permitir inputs async del usuario
   cuando se este usando el cliente. Esta función fue implementada
   con readline y posteriormente corregida y optimizada con la 
   ayuda de chat GPT. 
*/
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* Se importa el módulo readline para manejar la entrada de usuario desde la consola.
   Se crea una interfaz de lectura (rl) para leer las entradas del usuario.
   La función "input" se define como una función asíncrona que muestra un mensaje y
   espera la entrada del usuario. Se utiliza "rl.question" para obtener la entrada
   del usuario y se devuelve como una promesa. Esto permite que el input del usuario
   sea esperado por la ejecución asincrona del programa. 
*/
const input = async (msg) => {
    try {
        return await new Promise((resolve) => rl.question(msg, resolve));
    } catch (error) {
        console.error("Error al obtener la entrada:", error);
        throw error;
    }
};

const showMainMenu = async () => {
    console.log("\n\n\n--- Main Menu ---");
    console.log("1. Routing Algorithms");
    console.log("2. Manage Nodes");
    console.log("3. Exit");

    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};

const showRoutingMenu = async () => {
    console.log("\n\n\n--- Routing Algorithms Menu ---");
    console.log("1. Link State");
    console.log("2. Distance Vector");
    console.log("3. Flooding");
    console.log("4. Back to Main Menu");


    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};

const showManageMenu = async () => {
    console.log("\n\n\n--- Manage Nodes Menu ---");
    console.log("1. Create node");
    console.log("2. Add Neighbor to a node");
    console.log("3. Back to Main Menu");
    

    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};

/* La función "main" es la función principal del programa. 
   Aqui se muestra el menu principal
*/
const main = async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    while (true) {
        const choice = await showMainMenu(); //Muestra el menu principal del programa

        switch (choice) {
            case 1:
                await handleRouting(); //opcion de mensajeria
                break;
            case 2:
                await handleManagement(); // opcion de administración de cuentas
                break;
            case 3:
                console.log("Thanks for using the routing algorithm simulator program! Bye :)");
                rl.close();
                return; // Finaliza el programa
            default:
                console.log("Invalid option. Please try again.");
        }
    }
};

/* La función "handleRouting" maneja las opciones del menú 
   de algoritmos de enrutamiento creados.
*/
const handleRouting = async () => {
    while (true) {
        const choice = await showRoutingMenu();
        switch (choice) {
            case 1:
                console.log("Link State routing algorithm...")
                await loggedClient.sendLinkState(); // Link State routing

                break;
            case 2:
                console.log("Distance vector algorithm...")
                await loggedClient.sendDistanceVector(); // Distance Vector

                break;
            case 3:
                console.log("Flooding algorithm...")
                await loggedClient.sendFlooding(); // Distance Vector

                break;
            case 4:
                console.log("Returning to Main Menu...");
                return;
            default:
                console.log("Invalid option. Please try again.");
                
        }
    }
}

/* La función "handleManagement" maneja las opciones del menú 
   de creacion y manejo de nodos.
*/
const handleManagement = async () => {
    while (true) {
        const choice = await showRoutingMenu();
        switch (choice) {
            case 1:
                console.log("Create node...")
                await loggedClient.createNode(); // Create node

                break;
            case 2:
                console.log("Add neighbor...")
                await loggedClient.addNeighbor(); // Add neighbor

                break;
            case 3:
                console.log("Returning to Main Menu...");
                return;
            default:
                console.log("Invalid option. Please try again.");
                
        }
    }
}

/* La función "handleClientConnect" maneja la creación del objeto
   con la instancia de conexión al servidor XMPP. 
*/
const handleClientConnect = async () => {
    loggedClient = new xmClient(loggedInUser, loggedInPassword);
}

main();/* Llama a la función principal para iniciar el programa. */