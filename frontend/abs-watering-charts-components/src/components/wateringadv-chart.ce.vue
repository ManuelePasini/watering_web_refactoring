<script setup>

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import {onMounted, ref, watchEffect} from "vue";
import 'chartjs-adapter-luxon';
import {luxonDateTime} from '../common/dateUtils.js'
import {CommunicationService} from "../services/CommunicationService.js";
import {BarDatasetData} from "../common/BarDatasetData.js";

const communicationService = new CommunicationService();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale)

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})
let data = ref([])
let showChart = ref(false)

const props = defineProps(['config'])

const endpoint = 'wateringAdvice'

const colorFunction = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

const groupByType = (measures) => {
  return measures.reduce((accumulator, currentValue) => {
    const key = currentValue.detectedValueTypeDescription
    if(accumulator.has(key))
      accumulator.get(key).push(JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: Number(currentValue.value).toFixed(2), y1: Number(currentValue.value).toFixed(2)}));
    else {
      accumulator.set(key, []);
      accumulator.get(key, JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: Number(currentValue.value).toFixed(2), y1: Number(currentValue.value).toFixed(2)}));
    }
    return accumulator;
  }, new Map());
}

const createDatasets = (groupedMeasures) => {
  return Array.from(groupedMeasures, ([key, jsonValues]) => {
    return new BarDatasetData(key, jsonValues, key === 'Dripper' ? 'y1':'y', colorFunction);
  });
};

onMounted(async () => {
  console.log("On mounted called");
  await mountChart()
});

watchEffect(async () => {
  let value = props.config;
  if(value) {
    const parsed = JSON.parse(props.config);
    console.log(`Oggetto passato ${JSON.stringify(parsed)}`)
    await mountChart()
  }
});

async function mountChart() {
  const parsed = JSON.parse(props.config);

  const chartDataResponse = await communicationService.getChartData(parsed.environment, parsed.paths, parsed.params, endpoint)
  if(chartDataResponse) {
    data.value = chartDataResponse
    showChart.value = data.value.length > 0
  } else data = []

  const values = data.value.map(item => item.value);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const groupByData = groupByType(data.value);

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
        title: {
          display: true,
          text: 'L'
        },
        position: 'left',
        max: maxValue,
        min: minValue
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'mm'
        },
        max: maxValue,
        min: minValue
      }
    }
  }

}



</script>

<template>
  <Bar v-if="showChart" :data="chartData" :options="options" />
  <div v-else>Nessun dato disponibile.</div>
</template>

<style scoped>

</style>