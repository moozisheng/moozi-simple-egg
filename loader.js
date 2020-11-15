const fs = require('fs')
const path = require('path')
const Router = require('koa-router')

// 读取目录
function load(dir, cb) {
  // 获取绝对路径
  const url = path.resolve(__dirname, dir)
  const files = fs.readdirSync(url)
  // 遍历
  files.forEach(filename => {
    // 去掉后缀
    filename = filename.replace('.js', '')
    // 导入文件
    const file = require(url + '/' + filename)
    cb(filename, file)
  })
}

function initRouter(app) {
  const router = new Router()

  load('routes', (filename, routes) => {
    // index前缀处理
    const prefix = filename === 'index' ? '' : `/${filename}`

    // 路由类型判断
    routes = typeof routes === 'function' ? routes(app) : routes

    // 遍历添加路由
    Object.keys(routes).forEach(key => {
      const [method, path] = key.split(' ')

      let routerPath = `${prefix}${path}`
      if (/^\/.+\/$/.test(routerPath)) routerPath = routerPath.substr(0, routerPath.length - 1)
      console.log(`正在映射地址 ${method.toLocaleUpperCase()} ${routerPath}`)
      // 注册
      // router[method](prefix + path, routes[key])
      router[method](routerPath, async ctx => {
        app.ctx = ctx
        await routes[key](app)
      })
    })
  })
  return router
}

function initController(app) {
  const controllers = {}
  // 读取目录
  load('controller', (filename, controller) => {
    controllers[filename] = controller(app)
  })
  return controllers
}


function initService() {
  const services = {}
  load('service', (filename, service) => {
    services[filename] = service
  })
  return services
}


function loadConfig(app) {
  let config = {}
  load('config', (filename, conf) => {
    config = Object.assign(config, conf)

    // if (conf.db) {
    //   app.$db = new Sequelize(conf.db)

    //   // 加载模型
    //   app.$model = {}
    //   load('model', (filename, { schema, options }) => {
    //     app.$model[filename] = app.$db.define(filename, schema, options)
    //   })
    //   app.$db.sync()
    // }

    // if (conf.middleware) {
    //   conf.middleware.forEach(mid => {
    //     const midPath = path.resolve(__dirname, 'middleware', mid)
    //     app.$app.use(require(midPath))
    //   })
    // }
  })
  return config
}

const Sequelize = require('sequelize')
function initModel(app) {
  const conf = app.$config
  if (conf.db) {
    app.$db = new Sequelize(conf.db)

    // 加载模型
    app.$model = {}
    load('model', (filename, { schema, options }) => {
      app.$model[filename] = app.$db.define(filename, schema, options)
    })
    app.$db.sync()
  }

}

function initMiddleware(app) {
  const conf = app.$config;
  if (conf.middleware) {
    conf.middleware.forEach(mid => {
      const midPath = path.resolve(__dirname, 'middleware', mid)
      // $app 为 koa 实例
      app.$app.use(require(midPath))
    })
  }
}

const schedule = require('node-schedule')
function initSchedule(app) {
  const conf = app.$config;
  load('schedule', (filename, scheduleConfig) => {
    if (conf.schedule) {
      conf.schedule.forEach(job => {
        if (filename === job) {
          schedule.scheduleJob(scheduleConfig.interval, scheduleConfig.handler)
        }
      })
    }
  })
}

module.exports = {
  initRouter,
  initController,
  initService,
  loadConfig,
  initMiddleware,
  initModel,
  initSchedule
}