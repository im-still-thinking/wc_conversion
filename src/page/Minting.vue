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
        this.getTOKENInstance.read.allowance([this.getUserAddress, this.GTX_ADDRESS]),
      ]).then(([tokenBalance, tokenAllowance]) => {
        console.log("tokenBalance:", tokenBalance);
        console.log("tokenAllowance:", tokenAllowance);
        this.tokenBalance = this.humanized(tokenBalance, 2);
        this.isApproved = !!Number(tokenAllowance);
        this.tokenAllowance = this.humanized(tokenAllowance, 2);
      });
    },
    onTokenApprove() {
      this.hash = null;
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(this.tokenAmount)) {
        this.$toasted.show("Enter Minting Amount");
        return;
      }

      this.isLoading = true;
      this.getTOKENInstance.methods
        .approve(this.GTX_ADDRESS, "1000000000000000000000000000")
        .send({
          from: this.getUserAddress,
        })
        .on("transactionHash", (hash) => {
          this.hash = hash;
          this.isApproved = true;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
        })
        .on("receipt", (receipt) => {
          this.readValues();
          this.isApproved = true;
          this.isLoading = false;
          console.log("Receipt: ", receipt);
          this.$toasted.show("Transaction completed successfully");
        })
        .on("error", (error, receipt) => {
          this.isApproved = false;
          this.isLoading = false;
          console.log("Error receipt: ", receipt);
          this.$toasted.show("Transaction rejected");
        });
    },

    onMint() {
      this.hash = null;
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(this.tokenAmount)) {
        this.$toasted.show("Enter Minting Amount");
        return;
      }

      let tokenAmount = this.getWeb3.utils.toWei(
        this.tokenAmount.toString(),
        "ether"
      );
      this.isLoading = true;
      this.getGTXInstance.methods
        .mintWithOLDCrv(tokenAmount)
        .send({
          from: this.getUserAddress,
        })
        .on("transactionHash", (hash) => {
          this.hash = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
        })
        .on("receipt", (receipt) => {
          this.readValues();
          this.isLoading = false;
          console.log("Receipt: ", receipt);
          this.$toasted.show("Transaction completed successfully");
        })
        .on("error", (error, receipt) => {
          this.isLoading = false;
          console.log("Error receipt: ", receipt);
          this.$toasted.show("Transaction rejected");
        });
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
