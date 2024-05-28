<script setup>
import * as d3 from "d3";
import {ref, onMounted, watchEffect} from "vue";
import {average, groupBy} from "../common/appUtils.js";
import {CommunicationService} from "../services/CommunicationService.js";

const communicationService = new CommunicationService();
const chartRef = ref(null);

const props = defineProps(['config'])
const endpoint = 'statisticsChart'
const showChart = ref(false)

onMounted(async () => {
  console.log("On mounted called");
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

  let width = 500
  let height = 250
  let margin = {top: 20, bottom: 20, left: 50, right: 60}

  let axisX = [];
  let axisY = [];
  let mean = [];

  const Z = data.map(d => d.zz);
  const z_unique = [...new Set(Z)];

  if (z_unique.length <= 2) {
    data.forEach(d => {
      axisX.push(d.yy * -1)
      axisY.push(d.xx)
      mean.push(d.mean)
    });
  } else {
    const dataTemp = groupBy(data, t => t.yy);
    for (const [key, value] of Object.entries(dataTemp)) {
      let dataTemp2 = groupBy(value, e => e.xx)
      for (const [key2, value2] of Object.entries(dataTemp2)) {
        let means_to_mean = []
        let temp_y, temp_x
        dataTemp2.forEach(d => {
          means_to_mean.push(parseFloat(d.mean))
          temp_y = d.xx;
          temp_x = d.yy;
        });
        axisX.push(temp_y * -1)
        axisY.push(temp_x)
        mean.push(average(means_to_mean))
      }
    }
  }

  const numCellInWidth = ((Math.max(...axisX) - Math.min(...axisX)) / 5) + 1
  const numCellInHeight = (((Math.min(...axisY) * -1) - (Math.max(...axisY) * -1)) / 5) + 1

  let svg = d3.create("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + (margin.left + 30) + "," + margin.top + ")");

  width -= 65
  height -= 20

  let x = d3.scaleLinear()
      .domain([Math.min(...axisY), Math.max(...axisY)])
      .range([ 0, width]);
  svg.append("g").attr("transform", "translate(0," + height+ ")").call(d3.axisBottom(x));

  let y = d3.scaleLinear()
      .domain([Math.max(...axisX), Math.min(...axisX)])
      .range([0, height]);
  svg.append("g").call(d3.axisLeft(y));

  const contours = d3.contours().size([numCellInHeight, numCellInWidth]).thresholds(d3.range(-200, 10000));

  const mycolor = function (d) {
    if (d <= 30) {
      return d3.interpolateRdBu(1);
    } else if (d <= 100) {
      return d3.interpolateRdBu(0.80);
    } else if (d <= 200) {
      return d3.interpolateRdBu(0.70);
    } else if (d <= 300) {
      return d3.interpolateRdBu(0.30);
    } else if (d <= 1500) {
      return d3.interpolateRdBu(0.15);
    } else if (d <= 10000) {
      return d3.interpolateRdBu(0.05);
    } else return d3.interpolateRdBu(0)
  };

  svg.selectAll("path")
      .data(contours(mean))
      .enter().append("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(height / numCellInWidth)))
      .attr("fill", function (d) {return mycolor(d.value);});

  const ticks2 = [30, 100, 200, 300, 1500, 10000];
  const ticksLabels2 = ["[0, -30)", "[-30, -100)", "[-100, -200)", "[-200, -300)", "[-300, -1500)", "[-1500, -∞)"];

  width += 50
  var size = 20

  svg.selectAll("mydots")
      .data(ticks2)
      .enter()
      .append("rect")
      .attr("x", width)
      .attr("y", function (d, i) {
        return height / 4 + i * (size + 5)
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {return mycolor(d)})

  svg.selectAll("mylabels")
      .data(ticksLabels2)
      .enter()
      .append("text")
      .attr("x", width + size)
      .attr("y", function (d, i) {return height / 4 + i * (size + 7) + (size / 2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function (d, i) {return mycolor(ticks2[i])})
      .text(function (d) {return d})
      .attr("text-anchor", "left")
      .attr("font-size", 10)
      .style("alignment-baseline", "middle")

  svg.append("text")
      .attr("transform", "translate(" + ((width / 2) - margin.left * 1.15) + " ," + (height + margin.bottom + 20) + ")")
      .style("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Across the rows");

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left - 30)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Depth");

  if(chartRef.value) {
    chartRef.value.replaceChildren(svg.node());
  }
}

</script>

<template>
  <div>
    <svg  v-if="showChart" style="width: 700px; height: 350px" ref="chartRef"></svg>
    <div v-else>Nessun dato disponibile.</div>
  </div>
</template>

<style scoped>

</style>