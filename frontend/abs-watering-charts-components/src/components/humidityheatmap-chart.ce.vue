<script setup>
import {nextTick, ref, watch, watchEffect} from "vue";
import {CommunicationService} from "../services/CommunicationService.js";
import VueApexCharts  from "vue3-apexcharts"
import { luxonDateTimeToString } from "../common/dateUtils.js"

const communicationService = new CommunicationService();
const heatmapSeries = ref([]);
const chartOptions = ref({emitsOptions: false})
const images = ref({})
const container = ref(null)

const props = defineProps(['config', 'selectedTimestamp'])
const showChart = ref(false)
const endpoint = 'heatmap'

watchEffect( async () => {
  let value = props.config;
  if(value) {
    await mountChart()
  }
});

watch( () => props.selectedTimestamp, async (timestamp) => {
  if(timestamp){
    await drawImage(timestamp)
  }
})

const load = ref(false)

async function drawImage(timestamp){
  if (!(Object.keys(images.value).length == 0)){
    return
  }
  timestamp = String(timestamp)
  if(!images.value.has(timestamp)){
    console.log("Image " + timestamp + " is missing")
    return
  }


  heatmapSeries.value = Array.from(images.value.get(timestamp).reduce((accumulator, currentValue) => {
    if (!accumulator.has(currentValue.yy))
      accumulator.set(currentValue.yy, []);
    accumulator.get(currentValue.yy).push({ x: currentValue.xx,
      y: currentValue.value.toFixed(2)
    })
    return accumulator
  }, new Map()), ([key, value])=> {
    return {
      name: key,
      data: value.sort((a,b)=> a.x - b.x)
    }
  }).sort((a,b)=> b.name - a.name)

  if(!container.value){
    await nextTick()
  }
  const containerWidth = container.value.offsetWidth
  const cellSize = containerWidth / heatmapSeries.value[0].data.length
  const titleOffset = 80
  const chartHeight = (cellSize * heatmapSeries.value.length + titleOffset) + "px"

  chartOptions.value = {
    chart: {
      type: 'heatmap',
      height: chartHeight,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: false,
      }
    },
    plotOptions: {
      heatmap: {
        enableShades: false,
        radius: 0,
        colorScale: {
          ranges: [{
            from: -29.99,
            to: 0,
            name: '(-30,0]',
            color: '#053061'
          },
          {
            from: -99.99,
            to: -30,
            name: '(-100,-30]',
            color: '#337CB7'
          },
          {
            from: -199.99,
            to: -100,
            name: '(-200,-100]',
            color: '#8FC2DD'
          },
          {
            from: -299.99,
            to: -200,
            name: '(-300,-200]',
            color: '#F1A385'
          },
          {
            from: -1499.99,
            to: -300,
            name: '(-1500,-300]',
            color: '#C33D3D'
          },
          {
            from: -2500,
            to: -1500,
            name: '(-∞,-1500]',
            color: '#8C0D25'
          }]
        }
      },
    },
    dataLabels: {
      enabled: cellSize > 13,
      style: {
        fontSize: '8px',
      }
    },
    legend: {
      show: true,
    },
    stroke: {
      width: 0.2
    },
    title: {
      text: 'Interpolazione bilineare ' + luxonDateTimeToString(timestamp),
      align: 'center',
      offsetY: 10,
    },
    xaxis: {
      type: 'category',
      categories: heatmapSeries.value[0].data.map(({x,y})=>String(x)),
      tooltip: {
          enabled: false,
      },
      tickPlacement: 'on',
      tickAmount: heatmapSeries.value[0].data.length-1,
      stepSize: heatmapSeries.value[0].data[1].x-heatmapSeries.value[0].data[0].x,
      labels: {
        show: true
      }
    },
    yaxis: {
      axisTicks: {
        show: true,
      },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    tooltip:{
      custom: function({series, seriesIndex, dataPointIndex, w}) {
          return ('<div class="arrow_box m-1">' +
            '<div> <strong>x</strong>: ' + heatmapSeries.value[seriesIndex].data[dataPointIndex].x + '</div>' +
            '<div> <strong>y</strong>: ' + heatmapSeries.value[seriesIndex].name + '</div>' +
            '<div> <strong>val</strong>: ' + series[seriesIndex][dataPointIndex] + '</div>' +
            '</div>')
      }
    }
  }
}

async function mountChart() {
  const parsed = JSON.parse(props.config);

  const chartDataResponse = await communicationService.getChartData(parsed.environment, parsed.paths, parsed.params, endpoint)

  //get dripper position

  if(chartDataResponse) {
    images.value = new Map(chartDataResponse.map(obj => [obj.timestamp, obj.image]))
    showChart.value = images.value.size > 0
    if (showChart.value){
      const timestamps = Array.from(images.value.keys()).sort()
      await drawImage(timestamps[timestamps.length - 1])
    }
  } else {
    showChart.value = false
  }
}
</script>

<template>
  <div v-if="showChart" ref="container">
    <VueApexCharts type="heatmap" :options="chartOptions" :series="heatmapSeries"></VueApexCharts>
  </div>
</template>

<style scoped>

</style>