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

const props = defineProps(['config'])

const endpoint = 'airTemp'

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})
let showChart = ref(false)

const getData = (measures) => {
  return measures.map(measure => ({ x: luxonDateTime(measure.timestamp), y: measure.value }));
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale)

onMounted(async () => {
  console.log("On mounted called");
  await mountChart()
});

watchEffect(async () => {
  let value = props.config;
  if(value) {
    const parsed = JSON.parse(props.config);
    await mountChart()
  }
});

async function mountChart() {
  const parsed = JSON.parse(props.config);
  let data = []

  const chartDataResponse = await communicationService.getChartData(parsed.environment, parsed.paths, parsed.params, endpoint)
  if(chartDataResponse) {
    data = getData(chartDataResponse)
    showChart.value = data.length > 0
  } else data = []

    chartData.value = {
      datasets: [{
        data: data,
        borderColor: 'rgb(31, 119, 180)',
        backgroundColor: 'rgb(31, 119, 180)',
        label: "AirTemp"
      }]
    }

    options.value = {
      responsive: true,
      maintainAspectRatio: false,
      parsing: {
        xAxisKey: 'x',
        yAxisKey: 'y'
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
            displayFormats: {
              minute: 'yyyy-MM-dd HH:mm', // Customize the display format for minutes
              second: 'yyyy-MM-dd HH:mm', // Customize the display format for seconds,
              hour: 'yyyy-MM-dd HH:mm:ss',
              day: 'yyyy-MM-dd',
              month: 'yyyy-MM-dd HH:mm:ss'
            },
          },
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Tempo'
          }
        },
        y: {
          title: {
            display: true,
            text: '°C'
          }
        }
      }
    }

}

</script>

<template>
  <Line v-if="showChart" :data="chartData" :options="options" />
  <div v-else>Nessun dato disponibile.</div>
</template>

<style scoped>

</style>