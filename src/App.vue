<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigationConfig } from './services/navigationConfig'
import NewDemoModal from './components/NewDemoModal.vue'

const route = useRoute()
const {
	demos,
	siteMeta,
	loading,
	error,
	syncing,
	creating,
	lastUpdatedAt,
	loadConfig,
	pushDefaultConfig
} = useNavigationConfig()

const showCreateModal = ref(false)
const activeDemoId = computed(() => {
	if (!route.name || route.name === 'home') return null
	return route.name
})

const resetConfig = async () => {
	const confirmed = window.confirm('此操作会用默认配置覆盖服务端配置，确定继续？')
	if (!confirmed) return
	await pushDefaultConfig()
}

const reloadConfig = async () => {
	await loadConfig({ force: true })
}

const handleDemoCreated = async () => {
	showCreateModal.value = false
	await loadConfig({ force: true })
}
</script>

<template>
	<div class="layout">
		<aside class="sidebar">
			<div class="brand">
				<span class="logo">🧭</span>
				<div>
					<h1>{{ siteMeta.title }}</h1>
					<p>{{ siteMeta.tagline }}</p>
				</div>
			</div>

			<div class="controls">
				<button class="ghost" type="button" @click="reloadConfig" :disabled="loading || syncing">
					重新加载
				</button>
				<button class="ghost" type="button" @click="showCreateModal = true" :disabled="creating">
					{{ creating ? '处理中…' : '新建 Demo' }}
				</button>
				<button class="primary" type="button" @click="resetConfig" :disabled="syncing">
					{{ syncing ? '覆盖中…' : '恢复默认' }}
				</button>
			</div>

			<div v-if="error" class="status error">{{ error }}</div>
			<div v-else-if="loading" class="status">正在加载配置…</div>
			<div v-else-if="lastUpdatedAt" class="status subtle">最近同步 {{ new Date(lastUpdatedAt).toLocaleString() }}</div>

			<nav>
				<RouterLink :class="{ active: route.name === 'home' }" to="/">
					总览
				</RouterLink>
				<div class="section-title">Demo 集合</div>
				<RouterLink v-for="demo in demos" :key="demo.id" :class="{ active: activeDemoId === demo.id }"
					:to="`/${demo.id}`">
					{{ demo.title }}
				</RouterLink>
			</nav>

			<div class="footer">
				<p>{{ siteMeta.footerBlurb }}</p>
				<a v-if="siteMeta.docsLink" :href="siteMeta.docsLink.href" rel="noreferrer" target="_blank">
					{{ siteMeta.docsLink.label }}
				</a>
			</div>
		</aside>

		<main class="content">
			<RouterView v-slot="{ Component }">
				<Suspense>
					<component :is="Component" />
					<template #fallback>
						<div class="loading">Loading demo…</div>
					</template>
				</Suspense>
			</RouterView>
		</main>

		<NewDemoModal v-if="showCreateModal" @close="showCreateModal = false" @created="handleDemoCreated" />
	</div>
</template>

<style scoped>
.layout {
	min-height: 100vh;
	display: grid;
	grid-template-columns: minmax(240px, 320px) 1fr;
}

.sidebar {
	display: flex;
	flex-direction: column;
	gap: 2rem;
	padding: 2.5rem 2rem;
	background: rgba(15, 23, 42, 0.92);
	color: #e2e8f0;
}

.brand {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.brand .logo {
	font-size: 2rem;
}

.brand h1 {
	margin: 0;
	font-size: 1.3rem;
}

.brand p {
	margin: 0.2rem 0 0;
	color: rgba(226, 232, 240, 0.6);
}

.controls {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
}

.controls button {
	padding: 0.6rem 0.9rem;
	border-radius: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	border: none;
}

.controls .ghost {
	background: transparent;
	border: 1px solid rgba(148, 163, 184, 0.4);
	color: rgba(226, 232, 240, 0.9);
}

.controls .primary {
	background: linear-gradient(120deg, rgba(74, 222, 128, 0.85), rgba(16, 185, 129, 0.85));
	color: #0f172a;
}

.controls button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.status {
	margin: 0.5rem 0;
	font-size: 0.82rem;
	color: rgba(226, 232, 240, 0.75);
}

.status.error {
	padding: 0.6rem;
	border-radius: 0.65rem;
	background: rgba(248, 113, 113, 0.15);
	color: #fecaca;
}

.status.subtle {
	color: rgba(226, 232, 240, 0.5);
}

nav {
	display: grid;
	gap: 0.5rem;
}

nav a {
	padding: 0.7rem 1rem;
	border-radius: 0.75rem;
	color: inherit;
	text-decoration: none;
	transition: background 0.12s ease, transform 0.12s ease;
}

nav a:hover {
	transform: translateX(4px);
	background: rgba(148, 163, 184, 0.16);
}

nav a.active {
	background: linear-gradient(120deg, rgba(99, 102, 241, 0.85), rgba(59, 130, 246, 0.85));
	color: #fff;
	box-shadow: 0 10px 22px rgba(99, 102, 241, 0.2);
}

.section-title {
	margin: 1.5rem 0 0.25rem;
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(226, 232, 240, 0.5);
}

.footer {
	margin-top: auto;
	display: grid;
	gap: 0.4rem;
	font-size: 0.85rem;
	color: rgba(226, 232, 240, 0.7);
}

.footer a {
	color: #93c5fd;
}

.content {
	padding: 3rem;
}

.loading {
	padding: 4rem;
	text-align: center;
	color: var(--muted-color);
}

@media (max-width: 900px) {
	.layout {
		grid-template-columns: 1fr;
	}

	.sidebar {
		position: sticky;
		top: 0;
		z-index: 1;
	}
}
</style>
