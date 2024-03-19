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
import {LineDatasetData} from "../common/LineDatasetData.js";

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})
let showChart = ref(false)

const props = defineProps(['config'])

const endpoint = 'groundWaterPotential'


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
    return new LineDatasetData(key, jsonValues, false, 3, 0.3, colorFunction);
  });
};

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale)

onMounted(async () => {
  await mountChart()
});

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

  const datasets = createDatasets(groupByData).map(bin => bin.getDataSet(colorFunction))

  chartData.value = {
    datasets: datasets
  }

  options.value = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: {
      xAxisKey: 'x',
      yAxisKey: 'y'
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
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
          text: '#Celle'
        },
        ticks: {
          stepSize: 20
        },
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