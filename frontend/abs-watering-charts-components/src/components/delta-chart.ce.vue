<script setup>

import {Line} from "vue-chartjs";
import {ref, watchEffect} from "vue";
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
import {LineDatasetData} from "../common/LineDatasetData.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale)

const communicationService = new CommunicationService();

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})
let showChart = ref(false)

const props = defineProps(['config'])

const endpoint = 'delta'

const groupByType = (measures) => {
  return measures.reduce((accumulator, currentValue) => {
    const key = currentValue.detectedValueTypeDescription
    if(!accumulator.has(key))
      accumulator.set(key, []);
    accumulator.get(key).push(JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: Number(currentValue.value).toFixed(2)}));
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

watchEffect(async () => {
  let value = props.config;
  if(value) {
    await mountChart()
  }
});

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
          source: 'data'
        },
        title: {
          display: true,
          text: 'Tempo'
        }
      },
      y: {
        position: 'left',
        title: {
          display: true,
          text: 'cbar'
        },
      }
    }
  }
}

</script>

<template>
  <div v-if="showChart">
    <Line :data="chartData" :options="options"/>
  </div>
  <div v-else>Nessun dato disponibile.</div>
</template>

<style scoped>

</style>