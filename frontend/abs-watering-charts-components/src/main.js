import DeltaChart from './components/delta-chart.ce.vue'
import AirtemperatureChart from "./components/airtemperature-chart.ce.vue";
import MeanCountor from "./components/countormean-chart.ce.vue";
import StdCountor from "./components/countorstd-chart.ce.vue";
import DripperAndPluvChart from "./components/dripperandpluv-chart.ce.vue"
import GroundWaterPotentialChart from "./components/groundwaterpot-chart.ce.vue"
import HumidityHeatmap from "./components/humidityheatmap-chart.ce.vue"
import HumidityMultiLineChart from "./components/humiditymultilinear-chart.ce.vue"
import DynamicHeatmapAnimation from './components/dynamic-heatmap-animator.ce.vue'

import {defineCustomElement} from "vue";

const deltaChart = defineCustomElement(DeltaChart);
const airTempChart = defineCustomElement(AirtemperatureChart)
const meanCountorChart = defineCustomElement(MeanCountor)
const stdCountorChart = defineCustomElement(StdCountor)
const dripperAndPluvChart = defineCustomElement(DripperAndPluvChart)
const groundWaterPotentialChart = defineCustomElement(GroundWaterPotentialChart)
const humidityHeatMap = defineCustomElement(HumidityHeatmap)
const humidityMultiLineChart = defineCustomElement(HumidityMultiLineChart)
const dynamicHeatmapAnimation = defineCustomElement(DynamicHeatmapAnimation)

customElements.define("delta-chart", deltaChart);
customElements.define("airtemperature-chart", airTempChart);
customElements.define("meancountor-chart", meanCountorChart);
customElements.define("stdcountor-chart", stdCountorChart);
customElements.define("dripperandpluv-chart", dripperAndPluvChart);
customElements.define("groundwaterpot-chart", groundWaterPotentialChart);
customElements.define("humiditymap-chart", humidityHeatMap);
customElements.define("humiditymultiline-chart", humidityMultiLineChart);
customElements.define("heatmap-animation", dynamicHeatmapAnimation);