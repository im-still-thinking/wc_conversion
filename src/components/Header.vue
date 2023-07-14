<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click="$emit('onOpen')"></v-app-bar-nav-icon>
    <v-alert v-if="getUserAddress" @click="openScan" dense text type="info">
      <img v-if="isEthereum" src="@/assets/eth.png" width="25px" />
      <img v-else src="@/assets/matic.png" width="25px" />
      {{ addrTruncation(getUserAddress) }}
    </v-alert>
    <v-spacer></v-spacer>
    <v-btn
      v-if="getUserAddress"
      large
      id="connectButton"
      color="secondary"
      @click="onDisconnect"
    >
      Disconnect
    </v-btn>
    <v-btn
      v-else
      large
      id="connectButton"
      color="secondary"
      @click="$emit('onConnect')"
    >
      <img src="@/assets/metamask.webp" />
      Connect Wallet
    </v-btn>
  </v-app-bar>
</template>
<script>
export default {
  name: "Header",
  methods: {
    onDisconnect() {
      this.SET_WEB3(null);
      this.SET_CHAIN_ID(null);
      this.SET_USER_ADDRESS(null);
      this.SET_GTX_INSTANCE(null);
      this.SET_TOKEN_INSTANCE(null);
      this.SET_LOCKER_INSTANCE(null);
    },
    openScan() {
      let url = `${this.NETWORKS[this.CHAIN_ID]}/address/${
        this.getUserAddress
      }`;
      window.open(url, "_blank");
    },
  },
};
</script>
<style>
.v-app-bar .v-alert {
  cursor: pointer;
  margin-bottom: 0;
}
.v-app-bar .v-alert__icon {
  display: none !important;
}
.v-app-bar .v-alert__content {
  display: flex;
  align-items: center;
  justify-content: center;
}
.v-app-bar .v-alert__content img {
  margin-right: 10px;
}
</style>
