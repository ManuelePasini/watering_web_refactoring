<script setup>

import '../assets/basebase.css'

import {computed, onMounted, reactive, ref} from "vue";
import {AirTemperatureChart} from "abs-watering-charts-components"
import {DripperAndPluvChart} from "abs-watering-charts-components"
import {WaterAdviceChart} from "abs-watering-charts-components"
import {DeltaChart} from "abs-watering-charts-components"
import {CountorMeanChart} from "abs-watering-charts-components"
import {CountorStdChart} from "abs-watering-charts-components"
import {GroundWaterPotentialChart} from "abs-watering-charts-components"
import {HumidityHeatmap} from "abs-watering-charts-components"
import {HumidityMultiLineChart} from "abs-watering-charts-components"
import {HumidityDynamicHeatmap} from "abs-watering-charts-components"
import {useRouter} from "vue-router";

const router = useRouter()

const props = defineProps(['token', 'userPermissions'])

let showCustomizeInput = ref(false)

let selectedTimestampFrom = ref(0)
let selectedTimestampTo = ref(0)

let customSelectedTimestampTo = ref(getCurrentTimestampMinusDays(0))
let customSelectedTimestampFrom = ref(getCurrentTimestampMinusDays(2))


let selectedFieldName = ref('Select field')
let selectedField = reactive({})
let selectedTimeLabel = ref('')
let showDynamicHeatmap = ref(false)

const propToken = reactive(props.token)
const propUserPermissions = reactive(props.userPermissions)

let connectionParams = {
    environment: {
      host: 'http://localhost:8081/fieldCharts/',
      token: propToken.value
    },
    paths: selectedField.value,
    params: {
      colture: 'Kiwi',
      coltureType: 'G3',
      timeFilterFrom: getCurrentTimestampMinusDays(2),
      timeFilterTo: getCurrentTimestampMinusDays(0)
    }
}

onMounted(async () => {
  if(!props.userPermissions) {
    await router.push('/login')
  }
})

function updateConnectionParams() {
  connectionParams = {
    environment: {
      host: 'http://localhost:8081/fieldCharts/',
      token: propToken.value
    },
    paths: selectedField.value,
    params: {
      colture: 'Kiwi',
      coltureType: 'G3',
      timeFilterFrom: selectedTimestampFrom.value,
      timeFilterTo: selectedTimestampTo.value
    }
  }
}

const selectedDateFrom = computed({
  get: () => {
    const timestamp = customSelectedTimestampFrom.value * 1000;
    return new Date(timestamp).toISOString().slice(0, 10);
  },
  set: (newValue) => {
    customSelectedTimestampFrom.value = Date.parse(newValue) / 1000;
  }
});

const selectedDateTo = computed({
  get: () => {
    const timestamp = customSelectedTimestampTo.value * 1000;
    return new Date(timestamp).toISOString().slice(0, 10);
  },
  set: (newValue) => {
    customSelectedTimestampTo.value = Date.parse(newValue) / 1000;
  }
});

function selectTimestamp(timeFilter) {

  switch (timeFilter) {
    case 'customize_day':
      showCustomizeInput.value = true;
      selectedTimeLabel.value = 'customize_day';
      break;
    case '30_day':
      showCustomizeInput.value = false;
      selectedTimestampFrom.value = getCurrentTimestampMinusDays(30);
      selectedTimeLabel.value = '30_day';
      updateConnectionParams()
      break;
    case '7_day':
      showCustomizeInput.value = false;
      selectedTimestampFrom.value = getCurrentTimestampMinusDays(7);
      selectedTimeLabel.value = '7_day';
      updateConnectionParams()
      break;
    case '1_hour':
      showCustomizeInput.value = false;
      selectedTimestampFrom.value = getCurrentTimestampMinusHours(1);
      selectedTimeLabel.value = '1_hour';
      updateConnectionParams()
      break;
  }

}

function getCurrentTimestampMinusDays(days) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  return Math.floor(currentDate.getTime() / 1000);
}

function getCurrentTimestampMinusHours(hours) {
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - hours);
  return Math.floor(currentDate.getTime() / 1000);
}

function updateCustomTimestamps(){
  selectedTimestampFrom.value = customSelectedTimestampFrom.value
  selectedTimestampTo.value = customSelectedTimestampTo.value
  updateConnectionParams()
}

