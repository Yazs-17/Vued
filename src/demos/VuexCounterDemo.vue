<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const count = computed(() => store.state.count)
const step = computed({
	get: () => store.state.step,
	set: (value) => {
		const numeric = Number(value)
		const safeValue = Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1
		store.commit('setStep', safeValue)
	}
})

const localStepInput = ref(store.state.step)

const applyStep = () => {
	step.value = localStepInput.value
	localStepInput.value = store.state.step
}

const increment = () => store.commit('increment')
const decrement = () => store.commit('decrement')
const reset = () => store.commit('reset')
</script>

<template>
	<section class="demo-card">
		<header>
			<h2>Vuex 状态管理</h2>
			<p>练习通过 mutation 驱动状态更新，并对步长进行约束。</p>
		</header>

		<div class="counter-display">
			<span class="label">当前计数</span>
			<span class="value">{{ count }}</span>
		</div>

		<div class="controls">
			<button type="button" @click="decrement">-{{ step }}</button>
			<button type="button" class="primary" @click="increment">+{{ step }}</button>
			<button type="button" class="ghost" @click="reset">重置</button>
		</div>

		<form class="step-form" @submit.prevent="applyStep">
			<label>
				调整步长
				<input v-model="localStepInput" min="1" type="number" />
			</label>
			<button type="submit">应用</button>
		</form>

		<footer>
			<p class="tip">提示：通过 <code>useStore()</code> 获得 store，组合式 API 中直接使用 mutation。</p>
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

.counter-display {
	display: flex;
	align-items: baseline;
	gap: 1rem;
	font-size: 2rem;
	font-weight: 600;
}

.counter-display .label {
	font-size: 1rem;
	color: var(--muted-color);
}

.controls {
	display: flex;
	gap: 1rem;
}

.controls button {
	flex: 1;
	padding: 0.75rem 1rem;
	font-size: 1.1rem;
	border-radius: 0.75rem;
	border: none;
	cursor: pointer;
	transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.controls button:active {
	transform: translateY(1px);
}

.controls .primary {
	background: #2563eb;
	color: #fff;
	box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
}

.controls .ghost {
	background: transparent;
	border: 1px solid rgba(148, 163, 184, 0.4);
}

.step-form {
	display: flex;
	gap: 0.75rem;
	align-items: flex-end;
}

.step-form label {
	flex: 1;
	display: flex;
	flex-direction: column;
	font-size: 0.95rem;
	color: var(--muted-color);
	gap: 0.25rem;
}

.step-form input {
	padding: 0.6rem 0.75rem;
	border-radius: 0.5rem;
	border: 1px solid rgba(148, 163, 184, 0.4);
	font-size: 1rem;
}

.step-form button {
	padding: 0.7rem 1.4rem;
	border: none;
	border-radius: 0.75rem;
	background: #10b981;
	color: #fff;
	cursor: pointer;
	box-shadow: 0 10px 18px rgba(16, 185, 129, 0.24);
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
