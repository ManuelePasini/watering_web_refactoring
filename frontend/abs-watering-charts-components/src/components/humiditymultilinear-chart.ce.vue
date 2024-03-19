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
import * as d3 from "d3";

let chartData = ref({datasets: [], labels: []})
let options = ref({responsive: true, maintainAspectRatio: false})
let data = []
let showChart = ref(false)

const props = defineProps(['config'])

const endpoint = 'humidityBins'


const colorFunction = (value) => {
  if (value.includes(", 0]")) {
    return d3.interpolateRdBu(1);
  } else if (value.includes(", -30]")) {
    return d3.interpolateRdBu(0.80);
  } else if (value.includes(", -100]")) {
    return d3.interpolateRdBu(0.70);
  } else if (value.includes(", -200]")) {
    return d3.interpolateRdBu(0.30);
  } else if (value.includes(", -300]")) {
    return d3.interpolateRdBu(0.15);
  } else if (value.includes(", -1500]")) {
    return d3.interpolateRdBu(0.05);
  } else return d3.interpolateRdBu(0)
};

const cleanHumidityBin = (bin) => {
  return bin.split('*')[1].trim();
}

const groupByHumidityBin = (bins) => {
  return bins.reduce((accumulator, currentValue) => {
    const key = cleanHumidityBin(currentValue.humidityBin);
    if(accumulator.has(key))
      accumulator.get(key).push(JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: currentValue.count}));
    else {
      accumulator.set(key, []);
      accumulator.get(key, JSON.stringify({x: luxonDateTime(currentValue.timestamp), y: currentValue.count}));
    }
    return accumulator;
  }, new Map());
}

const createDatasets = (map) => {
  let index = 0;
  const myArray = Array.from(map, ([key, jsonValues]) => {
    const linedataset = new LineDatasetData(key, jsonValues, 'origin', 0 ,0.3, colorFunction);
    index++
    return linedataset
  });

  return myArray
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

  const groupByData = groupByHumidityBin(data);

  chartData.value = {
    datasets: createDatasets(groupByData).map(bin => bin.getDataSet())
  }

  options.value = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: {
      xAxisKey: 'x',
      yAxisKey: 'y'
    },
    plugins: {
      filler: {
        propagate: false
      }
    },
    tooltips: {
      mode: 'index',
      intersect: true,
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    layout: {
      padding: 20
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
        stacked: true,
        title: {
          display: true,
          text: '#Celle'
        },
        ticks: {
          stepSize: 20
        },
        min: 0,

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