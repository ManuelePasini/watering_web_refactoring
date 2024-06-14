<script setup>

import '../assets/basebase.css'

import {computed, onMounted, reactive, ref, watchEffect} from "vue";
import AirTemperatureChart from "../../../abds-watering-charts-components/src/components/airtemperature-chart.ce.vue"
import DripperAndPluvChart from "../../../abds-watering-charts-components/src/components/dripperandpluv-chart.ce.vue"
import WaterAdviceChart from "../../../abds-watering-charts-components/src/components/wateringadv-chart.ce.vue"
import DeltaChart from "../../../abds-watering-charts-components/src/components/delta-chart.ce.vue"
import CountorMeanChart from "../../../abds-watering-charts-components/src/components/countormean-chart.ce.vue"
import CountorStdChart from "../../../abds-watering-charts-components/src/components/countorstd-chart.ce.vue"
import GroundWaterPotentialChart from "../../../abds-watering-charts-components/src/components/groundwaterpot-chart.ce.vue"
import HumidityHeatmap from "../../../abds-watering-charts-components/src/components/humidityheatmap-chart.ce.vue"
import HumidityMultiLineChart from "../../../abds-watering-charts-components/src/components/humiditymultilinear-chart.ce.vue"
import HumidityDynamicHeatmap from "../../../abds-watering-charts-components/src/components/dynamic-heatmap-animator.ce.vue"
import Calendar from "../../../abds-watering-charts-components/src/components/calendar.vue"
import {useRouter} from "vue-router";
import authService from '@/services/auth.service';

const router = useRouter()

const props = defineProps(['token', 'user'])

let showCustomizeInput = ref(false)

let selectedTimestampFrom = ref(getCurrentTimestampMinusDays(7))
let selectedTimestampTo = ref(getCurrentTimestampMinusDays(0))

let customSelectedTimestampTo = ref(getCurrentTimestampMinusDays(0))
let customSelectedTimestampFrom = ref(getCurrentTimestampMinusDays(2))


let selectedFieldName = ref('Select field')
let selectedField = ref({})
let selectedTimeLabel = ref("")
let showDynamicHeatmap = ref(false)
let showDetailedWatering = ref(false)
let detailedWateringButton = ref("Mostra puntuale")

const token = reactive(props.token)
const user = reactive(props.user)
const userPermissions = reactive({})

let connectionParams = {}

onMounted(async () => {
  if(!user) {
    await router.push('/login')
  }
})

watchEffect(()=>{
  if(token.value){
    updateUserPermission()
  }
})

function updateConnectionParams() {
  if(selectedField.value){
    connectionParams = {
    environment: {
      host: 'http://localhost:43080/api',
      token: token.value
    },
    paths: selectedField.value,
    params: {
      colture: selectedField.value.colture,
      coltureType: selectedField.value.coltureType,
      timeFilterFrom: selectedTimestampFrom.value,
      timeFilterTo: selectedTimestampTo.value
    }
  }
  }
}

const selectedDateFrom = computed({
  get: () => {
    const timestamp = customSelectedTimestampFrom.value * 1000;
    return new Date(timestamp).toISOString().slice(0, 10);
  },
  set: (newValue) => {
    if(Date.parse(newValue)){
      customSelectedTimestampFrom.value = Date.parse(newValue) / 1000;
    }
  }
});

const selectedDateTo = computed({
  get: () => {
    const timestamp = customSelectedTimestampTo.value * 1000;
    return new Date(timestamp).toISOString().slice(0, 10);
  },
  set: (newValue) => {
    if(Date.parse(newValue)){
      customSelectedTimestampTo.value = Date.parse(newValue) / 1000;
    }
  }
});

