<template>
  <Doughnut
    :width="width"
    :height="height"
    :chart-data="chartData"
    :chart-options="chartOptions"
  />
</template>

<script>
import { Doughnut } from "vue-chartjs/legacy";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default {
  name: "DoughnutChart",
  components: {
    Doughnut,
  },
  props: {
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    labels: {
      type: Array,
      default() {
        return [];
      },
    },
    datasets: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  computed: {
    chartData() {
      return {
        labels: this.labels,
        datasets: [
          {
            backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
            data: this.datasets,
          },
        ],
      };
    },
  },
};
</script>
