const koa = require('koa')
const { initRouter,
  initController,
  initService,
  loadConfig,
  initMiddleware,
  initModel,
  initSchedule
} = require('./loader')

class kkb {
  constructor(conf) {

    this.$app = new koa(conf)

    this.$config = loadConfig(this)
    initMiddleware(this)
    initModel(this)

    this.$service = initService()
    this.$ctrl = initController(this)
    this.$router = initRouter(this)
    this.$app.use(this.$router.routes())

    initSchedule(this)
  }
  start(port) {
    this.$app.listen(port, () => {
      console.log('服务器启动 端口：' + port)
    })
  }
}
module.exports = kkb