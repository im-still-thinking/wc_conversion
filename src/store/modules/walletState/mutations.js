const mutations = {
  SET_WEB3: (state, payload) => {
    state.web3 = payload;
  },

  SET_CHAIN_ID: (state, payload) => {
    state.CHAIN_ID = payload;
  },

  SET_USER_ADDRESS: (state, payload) => {
    state.userAddress = payload;
  },

  SET_GTX_INSTANCE: (state, payload) => {
    state.GTXInstance = payload;
  },

  SET_TOKEN_INSTANCE: (state, payload) => {
    state.TOKENInstance = payload;
  },

  SET_LOCKER_INSTANCE: (state, payload) => {
    state.LOCKERInstance = payload;
  },
};

export default mutations;
