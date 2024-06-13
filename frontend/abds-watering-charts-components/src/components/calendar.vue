<script setup>
import { nextTick, ref, watchEffect} from 'vue';
import { Qalendar } from 'qalendar';
import {CommunicationService} from "../services/CommunicationService.js";
import { luxonDateTimeToString, luxonDateTimeToStringCalendar } from "../common/dateUtils.js";
import { Modal } from 'bootstrap'

const communicationService = new CommunicationService();
const props = defineProps(['config'])
const getEventsEndpoint = "calendar"
const updateEventEndpoint = "updateWateringEvent"

// Define events as a reactive reference
const events = ref([]);
const selectedEvent = ref(null);
let eventsData = []

// Define config as a reactive reference
const config = ref({
  month: {
    // Hide leading and trailing dates in the month view (defaults to true when not set)
    showTrailingAndLeadingDates: true,
  },
  // Takes any valid locale that the browser understands. However, not all locales have been thorougly tested in Qalendar
  // If no locale is set, the preferred browser locale will be used
  locale: 'it-IT',
  style: {
    // When adding a custom font, please also set the fallback(s) yourself
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
  },
  // if not set, the mode defaults to 'week'. The three available options are 'month', 'week' and 'day'
  // Please note, that only day and month modes are available for the calendar in mobile-sized wrappers (~700px wide or less, depending on your root font-size)
  defaultMode: 'month',
  // The silent flag can be added, to disable the development warnings. This will also bring a slight performance boost
  isSilent: true,
  disableModes: ['week','day']
});

watchEffect(async () => {
  let value = props.config;
  if(value) {
    await mountChart()
  }
});

function colorFunction(event) {
  if(!event.enabled){
    return "red"
  }
  if( event.wateringStart < Date.now()/1000) {
    return "green"
  }
  return "yellow"
}

function titleFunction(event) {
  if(!event.enabled){
    return "Irrigazione disabilitata"
  }
  if( event.wateringStart < Date.now()/1000) {
    return "Irrigazione eseguita"
  }
  return "Irrigazione programmata"
}

async function mountChart(timeFilter) {
  const parsed = JSON.parse(props.config);
  eventsData = []

  if(!timeFilter){
    timeFilter = parsed.params
    timeFilter.timeFilterTo = timeFilter.timeFilterTo + 604800 //one week
  }

  const calendarResponse = await communicationService.getWateringSchedule(parsed.environment, parsed.paths, timeFilter, getEventsEndpoint)

  if(calendarResponse) {
    eventsData = calendarResponse.events
    const eventsCalendar = [] 
    for (const e of eventsData){
      const startDate = luxonDateTimeToStringCalendar(e.wateringStart)
      let endDate
      if(e.wateringEnd){
        endDate = luxonDateTimeToStringCalendar(e.wateringEnd)
      } else {
        endDate = startDate
      }

      const eventDescription = `<p><strong>Durata:</strong> ${e.duration ? e.duration : "Non calcolata"}</p>
      <p><strong>Stato:</strong> ${e.enabled ? "Abilitato" : "Disabilitato"}</span></p>
      <p><strong>Quantità d'acqua attesa:</strong> ${e.expectedWater ? e.expectedWater : 0} L</p>
      <p><strong>Consiglio irriguo:</strong> ${e.advice ? e.advice + "L" : "Non calcolato"} </p>
      ${ e.adviceTimestamp ? "<p><strong>Orario di calcolo:</strong> " + luxonDateTimeToString(e.adviceTimestamp) + "</p>": ""}
      ${e.note ? ("<p><strong>Note:</strong> " + e.note + "</p>") : ""}
      ${ e.wateringStart > Date.now()/1000 ? "<button type=\"button\" class=\"btn btn-primary update-event\" id=" + e.date + ">Modifica</button>":""}`

      const event = { 
        title: titleFunction(e),
        with: e.updatedBy,
        time: { start: startDate, end: endDate},
        color: colorFunction(e),
        isEditable: false,
        id: e.date,
        description: eventDescription
      }
      eventsCalendar.push(event)
    }
    events.value = eventsCalendar
  }
}



