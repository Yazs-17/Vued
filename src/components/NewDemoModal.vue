<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useNavigationConfig } from '../services/navigationConfig'

const emit = defineEmits(['close', 'created'])

const { createDemo, creating } = useNavigationConfig()
const manualId = ref(false)

const form = reactive({
	title: '',
	id: '',
	description: '',
	tags: '',
	componentPath: ''
})

const slugify = (value) => value
	.toLowerCase()
	.trim()
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-+|\-+$/g, '')

watch(
	() => form.title,
	(value) => {
		if (!manualId.value) {
			form.id = slugify(value || '')
		}
	}
)

const touchManualId = () => {
	manualId.value = true
	form.id = slugify(form.id)
}

const resetForm = () => {
	form.title = ''
	form.id = ''
	form.description = ''
	form.tags = ''
	form.componentPath = ''
	manualId.value = false
}

const isValid = computed(() => Boolean(form.title && form.id))

const handleSubmit = async () => {
	if (!isValid.value || creating.value) return
	await createDemo({
		id: form.id,
		title: form.title,
		description: form.description,
		tags: form.tags,
		componentPath: form.componentPath
	})
	resetForm()
	emit('created')
}

const close = () => {
	resetForm()
	emit('close')
}
</script>

<template>
	<div class="modal-backdrop" @click.self="close">
		<section class="modal">
			<header>
				<h2>创建新 Demo</h2>
				<button type="button" class="icon" @click="close">✕</button>
			</header>
			<form @submit.prevent="handleSubmit">
				<label>
					<span>标题 *</span>
					<input v-model="form.title" type="text" placeholder="例如：Transition 实践" required />
				</label>

				<label>
					<span>路由 ID *</span>
					<input v-model="form.id" type="text" placeholder="transition-demo" required @input="touchManualId" />
					<small>仅限小写字母、数字和连字符。</small>
				</label>

				<label>
					<span>描述</span>
					<textarea v-model="form.description" rows="2" placeholder="一句话描述这个 Demo"></textarea>
				</label>

				<label>
					<span>标签（逗号分隔）</span>
					<input v-model="form.tags" type="text" placeholder="Animation, Basics" />
				</label>

				<label>
					<span>组件文件 (可选)</span>
					<input v-model="form.componentPath" type="text" placeholder="子目录/MyDemo.vue" />
					<small>留空将自动生成 <code>{{ form.id || 'demo' }}</code> 对应的文件名。</small>
				</label>

				<footer>
					<button type="button" class="ghost" @click="close" :disabled="creating">取消</button>
					<button type="submit" class="primary" :disabled="!isValid || creating">
						{{ creating ? '创建中…' : '创建 Demo' }}
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
	background: linear-gradient(120deg, rgba(99, 102, 241, 0.9), rgba(59, 130, 246, 0.9));
	color: #fff;
}
</style>
