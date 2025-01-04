module.exports = {
    mainApi: {
        output: {
            mode: 'tags-split',
            target: '../../clients/client-instance.ts',
            client: 'react-query',

            override: {
                /*operationName: (operation, route, verb) => {
                    if(operation?.description){
                        return operation?.description.replace('Entity', '')
                    } else {
                        return operation.operationId
                    }
                },*/
                mutator: {
                    path: '../../clients/client-instance.ts',
                    name: 'clientInstance',
                }
            }
        },
        input: {
            target: '../openapi.json'
        }
    }
}