function refreshPeriod(p){
  const startTimestamp = new Date(p.start).getTime()/1000
  const endTimestamp = new Date(p.end).getTime()/1000
  mountChart({timeFilterFrom: startTimestamp, timeFilterTo: endTimestamp})
}

let activeModal
async function openModal(eventDate) {
  const target=eventDate.target;
  if(Array.from(target.classList).filter(c=>c==="update-event").length>0){
    selectedEvent.value = eventsData.filter(e=>e.date===target.id)[0]
    updateForm.value = {
      enabled: selectedEvent.value.enabled,
      wateringStartTime: new Date(selectedEvent.value.wateringStart * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expectedWater: selectedEvent.value.expectedWater,
      note: selectedEvent.value.note
    }
    await nextTick()
    activeModal = new Modal('#updateModal')
    activeModal.show()
  }
}

const updateForm = ref({
  enabled: false,
  wateringStartTime: "",
  expectedWater: 0,
  note: ""
})

async function submitForm(){
  const wateringStart = new Date(selectedEvent.value.date +" "+ updateForm.value.wateringStartTime).getTime()/1000
  const updatedEvent = selectedEvent.value
  updatedEvent.enabled = updateForm.value.enabled
  updatedEvent.wateringStart = wateringStart
  const expectedWater = parseFloat(updateForm.value.expectedWater)
  if(!isNaN(expectedWater)){
    updatedEvent.expectedWater = expectedWater
  }
  updatedEvent.note = updateForm.value.note

  const parsed = JSON.parse(props.config);
  await communicationService.updateEvent(parsed.environment, updateEventEndpoint, parsed.paths, updatedEvent)
  await mountChart()
  activeModal.hide()
}

function isValidTime(time){
  const wateringStart = new Date(selectedEvent.value.date +" "+ time)
  return wateringStart > Date.now() + 3600000
}
</script>

<template>
  <Qalendar 
  :events="events"
  :config="config" @updated-period="refreshPeriod" @edit-event="openModal" @click="openModal"/>
  <div v-if="selectedEvent" class="modal fade" id="updateModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-3"> Modifica Evento</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
          <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="row text-center fs-5 p-2"> 
              <div class="col">{{titleFunction(selectedEvent)}} - {{ new Date(selectedEvent.date).toLocaleDateString("it-IT") }}</div>
            </div>
            <div class="form-group row align-items-center p-2 px-4">
              <div class="col-auto form-check form-switch">
                <input type="checkbox" role="switch" class="form-check-input" id="enableEvent" name="enableEvent" v-model="updateForm.enabled">
              </div>
              <div class="col-auto"><label class="form-check-label" for="enableEvent">Abilita evento</label></div>
            </div>
            <div class="form-group row align-items-center p-2">
              <div class="col-auto"><label for="startTime">Ora di Inizio:</label></div>
              <div class="col-auto">
                <input type="time" class="form-control" id="startTime" name="startTime" v-model="updateForm.wateringStartTime" :class="{ 'is-invalid': !isValidTime(updateForm.wateringStartTime) }" required>
                <span v-if="!isValidTime(updateForm.wateringStartTime)" class="text-danger">Ora di inizio non valida</span>
              </div>
              
            </div>
            <div class="form-group row align-items-center p-2">
              <div class="col-auto"><label for="waterAmount">Quantità d'acqua attesa (L):</label></div>
              <div class="col-auto"><input type="number" class="form-control" id="waterAmount" name="waterAmount" min="0" v-model="updateForm.expectedWater"></div>
            </div>
            <div class="form-group row align-items-center p-2">
              <div><label for="note">Note:</label></div>
              <div class="my-2"><textarea class="form-control" id="note" name="note" rows="2" v-model="updateForm.note"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
              <button type="submit" class="btn btn-primary" :disabled="!isValidTime(updateForm.wateringStartTime)">Salva</button>
          </div>
        </form>
      </div>
    </div>  
  </div>

</template>

<style>
@import "qalendar/dist/style.css";
</style>