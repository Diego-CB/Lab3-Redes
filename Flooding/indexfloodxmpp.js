/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
  About:
  Client for connecting to an XMPP server using a JS script with the ability to manage accounts.
*/

const readline = require('readline');
const { Node } = require('./node.js');

// VARIABLES IMPORTANTES
let loggedInUser = "";
let loggedInPassword = "";
let loggedClient = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const input = async (msg) => {
    try {
        return await new Promise((resolve) => rl.question(msg, resolve));
    } catch (error) {
        console.error("Error al obtener la entrada:", error);
        throw error;
    }
};

const main = async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    while (true) {
        const choice = await showMainMenu();

        switch (choice) {
            case 1:
                await handleRouting();
                break;
            case 2:
                await handleManagement();
                break;
            case 3:
                console.log("Thanks for using the routing algorithm simulator program! Bye :)");
                rl.close();
                return;
            default:
                console.log("Invalid option. Please try again.");
        }
    }
};

const handleRouting = async () => {
    while (true) {
        const choice = await showRoutingMenu();

        switch (choice) {
            case 1:
                console.log("Starting Flooding algorithm...");
                const dest = await input(' >> Who do you want to send the message to?\n     Enter the name:  ');
                const message = await input(' >> What message would you like to send:  ');
                const algorithm = 'Flooding';
                const recievers = [loggedClient.name];

                const paquete = {
                    type: "message",
                    headers: {
                        from: loggedClient.name,
                        to: dest,
                        algorithm: algorithm,
                        recievers: recievers
                    },
                    payload: message
                };  

                loggedClient.floodMessage(paquete); //Flooding happens

                break;
            case 2:
                console.log("Returning to Main Menu...");
                return;
            default:
                console.log("Invalid option. Please try again.");
        }
    }
};

const handleManagement = async () => {
    while (true) {
        const choice = await showManageMenu();

        switch (choice) {            
            case 1:
                loggedInUser = await input("Enter the node name: ");
                console.log("Logging in user:", loggedInUser);
                console.log("Password:", loggedInPassword);

                handleClientConnect();
                await loggedClient.init();
                await loggedClient.login();
                break;
            
            case 2:
                console.log("Add neighbor...");
                const neighbor = await input(' >> Enter the neighbors JID you want to add:  ');
                loggedClient.addNeighbor(neighbor);
                break;
            case 3:
                console.log("Showing neighbors...")
                loggedClient.showNeighbors();
                break;
            case 4:
                console.log("Returning to Main Menu...");
                return;
            default:
                console.log("Invalid option. Please try again.");
        }
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
    console.log("1. Start flooding algorithm");
    console.log("2. Back to Main Menu");

    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};

const showManageMenu = async () => {
    console.log("\n\n\n--- Manage Nodes Menu ---");
    console.log("1. Connect with node");
    console.log("2. Add Neighbor to node");
    console.log("3. Show current neighbors");
    console.log("4. Back to Main Menu");

    const choice = await input("\n >> Select an option: ");
    return parseInt(choice);
};

/* La función "handleClientConnect" maneja la creación del objeto con la instancia de conexión al servidor XMPP. */
const handleClientConnect = async () => {
    console.log(loggedInUser)
    loggedClient = new Node(loggedInUser);
}

main();
