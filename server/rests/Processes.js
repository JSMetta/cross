const Process = require('../biz').Process

module.exports = {
    url: '/cross/api/programs/:id/processes',
    rests: [
        {
            type: 'create',
            target: 'Process',
            handler: (req) => {
                const id = req.params.id
                return Process.runProcess(id)
            }
        },
        {
            type: 'query',
            element: 'Process',
            handler: (query) => {
                return Process.listProcessesByProgram(query.id)
                    .then(function (list) {
                        return {
                            items: list
                        }
                    })
            }
        }
    ]
}