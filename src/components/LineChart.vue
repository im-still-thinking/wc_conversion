<template>
  <LineChartGenerator
    :width="width"
    :height="height"
    :chart-data="chartData"
    :chart-options="chartOptions"
  />
</template>

<script>
import { Line as LineChartGenerator } from "vue-chartjs/legacy";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default {
  name: "LineChart",
  components: {
    LineChartGenerator,
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
            label: "Price",
            backgroundColor: "#f87979",
            data: this.datasets,
          },
        ],
      };
    },
  },
};
</script>
