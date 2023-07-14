<template>
  <v-row class="anim" style="--delay: 0s">
    <div class="col-12">
      <div class="mb-10">
        <b>
          Link Token Balance:
          <span class="text-red">{{ tokenBalance }}</span>
        </b>
      </div>
      <v-text-field
        outlined
        v-model.number="tokenAmount"
        label="Minting Amount"
        placeholder="Token to mint"
      ></v-text-field>
      <div class="approve-section">
        <v-btn
          large
          color="primary"
          class="mr-5"
          @click="onTokenApprove"
          :disabled="!isEthereum || isLoading || isApproved"
        >
          {{ isApproved ? `Already Approved: ${tokenAllowance}` : "Approve" }}
        </v-btn>
        <v-btn
          large
          color="secondary"
          class="mr-5"
          @click="onMint"
          :disabled="!isEthereum || isLoading || !isApproved"
        >
          Mint Token
        </v-btn>
      </div>
      <div v-if="hash" class="mt-10 text-center">
        <v-alert
          dense
          text
          type="success"
          style="display: inline-block; margin-bottom: 0"
        >
          Transaction is submitted to network! &#160;
          <strong class="cursor-pointer" @click="openScan">
            View on
            {{ isEthereum ? "Etherscan" : "Polygonscan" }}
          </strong>
        </v-alert>
      </div>
    </div>
  </v-row>
</template>
<script>
const Units = require('cryptocurrency-unit-convert')
// eslint-disable-next-line no-unused-vars
import { sepolia } from "@wagmi/core/chains";

import abis from "@/config/abis.json";
import { getPublicClient, getWalletClient } from "@wagmi/core";

export default {
  name: "Minting",
  data() {
    return {
      hash: null,
      tokenAmount: 0,
      isLoading: false,

      isApproved: false,
      tokenBalance: 0,
      tokenAllowance: 0,
    };
  },
  mounted() {
    if (this.getUserAddress && this.isEthereum) {
      this.readValues();
    }
  },
  methods: {
    readValues() {
      Promise.all([
        this.getTOKENInstance.read.balanceOf([this.getUserAddress]),
        this.getTOKENInstance.read.allowance([
          this.getUserAddress,
          this.GTX_ADDRESS,
        ]),
      ]).then(([tokenBalance, tokenAllowance]) => {
        console.log("tokenBalance:", tokenBalance);
        console.log("tokenAllowance:", tokenAllowance);
        this.tokenBalance = this.humanized(tokenBalance, 2);
        this.isApproved = !!Number(tokenAllowance);
        this.tokenAllowance = this.humanized(tokenAllowance, 2);
      });
    },
    async onTokenApprove() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash = null;
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(this.tokenAmount)) {
        this.$toasted.show("Enter Minting Amount");
        return;
      }

      this.isLoading = true;
      const { request } = await publicClient.simulateContract({
        address: this.TOKEN_ADDRESS,
        abi: abis.TOKEN_ABI,
        functionName: "approve",
        args: [this.GTX_ADDRESS, "1000000000000000000000000000"],
        account: this.getUserAddress,
      });
      await walletClient
        .writeContract(request)
        .then((hash) => {
          this.hash = hash;
          this.isApproved = true;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.TOKEN_ADDRESS,
            abi: abis.TOKEN_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
              this.isApproved = true;
              this.isLoading = false;
              this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.isApproved = false;
          this.isLoading = false;
          this.$toasted.show("Transaction rejected");
        });
      //   .error()
      // .on("transactionHash", (hash) => {
      //   this.hash = hash;
      //   this.isApproved = true;
      //   console.log("Transaction Hash: ", hash);
      //   this.$toasted.show("Transaction is submitted to the network");
      // });
      // this.getTOKENInstance.write.approve([this.GTX_ADDRESS, "1000000000000000000000000000"])

      // .on("receipt", (receipt) => {
      //   this.readValues();
      //   this.isApproved = true;
      //   this.isLoading = false;
      //   console.log("Receipt: ", receipt);
      //   this.$toasted.show("Transaction completed successfully");
      // })
      // .on("error", (error, receipt) => {
      //   this.isApproved = false;
      //   this.isLoading = false;
      //   console.log("Error receipt: ", receipt);
      //   this.$toasted.show("Transaction rejected");
      // });

      // this.getTOKENInstance.read
      //   .approve([this.GTX_ADDRESS, "1000000000000000000000000000"])
    },

    async onMint() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash = null;
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(this.tokenAmount)) {
        this.$toasted.show("Enter Minting Amount");
        return;
      }

      let tokenAmount = Units.convertETH(this.tokenAmount.toString(), 'eth', 'wei')
      console.log(tokenAmount)

      this.isLoading = true;
      const { request } = await publicClient.simulateContract({
        address: this.GTX_ADDRESS,
        abi: abis.GTX_ABI,
        functionName: "mintWithOLDCrv",
        args: [tokenAmount],
        account: this.getUserAddress,
      });
      await walletClient
        .writeContract(request)
        .then((hash) => {
          this.hash = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.GTX_ADDRESS,
            abi: abis.GTX_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
              this.isLoading = false;
              this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.isLoading = false;
          this.$toasted.show("Transaction rejected");
        });

      // this.getGTXInstance.write
      //   .mintWithOLDCrv([tokenAmount])
      //   .on("transactionHash", (hash) => {
      //     this.hash = hash;
      //     console.log("Transaction Hash: ", hash);
      //     this.$toasted.show("Transaction is submitted to the network");
      //   })
      //   .on("receipt", (receipt) => {
      //     this.readValues();
      //     this.isLoading = false;
      //     console.log("Receipt: ", receipt);
      //     this.$toasted.show("Transaction completed successfully");
      //   })
      //   .on("error", (error, receipt) => {
      //     this.isLoading = false;
      //     console.log("Error receipt: ", receipt);
      //     this.$toasted.show("Transaction rejected");
      //   });
    },
    openScan() {
      let url = `${this.NETWORKS[this.CHAIN_ID]}/tx/${this.hash}`;
      window.open(url, "_blank");
    },
  },
  watch: {
    CHAIN_ID() {
      if (this.isEthereum) {
        this.readValues();
      } else {
        this.tokenAmount = 0;
        this.isLoading = false;
        this.isApproved = false;
        this.tokenBalance = 0;
        this.tokenAllowance = 0;
      }
    },
    async getUserAddress() {
      if (this.isEthereum && this.getUserAddress) {
        this.readValues();
      } else {
        this.tokenAmount = 0;
        this.isLoading = false;
        this.isApproved = false;
        this.tokenBalance = 0;
        this.tokenAllowance = 0;
      }
    },
  },
};
</script>
