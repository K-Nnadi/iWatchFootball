module.exports = {
    mainApi: {
        output: {
            mode: 'tags',
            target: '../clients/controllers',
            client: 'react-query',
            override: {
                mutator: {
                    path: '../clients/client-instance.ts',
                    name: 'clientInstance',
                }
            }
        },
        input: {
            target: './openapi.json'
        }
    }
}
