module.exports = app => ({
    index: async ctx => {
        app.ctx.body = await app.$model.user.findAll()
    },
    detail: ctx => {
        app.ctx.body = '详细页面Ctrl'
    }
})