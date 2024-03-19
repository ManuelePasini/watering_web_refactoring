<script setup>

import '../assets/animator.css'

import {ref, onMounted, watch, reactive, watchEffect} from 'vue';
import GenericLinearChart from "./generic-linechart.ce.vue";
import DynamicHumidityHeatmap from "./dynamic-heatmap.ce.vue";
import {CommunicationService} from "../services/CommunicationService.js";

const buttonTexts = {
  start: 'Start',
  resume: 'Resume',
  stop: 'Stop'
}

const props = defineProps(['config'])

let animatorConfig = reactive({})

const communicationService = new CommunicationService();
const endpoint = 'humidityBins'

let data = ref([]);
let timestamps = ref(new Set());
let currentTimestamp = ref('');
let currentIndex = ref(0);
let interval = ref(null);
let animationSpeed = ref(300);
let isPlaying = ref(false);
let buttonText = ref(buttonTexts.start);
let currentDate = ref('');

function updateConfig(newTimestamp) {
  const parsedConfigProp = JSON.parse(props.config);
  animatorConfig = JSON.stringify({
    environment: parsedConfigProp.environment,
    paths: parsedConfigProp.paths,
    params: {
      colture: 'Kiwi',
      coltureType: 'G3',
      timeFilterFrom: newTimestamp.toString(),
      timeFilterTo: newTimestamp.toString()
    }
  })
}

async function calculateTimestampLength() {
  const parsed = JSON.parse(props.config);
  const chartDataResponse = await communicationService.getChartData(parsed.environment, parsed.paths, parsed.params, endpoint)
  if(chartDataResponse) {
    data.value = chartDataResponse
    timestamps.value = new Set()
  } else {
    data.value = []
  }

  data.value.forEach(d => {
    timestamps.value.add(d.timestamp);
  });
}

function startLoop() {
  interval.value = setInterval(() => {
    const timestampsArray = Array.from(timestamps.value);
    currentTimestamp.value = timestampsArray[currentIndex.value];
    currentIndex.value = (currentIndex.value + 1) % timestampsArray.length;
    currentDate.value = new Date(currentTimestamp.value * 1000).toLocaleDateString('it-IT')
    updateConfig(currentTimestamp.value)
    if(currentIndex.value + 1 === timestamps.value.size) {
      stopLoop()
      reset()
    }
  }, animationSpeed.value);
}

function stopLoop() {
  clearInterval(interval.value);
  interval.value = null;
  isPlaying.value = false;
}

function reset() {
  clearInterval(interval.value)
  isPlaying.value = false
  interval.value = null
  currentIndex.value = 0
  currentTimestamp.value = ''
  currentDate.value = ''
  buttonText.value = buttonTexts.start
}

function onClickPlayButton() {
  isPlaying.value = !isPlaying.value;
  buttonText.value = isPlaying.value ? buttonTexts.stop : currentIndex.value > 0 ? buttonTexts.resume : buttonTexts.start ;
  isPlaying.value ? startLoop() : stopLoop();
}

function changeAnimationSpeed(value) {
  if (isPlaying.value) {
    stopLoop();
    animationSpeed.value = value;
    buttonText.value = currentIndex.value > 0 ? buttonTexts.resume : buttonTexts.start
  } else {
    animationSpeed.value = value;
  }
}

function selectTimestamp(index) {
  currentIndex.value = index;
  currentTimestamp.value = Array.from(timestamps.value)[currentIndex.value];
  currentDate.value = new Date(currentTimestamp.value * 1000).toLocaleDateString('it-IT');
  stopLoop()
}

function getLeftOffset(dataLen, index) {
  return 100 / (dataLen - 1) * index;
}

onMounted(async () => {
  var parsedConfig = JSON.parse(props.config)
  await calculateTimestampLength();
  updateConfig(parsedConfig.params.timeFilterFrom)
  console.log(`Timestamp: ${timestamps}`)
});

watchEffect(async () => {
  var parsedConfig = JSON.parse(props.config)
  await calculateTimestampLength();
  console.log(`TIMESTAMPS ${Array.from(timestamps.value)}`)
  updateConfig(parsedConfig.params.timeFilterFrom)
});

</script>

<template>
  <div class="card">
    <div class="card-body">

      <div class="timeline-placeholder">
        <div class="timeline-wrapper">
          <button id="dynamic-heatmap-play-button" @click="onClickPlayButton">{{ buttonText }}</button>
          <div class="heatmap-timeline">
            <div v-for="(timestamp, index) in Array.from(timestamps)"
                 :key="timestamp"
                 class="time-point"
                 :class="{ 'active': currentIndex === index }"
                 @click="selectTimestamp(index)"
                 :style="{ left: getLeftOffset(timestamps.size, index) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="charts-wrapper row">
        <div class="heatmap-dataviz col-6">
          <dynamic-humidity-heatmap style="margin-left: -10px" :config="animatorConfig"></dynamic-humidity-heatmap>
        </div>
        <div class="col-1"><p></p></div>
        <div class="line_charts col-5">
          <generic-linear-chart style="height: 200px" :config="animatorConfig" :endpoint="'dripper'" :yTitle="'liter'" :label="'Dripper'" :color="'rgb(31, 119, 180)'"></generic-linear-chart>
          <generic-linear-chart style="height: 200px" :config="animatorConfig" :endpoint="'pluv'" :yTitle="'liter'"  :label="'Pluv'" :color="'rgb(31, 119, 180)'"></generic-linear-chart>
        </div>
      </div>

      <div class="row animator-controllers justify-content-end">
        <div class="col-auto">
          <button type="button" class="btn btn-secondary" @click="changeAnimationSpeed(500)">Bassa</button>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-secondary" @click="changeAnimationSpeed(300)">Media</button>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-secondary" @click="changeAnimationSpeed(100)">Veloce</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>