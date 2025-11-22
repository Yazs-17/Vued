<script setup>
import { ref } from 'vue'
import { useNavigationConfig } from '../services/navigationConfig'
import EditDemoModal from './EditDemoModal.vue'

const {
	demos,
	deleteDemo,
	deletingId,
	updatingId
} = useNavigationConfig()

const editingDemo = ref(null)

const openEditor = (demo) => {
	editingDemo.value = { ...demo }
}

const closeEditor = () => {
	editingDemo.value = null
}

const handleUpdated = () => {
	closeEditor()
}

const isDeleting = (id) => deletingId.value === id
const isUpdating = (id) => updatingId.value === id

const handleDelete = async (demo) => {
	if (!demo) return
	const confirmed = window.confirm(`确定删除 ${demo.title} 并可选同时移除组件文件？`)
	if (!confirmed) return
	await deleteDemo(demo.id, { removeComponent: true })
}
</script>

<template>
	<section class="manager">
		<div class="manager__header">
			<div>
				<h2>Demo 管理面板</h2>
				<p>在此编辑、删除 Demo 项。删除会同步更新导航配置并移除组件文件。</p>
			</div>
		</div>

		<div v-if="demos.length" class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th>标题</th>
						<th>路由 ID</th>
						<th>标签</th>
						<th>组件文件</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="demo in demos" :key="demo.id">
						<td>
							<strong>{{ demo.title }}</strong>
							<p class="desc">{{ demo.description }}</p>
						</td>
						<td><code>{{ demo.id }}</code></td>
						<td>
							<span v-for="tag in demo.tags" :key="tag" class="tag">{{ tag }}</span>
						</td>
						<td><code>{{ demo.componentPath }}</code></td>
						<td class="actions">
							<button type="button" class="ghost" @click="openEditor(demo)" :disabled="isUpdating(demo.id)">
								{{ isUpdating(demo.id) ? '保存中…' : '编辑' }}
							</button>
							<button type="button" class="danger" @click="handleDelete(demo)" :disabled="isDeleting(demo.id)">
								{{ isDeleting(demo.id) ? '删除中…' : '删除' }}
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p v-else class="empty">暂无 Demo，可以通过侧边栏或此处的按钮创建。</p>
	</section>

	<EditDemoModal v-if="editingDemo" :demo="editingDemo" @close="closeEditor" @updated="handleUpdated" />
</template>

<style scoped>
.manager {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding: 2rem;
	border-radius: 1rem;
	background: rgba(15, 23, 42, 0.03);
	border: 1px solid rgba(15, 23, 42, 0.08);
}

.manager__header h2 {
	margin: 0;
}

.manager__header p {
	margin: 0.25rem 0 0;
	color: var(--muted-color);
}

.table-wrapper {
	overflow-x: auto;
}

table {
	width: 100%;
	border-collapse: collapse;
}

th,
td {
	padding: 0.75rem 0.5rem;
	text-align: left;
	vertical-align: top;
}

th {
	font-size: 0.85rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #64748b;
	border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

tbody tr:not(:last-child) td {
	border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.desc {
	margin: 0.25rem 0 0;
	color: #64748b;
	font-size: 0.9rem;
}

.tag {
	display: inline-flex;
	align-items: center;
	padding: 0.2rem 0.55rem;
	border-radius: 999px;
	background: rgba(59, 130, 246, 0.12);
	color: #1d4ed8;
	font-size: 0.75rem;
	margin: 0 0.2rem 0.2rem 0;
}

.actions {
	display: flex;
	gap: 0.5rem;
}

button {
	border: none;
	border-radius: 0.65rem;
	padding: 0.45rem 0.85rem;
	font-weight: 600;
	cursor: pointer;
}

button.ghost {
	background: rgba(15, 23, 42, 0.06);
}

button.danger {
	background: rgba(248, 113, 113, 0.15);
	color: #b91c1c;
}

button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.empty {
	margin: 0;
	color: var(--muted-color);
}
</style>
