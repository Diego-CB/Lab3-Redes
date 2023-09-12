
/**
 * Python "print" like function
 * @param  {...any} o any objects to be printed
 */
const print = (...o) => {
    if (o.length === 0) return console.log()

    const str = o.reduce(
        (acc, val) => acc.toString() + ' ' + val.toString(),
        ''
    )
    console.log(str)
}

// input async function
// para el desarrollo de esta funcion se utilizo chat gpt
// link del chat: https://chat.openai.com/share/14ee0c63-5daf-4ae5-a5fe-0c1e15d8621b
const input = async (msg) => {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve, reject) => {
        readline.question(msg, usr_input => {
            resolve(usr_input);
            readline.close();
        });
    });
}

/**
 * This function ask for user inputs, converts it to int and handle casting errors
 * @param {string} msg message to be shown in input
 * @returns the user input as integer
 */
const intInput = async (msg) => {
    while (true) {
        let input_str = parseInt(await input(msg))

        if (!isNaN(input_str)) {
            return input_str
        }

        print('ERROR: ingrese un numero')
    }
}

/**
 * Prints every object in an array and keeps it on console for a while
 * @param {Array[string]} desc_msg array to be printed
 */
const show_discover = async (desc_msg) => {
    desc_msg.map(msg => console.log(msg))
    await input('\nPresione ENTER para continuar')
}

const fs = require('fs')
const read_file = filepath => {
    const data = fs.readFileSync(filepath, 'utf8' )
    return JSON.parse(data)
}

module.exports = {
    input,
    print,
    intInput,
    show_discover,
    read_file,
}
