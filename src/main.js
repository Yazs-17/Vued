import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import loggerPlugin from './plugins/logger'
import { bootstrapNavigationConfig } from './services/navigationConfig'
import './style.css'

const bootstrap = async () => {
	await bootstrapNavigationConfig()

	createApp(App)
		.use(store)
		.use(router)
		.use(loggerPlugin, { prefix: 'Learning' })
		.mount('#app')
}

bootstrap()