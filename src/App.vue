<template>
  <v-app>
    <Sidebar @onClose="onClose" :isOpen="isOpen"></Sidebar>
    <Header @onOpen="isOpen = !isOpen" ref="header" @onConnect="showCombinedButton"></Header>
    <div class="page-container">
      <v-main>
        <v-row class="start">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <router-view />
              </div>
            </div>
          </div>
        </v-row>
        <div v-if="show" class="overlay" id="hide">
          <div class="center-container">
            <div class="combined-button">
              <button class="button-section" @click="handleButtonClick()">
                <img
                  class="button-image"
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="Button 1 Image"
                />
                <div class="button-text">
                  <h3 class="button-title">Metamask</h3>
                  <p class="button-subtitle">Connect to your Metamask Wallet</p>
                </div>
              </button>
              <hr class="separator-line" />
              <button class="button-section" @click="handleButtonClick()">
                <img
                  class="button-image"
                  src="https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png"
                  alt="Button 2 Image"
                />
                <div class="button-text">
                  <h3 class="button-title">WalletConnect</h3>
                  <p class="button-subtitle">
                    Scan with WalletConnect to connect
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </v-main>
    </div>
  </v-app>
</template>

<script>
import abis from "@/config/abis.json";

import { configureChains, createConfig } from "@wagmi/core";
import { arbitrum, mainnet, polygon, sepolia } from "@wagmi/core/chains";
import {
EthereumClient,
w3mConnectors,
w3mProvider,
} from "@web3modal/ethereum";

import { getAccount, getContract, getNetwork, watchAccount } from "@wagmi/core";
import { Web3Modal } from "@web3modal/html";

import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";

import EventBus from "../eventbus.js";

export default {
  name: "App",
  components: { Sidebar, Header },
  data() {
    return {
      isOpen: true,
      provider: null,
      web3Modal: null,
      show: false,
    };
  },
  beforeMount() {
    this.isOpen = !this.$vuetify.breakpoint.mobile;
    const chains = [arbitrum, mainnet, polygon, sepolia];
    const projectId = "76b2f1c2d99dfca758a403f2cf759f57";

    const { publicClient } = configureChains(chains, [
      w3mProvider({ projectId }),
    ]);
    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains }),
      publicClient,
    });
    const ethereumClient = new EthereumClient(wagmiConfig, chains);
    this.web3modal = new Web3Modal({ projectId }, ethereumClient);
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
  methods: {
    showCombinedButton() {
      this.show = true;
      console.log(this.show);
    },
    handleOutsideClick(event) {
      const connectbutton = this.$refs.header.$refs.connectButton.$el;
      console.log(connectbutton);
      if (connectbutton && !connectbutton.contains(event.target)) {
        this.show = false;
      }
    },
    handleButtonClick() {
      // Hide the combined button
      this.show = false;
      this.onConnect();
    },
    onClose(isClose) {
      if (!isClose) this.isOpen = false;
    },
    async onConnect() {
      try {
        await this.web3modal.openModal();
        this.onProvider();
        // eslint-disable-next-line no-unused-vars
        const unwatch = watchAccount((account) => {
          console.log(account);
          if (account.isDisconnected) {
            EventBus.$emit("disconnect");
          }
          this.onProvider();
        });
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
      }
    },
    async onProvider() {
      // eslint-disable-next-line no-unused-vars
      let accounts = getAccount();
      let chainId = getNetwork();

      let CHAIN_IDs = Object.keys(this.NETWORKS);

      if (!CHAIN_IDs.includes(chainId.chain.id.toString())) {
        this.$toasted.show(`Only Ethereum or Polygon Network Supported`);
        return;
      }

      // this.SET_WEB3(web3);
      this.SET_CHAIN_ID(chainId.chain.id);
      this.SET_USER_ADDRESS(accounts.address);

      if (this.isEthereum) {
        let GTX_INSTANCE = getContract({
          address: this.GTX_ADDRESS,
          abi: abis.GTX_ABI,
        });
        let TOKEN_INSTANCE = getContract({
          address: this.TOKEN_ADDRESS,
          abi: abis.TOKEN_ABI,
        });
        let LOCKER_INSTANCE = getContract({
          address: this.LOCKER_ADDRESS,
          abi: abis.LOCKER_ABI,
        });
        this.SET_GTX_INSTANCE(GTX_INSTANCE);
        this.SET_TOKEN_INSTANCE(TOKEN_INSTANCE);
        this.SET_LOCKER_INSTANCE(LOCKER_INSTANCE);
      } else {
        let TOKEN_INSTANCE = getContract({
          address: this.TOKEN_POLYGON_ADDRESS,
          abi: abis.TOKEN_ABI,
        });
        this.SET_GTX_INSTANCE(null);
        this.SET_TOKEN_INSTANCE(TOKEN_INSTANCE);
        this.SET_LOCKER_INSTANCE(null);
      }
    },
  },
  watch: {
    async getUserAddress() {
      if (!this.getUserAddress) {
        this.provider = null;
      }
    },
  },
};
</script>
<style>
@import "./styles/style.css";
</style>
