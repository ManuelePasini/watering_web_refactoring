<script setup>
import { ref, watchEffect, onMounted} from 'vue';
import { Qalendar } from 'qalendar';
import {CommunicationService} from "../services/CommunicationService.js";
import { luxonDateTime, luxonDateTimeToString, luxonDateTimeToStringCalendar } from "../common/dateUtils.js";

const communicationService = new CommunicationService();
const props = defineProps(['config'])
const calendar = ref(null)
const endpoint = "calendar"

// Define events as a reactive reference
const events = ref([
  {
    title: "Advanced algebra",
    with: "Chandler Bing",
    time: { start: "2024-06-06 12:05", end: "2024-06-06 12:05" },
    color: "yellow",
    isEditable: true,
    id: "753944708f0f", 
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores assumenda corporis doloremque et expedita molestias necessitatibus quam quas temporibus veritatis. Deserunt excepturi illum nobis perferendis praesentium repudiandae saepe sapiente voluptatem!"
  }
  // Add more events as needed
]);

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
  let eventsData = []

  if(!timeFilter){
    timeFilter = parsed.params
  }

  const calendarResponse = await communicationService.getWateringSchedule(parsed.environment, parsed.paths, timeFilter, endpoint)

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
      ${e.note ? ("<p><strong>Note:</strong>" + e.note + "</p>") : ""}`

      const event = {
        title: titleFunction(e),
        with: e.updatedBy,
        time: { start: startDate, end: endDate},
        color: colorFunction(e),
        isEditable: (e.wateringStart > Date.now()/1000 + 5400 ),
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
</script>

<template>
  <Qalendar 
  :events="events"
  :config="config" @updated-period="refreshPeriod"/>
</template>

<style>
@import "qalendar/dist/style.css";
</style>