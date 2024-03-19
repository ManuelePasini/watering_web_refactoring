<script setup>

import {Line} from "vue-chartjs";
import {onMounted, ref, watchEffect} from "vue";
import 'chartjs-adapter-luxon';
import {luxonDateTime} from '../common/dateUtils.js'
import {CommunicationService} from "../services/CommunicationService.js";

const communicationService = new CommunicationService();

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js'

const props = defineProps({
  config: String,
  endpoint: String,
  yTitle: String,
  label: String,
  color: String
});

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})
let data = ref(new Array(20).fill(0))

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale)

watchEffect(async () => {
  const parsed = JSON.parse(props.config);
  if (parsed) {
    await mountChart()
  }
});

onMounted(async () => {
  mountChart()
});

function addValueAndMaintainSize(value) {
  let newArray = [...data.value];
  newArray.shift();
  newArray.push(value);
  data.value = newArray;
}

async function mountChart() {
  const parsed = JSON.parse(props.config);

  const chartDataResponse = await communicationService.getChartData(parsed.environment, parsed.paths, parsed.params, props.endpoint)
  if(chartDataResponse) {
    console.log(`È arrivato un dato: ${chartDataResponse[0].value}`)
    addValueAndMaintainSize(chartDataResponse[0].value)
  } else {
    addValueAndMaintainSize(Math.random())
  }

  chartData.value = {
    labels: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    datasets: [{
      data: data.value,
      borderColor: props.color,
      backgroundColor: props.color,
      label: props.label,
      pointRadius: 0,
    }]
  }

  options.value = {
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          stepSize: 5
        }
      },
      y: {
        title: {
          display: true,
          text: '°C'
        },
        min: 0
      }
    }
  }

}

</script>

<template>
  <div class="generic-line-chart">
    <Line v-if="data.length > 0" :data="chartData" :options="options" />
    <div v-else>Nessun dato disponibile.</div>
  </div>
</template>

<style scoped>
.generic-line-chart{
  height: 200px;
}

</style>