function selectItem(item) {
  selectedFieldName.value = createFieldName(item)
  selectedField.value = item
  updateConnectionParams()
}

function createFieldName(item) {
  if(!item) return ''
  return `${item.refStructureName}; ${item.companyName}; ${item.fieldName}; Sector: ${item.sectorname}; ${item.thesis}`
}

function isLabelSelected(value) {
  return selectedTimeLabel.value === value
}

function hasUserPermission(permission) {
  if(propUserPermissions && propUserPermissions.value && propUserPermissions.value.permissions) {
    if(propUserPermissions.value.role === 'admin') return true
    if(selectedField.value && Object.keys(selectedField.value).length === 0) return false;
    const keySelected = createFieldName(selectedField.value)
    for(const field of propUserPermissions.value.permissions) {
      const tmpKey = createFieldName(field)
      if(keySelected === tmpKey) {
        return field.permissions.includes(permission)
      }
    }
  }
  return false
}

function enableDynamicHeatmap() {
  showDynamicHeatmap.value = !showDynamicHeatmap.value
}

</script>

<template>

  <div id="monitoring-container" class="container align-top">
    <div class="row" style="margin-top:10px;">
      <div class="col d-flex justify-content-center">
        <div class="btn-group-toggle" data-toggle="buttons">
          <span style="margin-right:10px;">Filtro:</span>
          <label :class="{ active: isLabelSelected('customize_day') }" class="btn btn-sm btn-secondary timefilter">
            <input type="radio" name="timefilter-radio" value="customize_day" autocomplete="off" @click="selectTimestamp('customize_day')">Altro periodo
          </label>
          <label class="btn btn-sm btn-secondary timefilter" :class="{active: isLabelSelected('30_day')}">
            <input type="radio" name="timefilter-radio" value="30_day" autocomplete="off" @click="selectTimestamp('30_day')">Ultimo mese
          </label>
          <label class="btn btn-sm btn-secondary timefilter" :class="{active: isLabelSelected('7_day')}">
            <input type="radio" id="one_week_filter" name="timefilter-radio" value="7_day" autocomplete="off" @click="selectTimestamp('7_day')" checked>Ultima settimana
          </label>
          <label class="btn btn-sm btn-secondary timefilter" :class="{active: isLabelSelected('1_hour')}">
            <input type="radio" name="timefilter-radio" value="1_hour" @click="selectTimestamp('1_hour')" autocomplete="off">Ultime 24h
          </label>
        </div>
      </div>
    </div>
    <div v-if="showCustomizeInput" class="row" id="timeperiod" style="margin-top:10px;">
      <div class="col d-flex justify-content-center">
        <span style="margin-right:10px; margin-left:10px;">Periodo da:</span>
        <input type="date" name="timeperiod_from" v-model="selectedDateFrom">
        <span style="margin-right:10px; margin-left:10px;"> a:</span>
        <input type="date" name="timeperiod_to" v-model="selectedDateTo">
        <div class="btn-group-toggle" data-toggle="buttons">
          <label class="btn btn-sm btn-secondary" style="margin-left:10px;">
            <input type="radio" name="timefilter" value="timefilter_customizesearch_day" @click="updateCustomTimestamps" autocomplete="off"> Cerca
          </label>
        </div>
      </div>
    </div>

    <div v-if="propUserPermissions.value && propUserPermissions.value.permissions" class="dropdown align-top col-md-12">
      <div class="col d-flex justify-content-center">
        <p style="vertical-align: middle; margin-right: 10px">Campo: </p>
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
          {{ selectedFieldName }}
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <li v-for="(item, index) in propUserPermissions.value.permissions" :key="index">
            <a
                class="dropdown-item"
                href="#"
                @click.prevent="selectItem(item)">
               {{createFieldName(item)}}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="hasUserPermission('MO')" class="charts-container container col-md-12">
      <div class="humidity-card card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Matrice dell'umidità</span>
          <button class="btn btn-sm btn-secondary" type="button" @click="enableDynamicHeatmap" id="dynamic-heatmap-button">Mostra evoluzione</button>
        </div>
        <div class="card-body">
          <HumidityMultiLineChart style="height: 300px; width: 700px" :config="JSON.stringify(connectionParams)"></HumidityMultiLineChart>
          <HumidityHeatmap :config="JSON.stringify(connectionParams)"></HumidityHeatmap>
        </div>
      </div>
    </div>

    <div v-if="showDynamicHeatmap" class="charts-container container col-md-12">
      <div class="humidity-card card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Evoluzione matrice dell'umidità</span>
        </div>
        <div class="card-body">
          <div class="dynamic-humidity-map">
            <HumidityDynamicHeatmap v-if="hasUserPermission('MO')" :config="JSON.stringify(connectionParams)"></HumidityDynamicHeatmap>
          </div>
        </div>
      </div>
    </div>


    <div>
      <div v-if="hasUserPermission('MO')" class="charts-container container col-md-12">
        <div class="groundwaterpot-card card">
          <div class="card-header">Potenziale idrico</div>
          <div class="card-body">
            <GroundWaterPotentialChart style="height: 300px" :config="JSON.stringify(connectionParams)"></GroundWaterPotentialChart>
          </div>
        </div>
      </div>
    </div>

    <div >
      <div v-if="hasUserPermission('MO')" class="charts-container container">
        <div class="countors-card card">
          <div class="card-header">Matrici di media e varianza</div>
          <div class="card-body">
                <p>Matrice dell'umidità <strong>media</strong> lungo il periodo:</p><br>
                <CountorMeanChart :config="JSON.stringify(connectionParams)"></CountorMeanChart>
            <p>Matrice di <strong>varianza</strong> dell'umidità lungo il periodo:</p><br>
                <CountorStdChart :config="JSON.stringify(connectionParams)"></CountorStdChart>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div v-if="hasUserPermission('MO')" class="charts-container container col-md-12">
        <div class="airtemperature-card card">
          <div class="card-header">Temperatura dell'aria</div>
          <div class="card-body">
            <AirTemperatureChart style="height: 300px" :config="JSON.stringify(connectionParams)"></AirTemperatureChart>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div v-if="hasUserPermission('MO')" class="charts-container container col-md-12">
        <div class="airtemperature-card card">
          <div class="card-header">Consiglio Irriguo</div>
          <pre style="padding-left: 20px; padding-top: 10px;"><b>Advice</b>, <b>Pluv Curr</b>, <b>Pot Evap</b> espressi in <b>mm</b><br><b>Dripper</b> espresso in <b>L</b></pre>
          <div class="card-body">
            <WaterAdviceChart style="height: 300px; width: 900px" :config="JSON.stringify(connectionParams)"></WaterAdviceChart>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div v-if="hasUserPermission('MO')" class="charts-container container col-md-12">
        <div class="airtemperature-card card">
          <div class="card-header">Irrigazione e Precipitazioni</div>
          <pre style="padding-left: 20px; padding-top: 10px;"><b>Pluv Curr</b> espresso in <b>mm</b><br><b>Dripper</b> espresso in <b>L</b></pre>
          <div class="card-body">
            <DripperAndPluvChart style="height: 300px; width: 900px" :config="JSON.stringify(connectionParams)"></DripperAndPluvChart>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div v-if="hasUserPermission('WA')" class="charts-container container col-md-12">
        <div class="airtemperature-card card">
          <div class="card-header">Potenziale Idrico Ottimale e Potenziale Idrico Medio Giornaliero</div>
          <div class="card-body">
            <DeltaChart style="height: 300px" :config="JSON.stringify(connectionParams)"></DeltaChart>
          </div>
        </div>
      </div>
    </div>

    <div style="visibility: hidden">
      {{selectedTimestampTo}} - {{customSelectedTimestampTo}}
      {{customSelectedTimestampFrom}} - {{selectedTimestampFrom}}
    </div>

  </div>
</template>

<style scoped>

.charts-container {
  margin-top: 10%;
}

input[type=radio] {
  position: absolute;
  clip: rect(0,0,0,0);
  pointer-events: none;
}

.dropdown {
  margin-top: 20px;
}

#monitoring-container{
  margin-top: 100px;
}

.card {
  min-height: 400px;
  min-width: 1000px;
}

.timefilter{
  margin-right: 10px;
}

</style>