import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONFIG_PATH = process.env.NAVIGATION_CONFIG_PATH
	? path.resolve(process.env.NAVIGATION_CONFIG_PATH)
	: path.resolve(__dirname, '../config/navigation.json')
const DEMOS_DIR = path.resolve(__dirname, '../src/demos')

const app = new Koa()
const router = new Router({ prefix: '/api' })

const readConfig = async () => {
	const raw = await fs.readFile(CONFIG_PATH, 'utf-8')
	return JSON.parse(raw)
}

const writeConfig = async (config) => {
	await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

const normalizeTags = (tags) => {
	if (Array.isArray(tags)) {
		return tags.map((tag) => String(tag).trim()).filter(Boolean)
	}
	if (typeof tags === 'string') {
		return tags
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
	}
	return []
}

const deleteFileIfExists = async (filePath) => {
	try {
		await fs.rm(filePath, { force: true })
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error
		}
	}
}

const ensureInside = (targetPath, root) => {
	const normalizedTarget = path.normalize(targetPath)
	const normalizedRoot = path.normalize(root).replace(/\/+$/, '')
	if (
		normalizedTarget !== normalizedRoot &&
		!normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`)
	) {
		throw new Error('非法的文件路径')
	}
	return normalizedTarget
}

const slugToComponentName = (slug) => {
	const base = slug
		.split(/[-_\s]+/)
		.map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
		.join('')
	return base || 'Generated'
}

const buildDemoTemplate = ({ title, description }) => `
<template>
	<section class="demo-card">
		<h2>${title}</h2>
		<p>${description || '这是一个全新的 Demo，占位内容可按需替换。'}</p>
	</section>
</template>

<script setup>
// 这里可以添加你的逻辑
</script>

<style scoped>
.demo-card {
	padding: 1.5rem;
	border-radius: 1rem;
	background: var(--vp-surface-2, #fff);
	box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.demo-card h2 {
	margin-bottom: 0.5rem;
}
</style>
`

router.get('/navigation', async (ctx) => {
	try {
		const config = await readConfig()
		ctx.body = config
	} catch (error) {
		ctx.status = 500
		ctx.body = { message: `读取配置失败: ${error.message}` }
	}
})

router.post('/navigation', async (ctx) => {
	const incoming = ctx.request.body

	if (!incoming || typeof incoming !== 'object') {
		ctx.status = 400
		ctx.body = { message: '请求体必须是 JSON 对象' }
		return
	}

	if (!Array.isArray(incoming.demos)) {
		ctx.status = 400
		ctx.body = { message: '配置必须包含 demos 数组' }
		return
	}

	try {
		await writeConfig(incoming)
		ctx.body = { status: 'ok' }
	} catch (error) {
		ctx.status = 500
		ctx.body = { message: `写入配置失败: ${error.message}` }
	}
})

router.post('/demos', async (ctx) => {
	try {
		const payload = ctx.request.body || {}
		const { id, title, description = '', tags = [], componentPath, componentContent } = payload

		if (!id || typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) {
			ctx.status = 400
			ctx.body = { message: 'id 必须是由字母、数字或连字符组成的小写字符串' }
			return
		}

		if (!title || typeof title !== 'string') {
			ctx.status = 400
			ctx.body = { message: '缺少标题' }
			return
		}

		const config = await readConfig()
		if (!Array.isArray(config.demos)) {
			config.demos = []
		}

		if (config.demos.some((demo) => demo.id === id)) {
			ctx.status = 409
			ctx.body = { message: `已存在 id 为 ${id} 的 Demo` }
			return
		}

		const normalizedTags = normalizeTags(tags)

		const normalizedComponentPath = (() => {
			if (componentPath && typeof componentPath === 'string') {
				return componentPath.replace(/^\/+/, '')
			}
			const baseName = `${slugToComponentName(id)}Demo.vue`
			return baseName
		})()

		const absoluteComponentPath = ensureInside(path.resolve(DEMOS_DIR, normalizedComponentPath), DEMOS_DIR)
		await fs.mkdir(path.dirname(absoluteComponentPath), { recursive: true })
		const source = componentContent && typeof componentContent === 'string'
			? componentContent
			: buildDemoTemplate({ title, description })
		await fs.writeFile(absoluteComponentPath, source, 'utf-8')

		const newDemo = {
			id,
			title,
			description,
			tags: normalizedTags,
			componentPath: normalizedComponentPath,
			resources: payload.resources ?? []
		}

		config.demos.push(newDemo)
		await writeConfig(config)

		ctx.body = {
			status: 'ok',
			demo: newDemo,
			config
		}
	} catch (error) {
		ctx.status = 500
		ctx.body = { message: `创建 Demo 失败: ${error.message}` }
	}
})

router.put('/demos/:id', async (ctx) => {
	try {
		const { id } = ctx.params
		const payload = ctx.request.body || {}

		const config = await readConfig()
		if (!Array.isArray(config.demos)) {
			config.demos = []
		}

		const index = config.demos.findIndex((demo) => demo.id === id)
		if (index === -1) {
			ctx.status = 404
			ctx.body = { message: `未找到 id 为 ${id} 的 Demo` }
			return
		}

		const current = config.demos[index]
		const next = {
			...current,
			title: typeof payload.title === 'string' ? payload.title : current.title,
			description: typeof payload.description === 'string' ? payload.description : current.description,
			tags: 'tags' in payload ? normalizeTags(payload.tags) : current.tags,
			resources: Array.isArray(payload.resources) ? payload.resources : current.resources
		}

		if (payload.componentPath && typeof payload.componentPath === 'string') {
			next.componentPath = payload.componentPath.replace(/^\/+/, '')
		}

		config.demos[index] = next
		await writeConfig(config)

		ctx.body = { status: 'ok', demo: next, config }
	} catch (error) {
		ctx.status = 500
		ctx.body = { message: `更新 Demo 失败: ${error.message}` }
	}
})

router.delete('/demos/:id', async (ctx) => {
	try {
		const { id } = ctx.params
		const { removeComponent = true } = ctx.request.body || {}

		const config = await readConfig()
		if (!Array.isArray(config.demos)) {
			config.demos = []
		}

		const index = config.demos.findIndex((demo) => demo.id === id)
		if (index === -1) {
			ctx.status = 404
			ctx.body = { message: `未找到 id 为 ${id} 的 Demo` }
			return
		}

		const [removed] = config.demos.splice(index, 1)
		await writeConfig(config)

		if (removeComponent && removed?.componentPath) {
			const componentFile = ensureInside(path.resolve(DEMOS_DIR, removed.componentPath), DEMOS_DIR)
			await deleteFileIfExists(componentFile)
		}

		ctx.body = { status: 'ok', removed, config }
	} catch (error) {
		ctx.status = 500
		ctx.body = { message: `删除 Demo 失败: ${error.message}` }
	}
})

app.use(cors())
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
	console.log(`Navigation config server running at http://localhost:${PORT}`)
})
