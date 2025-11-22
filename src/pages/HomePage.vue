<script setup>
import { computed } from 'vue'
import { useNavigationConfig } from '../services/navigationConfig'
import DemoManager from '../components/DemoManager.vue'

const { demos, siteMeta, loading, error } = useNavigationConfig()

const resources = computed(() => ({
	link: siteMeta.value?.docsLink ?? null
}))
</script>

<template>
	<section class="home">
		<header>
			<h1>{{ siteMeta.title }}</h1>
			<p>
				集中管理你的 Vue 插件与生态学习笔记，快速跳转到 Demo 并沉淀最佳实践。
				现在可以直接在前端创建、编辑、删除 Demo：
			</p>
			<ol>
				<li>使用侧边栏的「新建 Demo」按钮即可生成组件文件并写入配置。</li>
				<li>在下方的管理面板中编辑或删除 Demo，前端会自动刷新导航。</li>
				<li>如需回到初始配置，可使用侧边栏的「恢复默认」按钮。</li>
			</ol>
			<p v-if="resources.link" class="doc-link">
				学习资源：
				<a :href="resources.link.href" target="_blank" rel="noreferrer">{{ resources.link.label }}</a>
			</p>
		</header>

		<section v-if="error" class="status error">{{ error }}</section>
		<section v-else-if="loading" class="status">正在加载 Demo 信息…</section>
		<section v-else class="demo-list">
			<article v-for="demo in demos" :key="demo.id" class="demo-card">
				<h2>{{ demo.title }}</h2>
				<p>{{ demo.description }}</p>
				<ul class="tags">
					<li v-for="tag in demo.tags" :key="tag">{{ tag }}</li>
				</ul>
				<RouterLink :to="`/${demo.id}`" class="enter">进入 Demo →</RouterLink>
			</article>
		</section>

		<DemoManager />
	</section>
</template>

<style scoped>
.home {
	display: grid;
	gap: 2.5rem;
	padding: 2.5rem;
}

header h1 {
	margin: 0 0 1rem;
	font-size: 2.2rem;
}

header p {
	margin: 0 0 0.75rem;
	color: var(--muted-color);
	line-height: 1.7;
}

header ol {
	margin: 0;
	padding-left: 1.25rem;
	color: #1f2937;
	line-height: 1.6;
}

.demo-list {
	display: grid;
	gap: 1.5rem;
}

.status {
	padding: 1.5rem;
	border-radius: 1rem;
	background: rgba(148, 163, 184, 0.12);
	color: var(--muted-color);
}

.status.error {
	background: rgba(248, 113, 113, 0.15);
	color: #b91c1c;
}

@media (min-width: 900px) {
	.demo-list {
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}
}

.demo-card {
	display: grid;
	gap: 1rem;
	padding: 1.75rem;
	border-radius: 1rem;
	background: var(--surface-color);
	box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
}

.demo-card h2 {
	margin: 0;
	font-size: 1.4rem;
}

.demo-card p {
	margin: 0;
	color: var(--muted-color);
	line-height: 1.6;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.tags li {
	padding: 0.3rem 0.65rem;
	border-radius: 999px;
	background: rgba(96, 165, 250, 0.18);
	color: #1d4ed8;
	font-size: 0.85rem;
	font-weight: 600;
}

.enter {
	justify-self: flex-start;
	padding: 0.5rem 0.9rem;
	border-radius: 0.7rem;
	background: linear-gradient(120deg, #0ea5e9, #6366f1);
	color: #fff;
	font-weight: 600;
	text-decoration: none;
	transition: transform 0.12s ease;
}

.enter:hover {
	transform: translateY(-1px);
}
</style>
