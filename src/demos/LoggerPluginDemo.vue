<script setup>
import { getCurrentInstance, inject, ref } from 'vue'

const message = ref('记录下我正在学习的知识点！')
const history = ref([])
const prefix = inject('loggerPrefix', 'Plugin')
const vm = getCurrentInstance()

const logMessage = () => {
	if (!message.value.trim()) return
	const formatted = `[${prefix}] ${message.value}`
	history.value.unshift({ id: Date.now(), text: formatted })
	vm?.proxy?.$log(message.value)
	message.value = ''
}
</script>

<template>
	<section class="demo-card">
		<header>
			<h2>插件扩展全局能力</h2>
			<p>本 demo 展示如何通过插件为应用注入全局方法与 provide/inject 值。</p>
		</header>

		<div class="input-row">
			<input v-model="message" placeholder="写点笔记，通过 $log 输出到控制台" type="text" />
			<button type="button" @click="logMessage">输出日志</button>
		</div>

		<ul class="log-list">
			<li v-if="history.length === 0" class="empty">暂无记录，先来一次输出吧～</li>
			<li v-for="item in history" :key="item.id">{{ item.text }}</li>
		</ul>

		<footer>
			<p class="tip">在 <code>main.js</code> 中通过 <code>app.use(loggerPlugin, { prefix: 'Learning' })</code> 安装即可使用。</p>
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

.input-row {
	display: flex;
	gap: 0.75rem;
}

.input-row input {
	flex: 1;
	padding: 0.75rem 1rem;
	border-radius: 0.75rem;
	border: 1px solid rgba(148, 163, 184, 0.4);
	font-size: 1rem;
}

.input-row button {
	padding: 0.75rem 1.2rem;
	border: none;
	border-radius: 0.75rem;
	background: linear-gradient(120deg, #f97316, #f59e0b);
	color: #fff;
	font-weight: 600;
	cursor: pointer;
	box-shadow: 0 10px 18px rgba(249, 115, 22, 0.25);
}

.log-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 0.6rem;
}

.log-list li {
	padding: 0.65rem 0.85rem;
	border-radius: 0.65rem;
	background: rgba(248, 250, 252, 0.8);
	border: 1px solid rgba(226, 232, 240, 0.8);
	font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
	font-size: 0.9rem;
}

.log-list .empty {
	text-align: center;
	color: var(--muted-color);
	font-style: italic;
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
