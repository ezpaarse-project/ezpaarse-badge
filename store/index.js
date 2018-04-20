import Vuex from 'vuex'

const store = () => new Vuex.Store({
  state: {
    drawer: true
  },
  mutations: {
    SET_DRAWER (state, bool) {
      state.drawer = bool
    }
  },
  actions: {
    SET_DRAWER ({ commit }, value) {
      commit('SET_DRAWER', value)
    }
  }
})

export default store
