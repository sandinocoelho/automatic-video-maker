const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');

//Watson
const watsonApiKey = require('../credentials/watson-nlu.json').apikey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');

var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: "https://gateway.watsonplatform.net/natural-language-understanding/api"
})

async function robot(content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);
    limitMaximunSentences(content);
    await fetchKeywordsOfAllSentences(content);


    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia('simx2RioJHYUypR9zu4dma/32w01')
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses

        //Função que remove linhas em branco
        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter(line => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
        }
        //Função que remove datas entre parênteses
        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
        }
        //Função que separa o texto em sentenças.
    }

    //Função que quebra o texto em sentenças
    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
        //console.log(sentences);

    }
}

function limitMaximunSentences(content){
    content.sentences = content.sentences.slice(0,content.maximunSentences)
}

async function fetchKeywordsOfAllSentences(content){
    for (const sentence of content.sentences) {
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
}



async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {

        nlu.analyze({
            text: sentence,
            features: {
                keywords: {}
            },
        }, (error, response) => {
            if (error) {
                throw error;
            }

            const keywords = response.keywords.map(keyword => {
                return keyword.text
            })

            resolve(keywords)
        })
    })

}


module.exports = robot;