export default {
	install (app, options = {}) {
		const prefix = options.prefix ?? 'Vue'

		app.config.globalProperties.$log = (message) => {
			// 保持简单：集中管理日志输出，方便全局替换
			console.log(`[${prefix}]`, message)
		}

		app.provide('loggerPrefix', prefix)
	}
}
