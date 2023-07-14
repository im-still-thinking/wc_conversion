const actions = {
  SET_WEB3({ commit }, payload) {
    commit("SET_WEB3", payload);
  },

  SET_CHAIN_ID({ commit }, payload) {
    commit("SET_CHAIN_ID", payload);
  },
  
  SET_USER_ADDRESS({ commit }, payload) {
    commit("SET_USER_ADDRESS", payload);
  },
  
  SET_GTX_INSTANCE({ commit }, payload) {
    commit("SET_GTX_INSTANCE", payload);
  },

  SET_TOKEN_INSTANCE({ commit }, payload) {
    commit("SET_TOKEN_INSTANCE", payload);
  },

  SET_LOCKER_INSTANCE({ commit }, payload) {
    commit("SET_LOCKER_INSTANCE", payload);
  },
};

export default actions;
