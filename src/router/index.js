import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('../pages/HomePage.vue'),
		meta: {
			title: '学习导航概览'
		}
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/'
	}
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})

export default router
