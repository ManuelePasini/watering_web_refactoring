<script setup>

import {Line} from "vue-chartjs";
import {onMounted, ref, watchEffect} from "vue";
import 'chartjs-adapter-luxon';
import {luxonDateTime} from '../common/dateUtils.js'
import {CommunicationService} from "../services/CommunicationService.js";

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

const communicationService = new CommunicationService();

const props = defineProps(['config'])
let showChart = ref(false)

const endpoint = 'delta'

import {LineDatasetData} from "../common/LineDatasetData.js";

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})

const groupByType = (measures) => {
  return measures.reduce((accumulator, currentValue) => {
    const key = currentValue.detectedValueTypeDescription
    if(accumulator.has(key))
      accumulator.get(key).push(JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: Number(currentValue.value).toFixed(2)}));
    else {
      accumulator.set(key, []);
      accumulator.get(key, JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: Number(currentValue.value).toFixed(2)}));
    }
    return accumulator;
  }, new Map());
}

const createDatasets = (groupedMeasures) => {
  return Array.from(groupedMeasures, ([key, jsonValues]) => {
    return new LineDatasetData(key, jsonValues, false, 2, 0.2, colorFunction);
  });
};

const colorFunction = (str) => {
  if(str === 'Media Pot. Idr. Ottimale')
    return 'rgb(124, 176, 244)'
  if(str === 'Media Pot. Idr. Giornaliera')
    return 'rgb(0, 110, 189)'
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale)

async function mountChart() {
  const parsed = JSON.parse(props.config);
  let data = []

  const chartDataResponse = await communicationService.getChartData(parsed.environment, parsed.paths, parsed.params, endpoint)
  if(chartDataResponse) {
    data = chartDataResponse
    showChart.value = data.length > 0
  } else data = []

  const groupByData = groupByType(data);

  const datasets = createDatasets(groupByData).map(bin => bin.getDataSet())

  chartData.value = {
    datasets: datasets
  }

  options.value = {
    responsive: true,
    maintainAspectRatio: false,
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
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'cbar'
        },
      }
    }
  }
}

onMounted(async () => {
  await mountChart()
});

watchEffect(async () => {
  let value = props.config;
  if(value) {
    await mountChart()
  }
});


</script>

<template>
  <Line v-if="showChart" :data="chartData" :options="options" />
  <div v-else>Nessun dato disponibile.</div>
</template>

<style scoped>

</style>