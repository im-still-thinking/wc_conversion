<template>
  <v-row class="anim" style="--delay: 0s">
    <div class="col-12 col-sm-6">
      <div class="d-flex align-center">
        <div class="mr-4">
          <img class="c-icon" src="@/assets/eth.png" />
        </div>
        <div>
          <b>GTX Balance</b> <br />
          <span class="text-red">{{ GTXBalance }}</span>
        </div>
      </div>
    </div>
    <div v-if="isEthereum" class="col-12 col-sm-6">
      <div class="d-flex align-center">
        <div class="mr-4">
          <img class="c-icon" src="@/assets/btc.png" />
        </div>
        <div>
          <b>veGTX Balance</b> <br />
          <span class="text-red">{{ veGTXBalance }}</span>
        </div>
      </div>
    </div>
    <div v-if="datasets.length" class="col-12 mt-10">
      <h3 class="mb-5">Bitcoin Last 24 Hours Price</h3>
      <LineChart :labels="labels" :datasets="datasets" />
    </div>
    <div v-if="isEthereum" class="col-12 mt-10">
      <h3 class="mb-5">GTX vs veGTX</h3>
      <DoughnutChart
        :labels="['GTX', 'veGTX']"
        :datasets="[GTXBalance, veGTXBalance]"
      />
    </div>
  </v-row>
</template>
<script>
import DoughnutChart from "../components/DoughnutChart.vue";
import LineChart from "../components/LineChart.vue";

export default {
  name: "Wallet",
  components: { LineChart, DoughnutChart },
  data() {
    return {
      GTXBalance: 0,
      veGTXBalance: 0,
      labels: [],
      datasets: [],
    };
  },
  mounted() {
    this.fetchNFTs();
    if (this.getUserAddress) {
      this.readValues();
    }
  },
  methods: {
    readValues() {
      Promise.all([
        this.getGTXInstance.read.balanceOf([this.getUserAddress]),
        this.getLOCKERInstance.read.balanceOf([this.getUserAddress]),
      ]).then(([GTXBalance, veGTXBalance]) => {
        console.log("GTXBalance:", GTXBalance);
        console.log("veGTXBalance:", veGTXBalance);
        this.GTXBalance = this.humanized(GTXBalance, 2);
        this.veGTXBalance = this.humanized(veGTXBalance, 2);
      });
    },
    readValuesPoly() {
      Promise.all([
        this.getTOKENInstance.read.balanceOf([this.getUserAddress]),
      ]).then(([GTXBalance]) => {
        console.log("GTXBalance:", GTXBalance);
        this.GTXBalance = this.humanized(GTXBalance, 2);
      });
    },
    async fetchNFTs() {
      let baseURL = `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=1`;

      let data = await fetch(baseURL).then((data) => data.json());
      let formatedData = this.extractArraysFromArray(data);
      this.labels = formatedData[0];
      this.datasets = formatedData[1];
    },
    extractArraysFromArray(arr) {
      let array1 = [];
      let array2 = [];

      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
          array1.push(this.timeConverter(Number(arr[i][0]) / 1000));
          array2.push(arr[i][1]);
        }
      }

      return [array1, array2];
    },
  },
  watch: {
    CHAIN_ID() {
      if (this.isEthereum) {
        this.readValues();
      } else {
        this.GTXBalance = 0;
        this.veGTXBalance = 0;
      }
    },
    async getUserAddress() {
      if (this.getUserAddress) {
        if (this.isEthereum) {
          this.readValues();
        } else {
          this.readValuesPoly();
        }
      } else {
        this.GTXBalance = 0;
        this.veGTXBalance = 0;
      }
    },
  },
};
</script>
