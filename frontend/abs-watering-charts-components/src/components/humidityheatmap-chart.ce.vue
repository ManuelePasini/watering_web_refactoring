<script setup>
import * as d3 from "d3";
import {ref, onMounted, watchEffect} from "vue";
import {CommunicationService} from "../services/CommunicationService.js";

const communicationService = new CommunicationService();
const chartRef = ref(null);

const props = defineProps(['config'])
let showChart = ref(true)
const endpoint = 'heatmap'

const isDarkColor = (color) => {
  const rgb = d3.rgb(color);
  const brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255;
  return brightness < 0.5;
}

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
    data.unshift ({
      zz:0,
      yy:0,
      xx:0,
      timestamp:0,
      value:"G"
    })
    showChart.value = data.length > 0
  } else data = []

  const margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 450 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
  const svg = d3.create("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

// Labels of row and columns
  const myGroups = []
  const myVars = []

  data.forEach(data => {
    myGroups.push(data.xx)
    myVars.push(data.yy)
  });

// Build X scales and axis:
  const x = d3.scaleBand()
      .range([0, width])
      .domain(myGroups)
      .padding(0.01);

// Build X scales and axis:
  const y = d3.scaleBand()
      .range([0, height])
      .domain(myVars)
      .padding(0.01);
  
// Build color scale
  const mycolor = function (d) {
    if (d < -10000) {
      return d3.interpolateRdBu(0.0);
    } else if (d < -1500) {
      return d3.interpolateRdBu(0.05);
    } else if (d < -300) {
      return d3.interpolateRdBu(0.15);
    } else if (d < -200) {
      return d3.interpolateRdBu(0.30);
    } else if (d < -100) {
      return d3.interpolateRdBu(0.7);
    } else if (d < -30) {
      return d3.interpolateRdBu(0.85);
    } else return d3.interpolateRdBu(1)
  };

  // add the squares
  const groups = svg.selectAll()
      .data(data, function (d) {
        return d.xx + ':' + d.yy;
      })
      .enter()
      .append("g")

  groups.append("rect")
      .attr("x", function (d) {
        return x(d.xx)
      })
      .attr("y", function (d) {
        return y(d.yy)
      })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return mycolor(d.value)
      });

  groups.append("text")
      .attr("x", function (d) {
        return x(d.xx) + 2;
      })
      .attr("y", function (d) {
        return y(d.yy) + y.bandwidth() / 2;
      })
      .attr("fill", function (d) {
        // Use a contrasting color for text based on the background color
        return isDarkColor(mycolor(d.value)) ? "white" : "black";
      })
      .attr("dy", ".45em")
      .attr("font-size", 10)
      .text(function (d) {
        return d.value === "G" ? d.value : Math.round(d.value * 100) / 100;
      });

  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))

  svg.append("g")
      .call(d3.axisLeft(y));

  chartRef.value.appendChild(svg.node());
}

</script>

<template>
  <div>
    <svg v-if="showChart" style="width: 600px; height: 600px" ref="chartRef"></svg>
    <div v-else>Nessun dato disponibile.</div>
  </div>
</template>

<style scoped>

</style>