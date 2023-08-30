
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

const intInput = async (msg) => {
    while (true) {
        let input_str = parseInt(await input(msg))

        if (!isNaN(input_str)) {
            return input_str
        }

        print('ERROR: ingrese un numero')
    }
}

module.exports = {
    input,
    print,
    intInput
}
