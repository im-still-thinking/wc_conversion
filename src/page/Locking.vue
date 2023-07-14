<template>
  <v-row class="justify-content-center anim" style="--delay: 0s">
    <div class="col-12">
      <v-row class="mb-10">
        <div class="col-12 col-md-6">
          <div class="mb-5">
            <b>
              GTX Balance:
              <span class="text-red">{{ GTXBalance }}</span>
            </b>
          </div>
          <div class="mb-5">
            <b>
              My GTX Lock:
              <span class="text-red">{{ lockedAmount }}</span>
            </b>
          </div>

          <div>
            <b>
              Locked Till:
              <span class="text-red">{{ lockedTime }}</span>
            </b>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="withdraw-section">
            <v-btn
              large
              class="mr-5"
              color="primary"
              @click="onGTXApprove"
              :disabled="!isEthereum || isLoading || isApproved"
            >
              {{
                isApproved
                  ? `Already Approved: ${GTXAllowance}`
                  : "Approve GTX First"
              }}
            </v-btn>
            <v-btn
              large
              class="mr-5"
              color="secondary"
              @click="onWithdraw"
              :disabled="!isEthereum || isLoading || isWithdrawable"
            >
              Withdraw
            </v-btn>
          </div>
        </div>
      </v-row>
      <div v-if="hash1" class="my-5">
        <v-alert
          dense
          text
          type="success"
          style="display: inline-block; margin-bottom: 0"
        >
          Transaction is submitted to network! &#160;
          <strong class="cursor-pointer" @click="openScan(hash1)">
            View on
            {{ isEthereum ? "Etherscan" : "Polygonscan" }}
          </strong>
        </v-alert>
      </div>
      <div v-if="isLockAllow">
        <h3 class="mb-10">Lock GTX</h3>
        <div class="mt-4">
          <v-text-field
            outlined
            v-model.number="lockAmount"
            label="GTX Lock Amount"
            placeholder="Amount to Lock"
          ></v-text-field>
        </div>
        <v-select
          outlined
          v-model="lockTime"
          :items="lockTimes"
          item-text="label"
          item-value="value"
          label="Lock Time"
        ></v-select>
        <v-btn
          large
          color="primary"
          class="mr-5"
          @click="onLock"
          :disabled="!isEthereum || isLoading || !isApproved"
        >
          Create Lock
        </v-btn>
        <div v-if="hash2" class="mt-10">
          <v-alert
            dense
            text
            type="success"
            style="display: inline-block; margin-bottom: 0"
          >
            Transaction is submitted to network! &#160;
            <strong class="cursor-pointer" @click="openScan(hash2)">
              View on
              {{ isEthereum ? "Etherscan" : "Polygonscan" }}
            </strong>
          </v-alert>
        </div>
      </div>
      <hr />
    </div>
    <div class="col-12">
      <h3 class="mb-10">Increase Lock Amount</h3>
      <div>
        <v-text-field
          outlined
          v-model.number="incLockAmount"
          label="Increase GTX Lock Amount"
          placeholder="Amount to Lock"
        ></v-text-field>
      </div>
      <v-btn
        large
        color="primary"
        class="mr-5"
        @click="onIncLockAmount"
        :disabled="!isEthereum || isLoading || !isApproved"
      >
        Increase Lock Amount
      </v-btn>
      <div v-if="hash3" class="mt-10">
        <v-alert
          dense
          text
          type="success"
          style="display: inline-block; margin-bottom: 0"
        >
          Transaction is submitted to network! &#160;
          <strong class="cursor-pointer" @click="openScan(hash3)">
            View on
            {{ isEthereum ? "Etherscan" : "Polygonscan" }}
          </strong>
        </v-alert>
      </div>
      <hr />
    </div>
    <div class="col-12">
      <h3 class="mb-10">Increase Lock Time</h3>
      <v-select
        outlined
        v-model="incLockTime"
        :items="incLockTimes"
        item-text="label"
        item-value="value"
        label="Increase Lock Time"
      ></v-select>

      <v-btn
        large
        color="primary"
        class="mr-5"
        @click="onIncLockTime"
        :disabled="!isEthereum || isLoading || !isApproved"
      >
        Increase Lock Time
      </v-btn>
      <div v-if="hash4" class="mt-10">
        <v-alert
          dense
          text
          type="success"
          style="display: inline-block; margin-bottom: 0"
        >
          Transaction is submitted to network! &#160;
          <strong class="cursor-pointer" @click="openScan(hash4)">
            View on
            {{ isEthereum ? "Etherscan" : "Polygonscan" }}
          </strong>
        </v-alert>
      </div>
    </div>
  </v-row>
