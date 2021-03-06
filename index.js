const readline = require('readline-sync');
const robots = {
    text: require('./robots/text.js')
}
async function start(){
    const content = {
        maximunSentences: 10
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    
    await robots.text(content)

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