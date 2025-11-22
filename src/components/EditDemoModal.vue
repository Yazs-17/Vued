<script setup>
import { computed, reactive, watch } from 'vue'
import { useNavigationConfig } from '../services/navigationConfig'

const props = defineProps({
	demo: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['close', 'updated'])

const { updateDemo, updatingId } = useNavigationConfig()

const form = reactive({
	title: '',
	description: '',
	tags: '',
	componentPath: ''
})

const hydrate = (demo) => {
	if (!demo) return
	form.title = demo.title ?? ''
	form.description = demo.description ?? ''
	form.tags = Array.isArray(demo.tags) ? demo.tags.join(', ') : demo.tags ?? ''
	form.componentPath = demo.componentPath ?? ''
}

watch(() => props.demo, hydrate, { immediate: true })

const isProcessing = computed(() => updatingId.value === props.demo?.id)

const handleSubmit = async () => {
	if (!props.demo || isProcessing.value) return
	await updateDemo(props.demo.id, {
		title: form.title,
		description: form.description,
		tags: form.tags,
		componentPath: form.componentPath
	})
	emit('updated')
}

const close = () => emit('close')
</script>

<template>
	<div class="modal-backdrop" @click.self="close">
		<section class="modal">
			<header>
				<h2>编辑 Demo</h2>
				<button type="button" class="icon" @click="close">✕</button>
			</header>
			<form @submit.prevent="handleSubmit">
				<div class="readonly">
					<span>ID (路由)</span>
					<strong>{{ demo.id }}</strong>
				</div>

				<label>
					<span>标题</span>
					<input v-model="form.title" type="text" required />
				</label>

				<label>
					<span>描述</span>
					<textarea v-model="form.description" rows="2"></textarea>
				</label>

				<label>
					<span>标签（逗号分隔）</span>
					<input v-model="form.tags" type="text" />
				</label>

				<label>
					<span>组件路径</span>
					<input v-model="form.componentPath" type="text" />
					<small>如需同步重命名，请同时在 <code>src/demos</code> 下调整文件。</small>
				</label>

				<footer>
					<button type="button" class="ghost" @click="close" :disabled="isProcessing">取消</button>
					<button type="submit" class="primary" :disabled="isProcessing">
						{{ isProcessing ? '保存中…' : '保存修改' }}
					</button>
				</footer>
			</form>
		</section>
	</div>
</template>

<style scoped>
.modal-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.65);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	padding: 1rem;
}

.modal {
	width: min(520px, 100%);
	background: #fff;
	border-radius: 1.25rem;
	padding: 1.75rem;
	box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

header h2 {
	margin: 0;
}

header .icon {
	border: none;
	background: transparent;
	font-size: 1.2rem;
	cursor: pointer;
}

form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

label {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	font-weight: 600;
	color: #0f172a;
}

.readonly {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem 0.75rem;
	border-radius: 0.75rem;
	background: rgba(15, 23, 42, 0.05);
	font-weight: 600;
}

input,
textarea {
	border: 1px solid rgba(15, 23, 42, 0.15);
	border-radius: 0.75rem;
	padding: 0.65rem 0.85rem;
	font-size: 0.95rem;
}

small {
	font-weight: 400;
	color: #64748b;
}

footer {
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
}

button {
	border: none;
	border-radius: 0.75rem;
	padding: 0.6rem 1.2rem;
	font-weight: 600;
	cursor: pointer;
}

button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

button.ghost {
	background: #e2e8f0;
}

button.primary {
	background: linear-gradient(120deg, rgba(14, 165, 233, 0.9), rgba(99, 102, 241, 0.9));
	color: #fff;
}
</style>
