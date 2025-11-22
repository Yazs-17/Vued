import { computed, reactive } from 'vue'
import router from '../router'
import defaultConfig from '../config/defaultNavigation.json'

const demoModules = import.meta.glob('../demos/**/*.vue')
const cloneDefaultConfig = () => JSON.parse(JSON.stringify(defaultConfig))
const state = reactive({
	config: cloneDefaultConfig(),
	loading: false,
	error: null,
	lastUpdatedAt: null,
	syncing: false,
	creating: false,
	updatingId: null,
	deletingId: null
})

let dynamicRouteNames = []

const RAW_ENDPOINT = import.meta.env.VITE_NAVIGATION_ENDPOINT || 'http://localhost:3000/api/navigation'
const NAVIGATION_ENDPOINT = RAW_ENDPOINT.replace(/\/$/, '')
const API_BASE = NAVIGATION_ENDPOINT.endsWith('/navigation')
	? NAVIGATION_ENDPOINT.slice(0, -'/navigation'.length)
	: NAVIGATION_ENDPOINT.replace(/\/navigation$/, '')
const DEMO_ENDPOINT = `${API_BASE}/demos`

const missingComponent = (path) => ({
	name: 'MissingDemo',
	setup () {
		return { path }
	},
	template: '<section class="demo-card"><h2>组件未找到</h2><p>未能加载 Demo 组件：{{ path }}</p></section>'
})

const resolveComponent = (componentPath) => {
	const normalizedPath = componentPath.startsWith('./') ? componentPath.replace(/^\.\//, '') : componentPath
	const fullPath = `../demos/${normalizedPath}`
	const loader = demoModules[fullPath]
	if (!loader) {
		return missingComponent(normalizedPath)
	}
	return loader
}

const applyConfig = (config) => {
	if (!config) return
	state.config = config
	syncRoutesWithConfig()
	state.lastUpdatedAt = new Date().toISOString()
}

const resolvedDemos = computed(() => {
	const demos = state.config?.demos ?? defaultConfig.demos
	return demos.map((demo) => ({
		...demo,
		component: resolveComponent(demo.componentPath)
	}))
})

const siteMeta = computed(() => state.config?.site ?? defaultConfig.site)

const syncRoutesWithConfig = () => {
	dynamicRouteNames.forEach((name) => {
		if (router.hasRoute(name)) {
			router.removeRoute(name)
		}
	})
	dynamicRouteNames = []

	resolvedDemos.value.forEach((demo) => {
		if (!demo.id) return
		router.addRoute({
			path: `/${demo.id}`,
			name: demo.id,
			component: demo.component,
			meta: {
				title: demo.title,
				description: demo.description,
				tags: demo.tags
			}
		})
		dynamicRouteNames.push(demo.id)
	})
}

const loadConfig = async ({ force } = {}) => {
	if (!force && state.config) return
	state.loading = true
	state.error = null
	try {
		const response = await fetch(`${NAVIGATION_ENDPOINT}?t=${Date.now()}`)
		if (!response.ok) {
			throw new Error(`加载配置失败：${response.status}`)
		}
		const data = await response.json()
		applyConfig(data)
	} catch (error) {
		state.error = error instanceof Error ? error.message : String(error)
		applyConfig(cloneDefaultConfig())
	} finally {
		state.loading = false
	}
}

const pushDefaultConfig = async () => {
	state.syncing = true
	state.error = null
	try {
		const response = await fetch(NAVIGATION_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(defaultConfig, null, 2)
		})
		if (!response.ok) {
			const payload = await response.json().catch(() => ({}))
			throw new Error(payload.message || `更新配置失败：${response.status}`)
		}
		await loadConfig({ force: true })
	} catch (error) {
		state.error = error instanceof Error ? error.message : String(error)
	} finally {
		state.syncing = false
	}
}

const createDemo = async (payload) => {
	state.creating = true
	state.error = null
	try {
		const response = await fetch(DEMO_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
		const data = await response.json().catch(() => ({}))
		if (!response.ok) {
			throw new Error(data.message || `创建 Demo 失败：${response.status}`)
		}
		if (data.config) {
			applyConfig(data.config)
		}
		return data.demo
	} catch (error) {
		state.error = error instanceof Error ? error.message : String(error)
		throw error
	} finally {
		state.creating = false
	}
}

const updateDemo = async (id, payload) => {
	if (!id) throw new Error('缺少 Demo id')
	state.updatingId = id
	state.error = null
	try {
		const response = await fetch(`${DEMO_ENDPOINT}/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
		const data = await response.json().catch(() => ({}))
		if (!response.ok) {
			throw new Error(data.message || `更新 Demo 失败：${response.status}`)
		}
		if (data.config) {
			applyConfig(data.config)
		}
		return data.demo
	} catch (error) {
		state.error = error instanceof Error ? error.message : String(error)
		throw error
	} finally {
		state.updatingId = null
	}
}

const deleteDemo = async (id, options = {}) => {
	if (!id) throw new Error('缺少 Demo id')
	state.deletingId = id
	state.error = null
	try {
		const response = await fetch(`${DEMO_ENDPOINT}/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ removeComponent: true, ...options })
		})
		const data = await response.json().catch(() => ({}))
		if (!response.ok) {
			throw new Error(data.message || `删除 Demo 失败：${response.status}`)
		}
		if (data.config) {
			applyConfig(data.config)
		}
		return data.removed
	} catch (error) {
		state.error = error instanceof Error ? error.message : String(error)
		throw error
	} finally {
		state.deletingId = null
	}
}

export const useNavigationConfig = () => ({
	config: computed(() => state.config ?? defaultConfig),
	siteMeta,
	demos: resolvedDemos,
	loading: computed(() => state.loading),
	error: computed(() => state.error),
	lastUpdatedAt: computed(() => state.lastUpdatedAt),
	syncing: computed(() => state.syncing),
	creating: computed(() => state.creating),
	updatingId: computed(() => state.updatingId),
	deletingId: computed(() => state.deletingId),
	loadConfig,
	pushDefaultConfig,
	createDemo,
	updateDemo,
	deleteDemo
})

export const bootstrapNavigationConfig = async () => {
	await loadConfig({ force: true })
}