</template>
<script>

import abis from "@/config/abis.json";
import { getPublicClient, getWalletClient } from "@wagmi/core";
const Units = require("cryptocurrency-unit-convert");

import { sepolia } from "@wagmi/core/chains";

export default {
  name: "Locking",
  data() {
    return {
      hash1: null,
      hash2: null,
      hash3: null,
      hash4: null,
      isLockAllow: true,
      GTXBalance: 0,
      lockedAmount: 0,
      lockedTime: "---",

      lockAmount: null,
      lockTime: "Choose...",

      incLockAmount: null,
      incLockTime: "Choose...",

      lockTimes: [
        { label: "Choose...", value: "Choose...", disabled: true },
        { label: "2 Week", value: "2 Week", disabled: false },
        { label: "1 Month", value: "1 Month", disabled: false },
        { label: "3 Months", value: "3 Months", disabled: false },
        { label: "6 Months", value: "6 Months", disabled: false },
        { label: "1 Year", value: "1 Year", disabled: false },
      ],
      incLockTimes: [
        { label: "Choose...", value: "Choose...", disabled: true },
        { label: "2 Week", value: "2 Week", disabled: false },
        { label: "1 Month", value: "1 Month", disabled: false },
        { label: "3 Months", value: "3 Months", disabled: false },
        { label: "6 Months", value: "6 Months", disabled: false },
        { label: "1 Year", value: "1 Year", disabled: false },
      ],

      isApproved: false,
      GTXAllowance: 0,

      isLoading: false,
      isWithdrawable: false,
    };
  },
  mounted() {
    if (this.getUserAddress) {
      this.readValues();
    }
  },
  methods: {
    readValues() {
      Promise.all([
        this.getGTXInstance.read.balanceOf([this.getUserAddress]),
        this.getGTXInstance.read
          .allowance([this.getUserAddress, this.LOCKER_ADDRESS]),
        this.getLOCKERInstance.read.locked([this.getUserAddress]),
      ]).then(([GTXBalance, GTXAllowance, locked]) => {
        console.log("GTXBalance:", GTXBalance);
        console.log("GTXAllowance:", GTXAllowance);
        console.log("locked:", locked);

        this.GTXBalance = this.humanized(GTXBalance, 2);
        this.isApproved = !!Number(GTXAllowance);
        this.GTXAllowance = this.humanized(GTXAllowance, 2);

        this.lockedTime = this.timeConverter(locked.end);
        this.lockedAmount = this.humanized(locked.amount, 2);

        if (Number(locked.amount)) this.isLockAllow = false;
        else this.isLockAllow = true;

        if (
          !Number(locked.end) ||
          Number(locked.end) > Math.floor(new Date().getTime() / 1000)
        ) {
          this.isWithdrawable = true;
          this.incLockTimes.forEach((option) => {
            var optionValue = this.calculateEpochTimestamp(option.value);
            if (optionValue <= Number(locked.end)) option.disabled = true;
            else option.disabled = false;
          });
        } else {
          this.isWithdrawable = false;
        }
      });
    },

    async onGTXApprove() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash1 = null;
      this.hash2 = null;
      this.hash3 = null;
      this.hash4 = null;
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      }
      const { request } = await publicClient.simulateContract({
        address: this.GTX_ADDRESS,
        abi: abis.GTX_ABI,
        functionName: "approve",
        args: [this.LOCKER_ADDRESS, "1000000000000000000000000000"],
        account: this.getUserAddress,
      });
      await walletClient
        .writeContract(request)
        .then((hash) => {
          this.hash1 = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.GTX_ADDRESS,
            abi: abis.GTX_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
              this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.$toasted.show("Transaction rejected");
        });
    },

    async onLock() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash1 = null;
      this.hash2 = null;
      this.hash3 = null;
      this.hash4 = null;
      let timeText = this.lockTime;
      let time = this.calculateEpochTimestamp(timeText);
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(this.lockAmount)) {
        this.$toasted.show("Enter Locking Amount");
        return;
      } else if (!Number(time)) {
        this.$toasted.show("Select Locking period");
        return;
      }
      let amount = Units.convertETH(
        this.lockAmount.toString(),
        "eth",
        "wei"
      );

      await walletClient
        .writeContract({
          address: this.LOCKER_ADDRESS,
          abi: abis.LOCKER_ABI,
          functionName: "createAmount",
          args: [amount, time],
          account: this.getUserAddress,
        })
        .then((hash) => {
          this.hash2 = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.GTX_ADDRESS,
            abi: abis.GTX_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
              this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.$toasted.show("Transaction rejected");
        });
    },

    async nIncLockAmount() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash1 = null;
      this.hash2 = null;
      this.hash3 = null;
      this.hash4 = null;
      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(this.incLockAmount)) {
        this.$toasted.show("Enter Locking Amount");
        return;
      }

      let amount = Units.convertETH(
        this.incLockAmount.toString(),
        "eth",
        "wei"
      );

      await walletClient
        .writeContract({
          address: this.LOCKER_ADDRESS,
          abi: abis.LOCKER_ABI,
          functionName: "increaseAmount",
          args: [amount],
          account: this.getUserAddress,
        })
        .then((hash) => {
          this.hash3 = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.GTX_ADDRESS,
            abi: abis.GTX_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
              this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.$toasted.show("Transaction rejected");
        });
    },

    async onIncLockTime() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash1 = null;
      this.hash2 = null;
      this.hash3 = null;
      this.hash4 = null;
      let timeText = this.incLockTime;
      let time = this.calculateEpochTimestamp(timeText);

      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      } else if (!Number(time)) {
        this.$toasted.show("Select Locking period");
        return;
      }

      await walletClient
        .writeContract({
          address: this.LOCKER_ADDRESS,
          abi: abis.LOCKER_ABI,
          functionName: "increaseUnlockTime",
          args: [time],
          account: this.getUserAddress,
        })
        .then((hash) => {
          this.hash4 = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.GTX_ADDRESS,
            abi: abis.GTX_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
              this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.$toasted.show("Transaction rejected");
        });
    },

    async onWithdraw() {
      const walletClient = await getWalletClient({
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient({
        chainId: sepolia.id,
      });

      this.hash1 = null;
      this.hash2 = null;
      this.hash3 = null;
      this.hash4 = null;

      if (!this.getUserAddress) {
        this.$toasted.show("Connect your wallet first");
        return;
      }

      await walletClient
        .writeContract({
          address: this.LOCKER_ADDRESS,
          abi: abis.LOCKER_ABI,
          functionName: "withdraw",
          account: this.getUserAddress,
        })
        .then((hash) => {
          this.hash1 = hash;
          console.log("Transaction Hash: ", hash);
          this.$toasted.show("Transaction is submitted to the network");
          const unwatch = publicClient.watchContractEvent({
            address: this.GTX_ADDRESS,
            abi: abis.GTX_ABI,
            eventName: "Approval",
            onLogs: (logs) => {
              console.log(logs);
              this.readValues();
            this.$toasted.show("Transaction completed successfully");
              unwatch();
            },
          });
        })
        .catch((error) => {
          console.log(error);
          this.$toasted.show("Transaction rejected");
        });
    },
    openScan(hash) {
      let url = `${this.NETWORKS[this.CHAIN_ID]}/tx/${hash}`;
      window.open(url, "_blank");
    },
  },
  watch: {
    CHAIN_ID() {
      if (this.isEthereum) {
        this.readValues();
      } else {
        this.isLockAllow = true;
        this.GTXBalance = 0;
        this.lockedAmount = 0;
        this.lockedTime = "---";
        this.lockAmount = null;
        this.lockTime = "Choose...";
        this.incLockAmount = null;
        this.incLockTime = "Choose...";
        this.isApproved = false;
        this.GTXAllowance = 0;
        this.isLoading = false;
        this.isWithdrawable = false;
      }
    },
    async getUserAddress() {
      if (this.isEthereum && this.getUserAddress) {
        this.readValues();
      } else {
        this.isLockAllow = true;
        this.GTXBalance = 0;
        this.lockedAmount = 0;
        this.lockedTime = "---";
        this.lockAmount = null;
        this.lockTime = "Choose...";
        this.incLockAmount = null;
        this.incLockTime = "Choose...";
        this.isApproved = false;
        this.GTXAllowance = 0;
        this.isLoading = false;
        this.isWithdrawable = false;
      }
    },
  },
};
</script>
