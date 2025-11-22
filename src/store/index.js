import { createStore } from "vuex";
const store = createStore({
	state () {
		return {
			count: 0,
			step: 1
		}
	},
	mutations: {
		increment (state) {
			state.count += state.step
		},
		decrement (state) {
			state.count -= state.step
		},
		setStep (state, value) {
			const numeric = Number(value)
			state.step = Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1
		},
		reset (state) {
			state.count = 0
			state.step = 1
		}
	}
})

export default store