function selectTimePeriod(timeFilter) {

  switch (timeFilter) {
    case 'customize_day':
      showCustomizeInput.value = true;
      selectedTimeLabel.value = 'customize_day';
      break;
    case '30_day':
      showCustomizeInput.value = false;
      selectedTimestampFrom.value = getCurrentTimestampMinusDays(30);
      selectedTimestampTo.value = getCurrentTimestampMinusHours(0)
      selectedTimeLabel.value = '30_day';
      break;
    case '7_day':
      showCustomizeInput.value = false;
      selectedTimestampFrom.value = getCurrentTimestampMinusDays(7);
      selectedTimestampTo.value = getCurrentTimestampMinusHours(0)
      selectedTimeLabel.value = '7_day';
      break;
    case '24_hours':
      showCustomizeInput.value = false;
      selectedTimestampFrom.value = getCurrentTimestampMinusHours(24);
      selectedTimestampTo.value = getCurrentTimestampMinusHours(0)
      selectedTimeLabel.value = '24_hours';
      break;
  }

  if(timeFilter != 'customize_day'){
    updateUserPermission()
    updateConnectionParams()
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
  updateUserPermission()
  updateConnectionParams()
}

function selectItem(item) {
  selectedFieldName.value = createFieldName(item)
  selectedField.value = item
  updateConnectionParams()
}

function createFieldName(item) {
  if(!item) return ''
  return `${item.refStructureName}; ${item.companyName}; ${item.fieldName}; Settore ${item.sectorName}; Tesi ${item.plantRow}; ${item.colture}; ${item.coltureType}`
}

function isLabelSelected(value) {
  return selectedTimeLabel.value === value
}

async function updateUserPermission(){
  if (token.value){
    userPermissions.value = await authService.retrieveUserFieldPermissions(token.value, selectedTimestampFrom.value, selectedTimestampTo.value)
  }
}

function hasUserPermission(permission) {
  if(userPermissions && userPermissions.value && userPermissions.value.permissions) {
    if(!selectedField.value || Object.keys(selectedField.value).length === 0) return false;
    if(userPermissions.value.role === 'admin') return true
    const keySelected = createFieldName(selectedField.value)
    for(const field of userPermissions.value.permissions) {
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

function enableDetailedAggregate() {
  showDetailedWatering.value = !showDetailedWatering.value
  detailedWateringButton.value = showDetailedWatering.value ? "Mostra giornaliero" : "Mostra puntuale"
}

const selectedTimestamp = ref(null)
function selectedTime(time){
  selectedTimestamp.value = time 
}

</script>

<template>

  <div class="container align-top mt-5">
    <div class="row m-2">
      <div class="col d-flex justify-content-center">
        <div class="btn-group-toggle" data-toggle="buttons">
          <span style="margin-right:10px;">Filtro:</span>
          <label :class="{ active: isLabelSelected('customize_day') }" class="btn btn-sm btn-secondary timefilter">
            <input type="radio" name="timefilter-radio" value="customize_day" autocomplete="off" @click="selectTimePeriod('customize_day')">Altro periodo
          </label>
          <label class="btn btn-sm btn-secondary timefilter" :class="{active: isLabelSelected('30_day')}">
            <input type="radio" name="timefilter-radio" value="30_day" autocomplete="off" @click="selectTimePeriod('30_day')">Ultimo mese
          </label>
          <label class="btn btn-sm btn-secondary timefilter" :class="{active: isLabelSelected('7_day')}">
            <input type="radio" id="one_week_filter" name="timefilter-radio" value="7_day" autocomplete="off" @click="selectTimePeriod('7_day')" checked>Ultima settimana
          </label>
          <label class="btn btn-sm btn-secondary timefilter" :class="{active: isLabelSelected('24_hours')}">
            <input type="radio" name="timefilter-radio" value="24_hour" @click="selectTimePeriod('24_hours')" autocomplete="off">Ultime 24h
          </label>
        </div>
      </div>
    </div>
    <div v-if="showCustomizeInput" class="row m-2" id="timeperiod" >
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

    <div v-if="userPermissions.value && userPermissions.value.permissions" class="m-2 align-top col-md-12">
      <div class="col d-flex justify-content-center">
        <p style="vertical-align: middle; margin-right: 10px">Campo: </p>
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
          {{ selectedFieldName }}
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <li v-for="(item, index) in userPermissions.value.permissions" :key="index">
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

    <div v-if="hasUserPermission('MO')" class="m-3 container col-md-12">
      <div class="humidity-card card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Matrice dell'umidità</span>
          <button class="btn btn-sm btn-secondary" type="button" @click="enableDynamicHeatmap" id="dynamic-heatmap-button">Mostra evoluzione</button>
        </div>
        <div class="card-body row">
          <span>Seleziona un istante temporale nel grafico di sinistra per mostrare la relativa matrice di umidità (Con "<strong>G</strong>" 
            si denota la posizione del gocciolatore):</span>
          <div class="col-lg-6 align-content-center">
            <HumidityMultiLineChart style="height: 300px" :config="JSON.stringify(connectionParams)" @selectTimestamp="selectedTime"></HumidityMultiLineChart>
          </div>
          <div class="col-lg-6">
            <HumidityHeatmap :config="JSON.stringify(connectionParams)" :selectedTimestamp="selectedTimestamp"></HumidityHeatmap>
          </div>          
        </div>
      </div>
    </div>

    <div v-if="showDynamicHeatmap" class="m-3 container col-md-12">
      <div class="humidity-card card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Evoluzione matrice dell'umidità</span>
        </div>
          <div class="dynamic-humidity-map">
            <HumidityDynamicHeatmap v-if="hasUserPermission('MO')" :config="JSON.stringify(connectionParams)"></HumidityDynamicHeatmap>
          </div>
      </div>
    </div>

    <div v-if="hasUserPermission('MO')" class="m-3 container col-md-12">
      <div class="groundwaterpot-card card">
        <div class="card-header">Potenziale idrico</div>
        <div class="card-body">
          <GroundWaterPotentialChart style="height: 320px" :config="JSON.stringify(connectionParams)"></GroundWaterPotentialChart>
        </div>
      </div>
    </div>

    <div v-if="hasUserPermission('WA')" class="m-3 container col-md-12">
      <div class="humidity-card card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Calendario Irrigazione</span>
        </div>
          <div class="dynamic-humidity-map">
            <Calendar :config="JSON.stringify(connectionParams)"></Calendar>
          </div>
      </div>
    </div>

    <div v-if="hasUserPermission('MO')" class="m-3 container col-md-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Consiglio Irriguo, Irrigazione e Precipitazioni</span> 
          <button class="btn btn-sm btn-secondary" type="button" @click="enableDetailedAggregate" id="dynamic-heatmap-button">{{ detailedWateringButton }}</button>
        </div>
        <div v-if="!showDetailedWatering">
          <pre style="padding-left: 20px; padding-top: 10px;"><b>Advice</b>, <b>Pluv Curr</b>, <b>Pot Evap</b> espressi in <b>mm</b><br><b>Dripper</b> espresso in <b>L</b></pre>
          <div class="card-body">
            <WaterAdviceChart style="height: 300px" :config="JSON.stringify(connectionParams)"></WaterAdviceChart>
          </div>
        </div>
        <div v-else>
          <pre style="padding-left: 20px; padding-top: 10px;"><b>Pluv Curr</b> espresso in <b>mm</b><br><b>Dripper</b> espresso in <b>L</b></pre>
          <div class="card-body">
            <DripperAndPluvChart style="height: 300px" :config="JSON.stringify(connectionParams)"></DripperAndPluvChart>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasUserPermission('WA')" class="m-3 container col-md-12">
      <div class=" card">
        <div class="card-header">Potenziale Idrico Ottimale e Potenziale Idrico Medio Giornaliero</div>
        <div class="card-body">
          <DeltaChart style="height: 300px" :config="JSON.stringify(connectionParams)"></DeltaChart>
        </div>
      </div>
    </div>

    <div v-if="hasUserPermission('MO')" class="m-3 container">
      <div class="countors-card card">
        <div class="card-header">Matrici di media e varianza</div>
        <div class="card-body row">
          <div class="col-lg-6">
              <p>Matrice dell'umidità <strong>media</strong> lungo il periodo:</p>
              <CountorMeanChart :config="JSON.stringify(connectionParams)"></CountorMeanChart>
          </div>
          <div class="col-lg-6">
            <p>Matrice di <strong>varianza</strong> dell'umidità lungo il periodo:</p>
            <CountorStdChart :config="JSON.stringify(connectionParams)"></CountorStdChart>
          </div>  
        </div>
      </div>
    </div>

    <div v-if="hasUserPermission('MO')" class="m-3 container col-md-12">
      <div class="card">
        <div class="card-header">Temperatura dell'aria</div>
        <div class="card-body">
          <AirTemperatureChart style="height: 300px" :config="JSON.stringify(connectionParams)"></AirTemperatureChart>
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

input[type=radio] {
  position: absolute;
  clip: rect(0,0,0,0);
  pointer-events: none;
}

.timefilter{
  margin-right: 10px;
}

</style>