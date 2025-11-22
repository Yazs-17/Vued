<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationConfig } from '../services/navigationConfig'

const route = useRoute()
const router = useRouter()
const { demos } = useNavigationConfig()

const currentIndex = computed(() => demos.value.findIndex((item) => item.id === route.name))
const previousDemo = computed(() => {
	if (currentIndex.value <= 0) return null
	return demos.value[currentIndex.value - 1]
})
const nextDemo = computed(() => {
	if (currentIndex.value === -1 || currentIndex.value >= demos.value.length - 1) return null
	return demos.value[currentIndex.value + 1]
})

const goTo = (target) => {
	if (!target) return
	router.push({ name: target.id })
}

const refreshWithQuery = () => {
	router.replace({
		name: route.name,
		query: {
			timestamp: Date.now().toString().slice(-6)
		}
	})
}
</script>

<template>
	<section class="demo-card">
		<header>
			<h2>掌握 Router 组合式 API</h2>
			<p>使用 <code>useRouter()</code> 与 <code>useRoute()</code> 在页面中处理跳转与路由状态。</p>
		</header>

		<dl class="route-info">
			<div>
				<dt>当前路由</dt>
				<dd>{{ route.fullPath }}</dd>
			</div>
			<div>
				<dt>路由名称</dt>
				<dd>{{ route.name }}</dd>
			</div>
			<div>
				<dt>查询参数</dt>
				<dd>{{ route.query }}</dd>
			</div>
		</dl>

		<div class="navigation">
			<button type="button" :disabled="!previousDemo" @click="goTo(previousDemo)">
				← {{ previousDemo ? previousDemo.title : '无' }}
			</button>
			<button type="button" :disabled="!nextDemo" @click="goTo(nextDemo)">
				{{ nextDemo ? nextDemo.title : '无' }} →
			</button>
		</div>

		<div class="actions">
			<button type="button" class="ghost" @click="refreshWithQuery">刷新并附带 query</button>
			<RouterLink class="primary" to="/">返回概览</RouterLink>
		</div>

		<footer>
			<p class="tip">实践建议：在守卫中访问 <code>to</code> 和 <code>from</code>，或结合 <code>meta</code> 定义权限需求。</p>
		</footer>
	</section>
</template>

<style scoped>
.demo-card {
	display: grid;
	gap: 1.5rem;
	padding: 2rem;
	border-radius: 1rem;
	background: var(--surface-color);
	box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

header h2 {
	margin: 0 0 0.5rem;
	font-size: 1.5rem;
}

.route-info {
	display: grid;
	gap: 0.75rem;
	font-size: 0.95rem;
}

.route-info div {
	display: grid;
	gap: 0.2rem;
}

.route-info dt {
	font-weight: 600;
	color: var(--muted-color);
}

.route-info dd {
	margin: 0;
	padding: 0.5rem;
	border-radius: 0.5rem;
	background: rgba(148, 163, 184, 0.12);
	word-break: break-all;
}

.navigation {
	display: flex;
	gap: 1rem;
}

.navigation button {
	flex: 1;
	padding: 0.75rem 1rem;
	border: none;
	border-radius: 0.75rem;
	background: rgba(99, 102, 241, 0.12);
	color: #312e81;
	font-weight: 600;
	cursor: pointer;
}

.navigation button:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.actions {
	display: flex;
	gap: 1rem;
}

.actions .ghost,
.actions .primary {
	flex: 1;
	text-align: center;
	padding: 0.8rem 1rem;
	border-radius: 0.75rem;
	font-weight: 600;
	text-decoration: none;
}

.actions .ghost {
	background: transparent;
	border: 1px solid rgba(148, 163, 184, 0.4);
	color: #1e293b;
}

.actions .primary {
	background: linear-gradient(120deg, #6366f1, #3b82f6);
	color: #fff;
	box-shadow: 0 12px 22px rgba(99, 102, 241, 0.25);
}

footer .tip {
	font-size: 0.9rem;
	color: var(--muted-color);
}

code {
	background: rgba(148, 163, 184, 0.12);
	padding: 0.1rem 0.3rem;
	border-radius: 0.3rem;
}
</style>
