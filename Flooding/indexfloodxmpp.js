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

let loggedClient = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getInput = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
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
                const message = await getInput(' >> What message would you like to send:  ');
                const dest = await getInput(' >> Who do you want to send the message to?\n     Enter the name:  ');
                const hops = await getInput(' >> How many hops do you want the flooding to happen?\ Enter the ammount in numbers:  ');
                const recievers = [loggedClient.name]

                const paquete = {
                    type: "message",
                    headers: {
                        from: loggedClient.name,
                        to: dest,
                        hop_count: hops,
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
                console.log("Create node...");
                const name_create = await getInput(' >> Node name:  ');
                const password_create = await getInput(' >> Node password:  ');
                
                handleClientConnect(name_create, password_create);
                loggedClient.signup(name_login, password_login);
                break;
            
            case 2:
                console.log("Connect with node...");
                const name_login = await getInput(' >> Node name:  ');
                const password_login = await getInput(' >> Node password:  ');
                handleClientConnect(name_create, password_create);
                loggedClient.login(name_login, password_login);
                break;
            
            case 3:
                console.log("Add neighbor...");
                const neighbor = await getInput(' >> Enter the neighbors JID you want to add:  ');
                loggedClient.addNeighbor(neighbor);
                break;
            case 4:
                console.log("Showing neighbors...")
                loggedClient.showNeighbors();
                break;
            case 5:
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

    const choice = await getInput("\n >> Select an option: ");
    return parseInt(choice);
};

const showRoutingMenu = async () => {
    console.log("\n\n\n--- Routing Algorithms Menu ---");
    console.log("1. Start flooding algorithm");
    console.log("2. Back to Main Menu");

    const choice = await getInput("\n >> Select an option: ");
    return parseInt(choice);
};

const showManageMenu = async () => {
    console.log("\n\n\n--- Manage Nodes Menu ---");
    console.log("1. Create node");
    console.log("2. Connect with node");
    console.log("3. Add Neighbor to node");
    console.log("4. Show current neighbors");
    console.log("5. Back to Main Menu");

    const choice = await getInput("\n >> Select an option: ");
    return parseInt(choice);
};

/* La función "handleClientConnect" maneja la creación del objeto con la instancia de conexión al servidor XMPP. */
const handleClientConnect = async () => {
    loggedClient = new Node(loggedInUser, loggedInPassword);
}

main();
