const readline = require('readline-sync');

function start(){
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    function askAndReturnSearchTerm() {
        return readline.question('Type a wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose an option: ')
        const selectedPefixText = prefixes[selectedPrefixIndex]
        return selectedPefixText
    }
    console.log(content);
}

start();