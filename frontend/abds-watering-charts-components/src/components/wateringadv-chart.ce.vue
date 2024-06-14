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
import { ref, watchEffect} from "vue";
import 'chartjs-adapter-luxon';
import {luxonDateTime} from '../common/dateUtils.js'
import {CommunicationService} from "../services/CommunicationService.js";
import {BarDatasetData} from "../common/BarDatasetData.js";

const communicationService = new CommunicationService();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale)

const chartData = ref({datasets: [], labels: []})
const options = ref({responsive: true, maintainAspectRatio: false})
const showChart = ref(false)

const props = defineProps(['config'])

const endpoint = 'wateringAdvice'

const colorFunction = (str) => {
  if (str === 'Dripper (L)')
    return '#339CFF'
  if (str === 'Pluv Curr (mm)')
    return '#FFCD3D'
  if (str === 'Advice (L)')
    return '#6064C8'
  if (str === 'Pot Evap (mm)')
    return '#FA4443'
  if (str === 'Expected Water (L)')
    return '#4CAF50'
}

const groupByType = (measures) => {
  return measures.reduce((accumulator, currentValue) => {
    const key = currentValue.detectedValueTypeDescription
    if(!accumulator.has(key))
      accumulator.set(key, []);

    accumulator.get(key).push(JSON.stringify({ x: luxonDateTime(currentValue.timestamp), y: Number(currentValue.value).toFixed(2) }));

    return accumulator;
  }, new Map());
}

const createDatasets = (groupedMeasures) => {
  return Array.from(groupedMeasures, ([key, jsonValues]) => {
    return new BarDatasetData(key, jsonValues, key.includes("(mm)") ? 'y1' : 'y', colorFunction);
  });
};

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

  const values = data.map(item => item.value);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

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
        beginAtZero: true,
        title: {
          display: true,
          text: 'L'
        },
        position: 'left',
        suggestedMax: maxValue,
        suggestedMin: minValue,
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'mm'
        },
        suggestedMax: maxValue,
        suggestedMin: minValue
      }
    }
  }
}



</script>

<template>
  <div v-if="showChart">
    <Bar :data="chartData" :options="options" />
  </div>
  <div v-else>Nessun dato disponibile.</div>
</template>

<style scoped>

</style>