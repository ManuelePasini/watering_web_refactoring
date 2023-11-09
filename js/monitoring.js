/** Initialize components on page loading **/
window.onload = function() {
    $("input[type=\"radio\"]:checked").each(function(value) {
        var value = $(this).val().split("_");
        if (value[0] === "timefilter") {
            time_unit = value[2];
            time_filter = getUnixTimestamp(value[1]);
        } else {
            console.log("Did not understand filter on: " + value);
        }
    });

    $("input[type=\"radio\"]").on("click", function(value) {
        var value = $(this).val().split("_");
        if (value[0] === "timefilter") {
            time_unit = value[2];
            time_filter = getUnixTimestamp(value[1]);
        } else {
            console.log("Did not understand filter on: " + value);
        }
        initializeComponents();
    });

    initFields();
}

var resultsId = 'my_dataviz';
var curChart = 0;

var time_unit           = "This is automatically extracted from the time filter";
var time_filter         = "This is automatically extracted from the time filter";
var refStructureName    = "This is automatically extracted from the drop down";
var companyName         = "This is automatically extracted from the drop down";
var fieldName           = "This is automatically extracted from the drop down";
var plantNum            = "This is automatically extracted from the drop down";
var plantRow            = "This is automatically extracted from the drop down";
var colture             = "This is automatically extracted from the drop down";
var coltureType         = "This is automatically extracted from the drop down";

var grndWaterChartProps             = { "id": "gw", "chartTitle": "Potenziale idrico", "chartType": "line", "enableHidden": true, "labelX": "Tempo", "labelY": "cbar", "x": "timestamp", "y": "value", "m": "detectedValueTypeDescription" };
var dripperAndPluvCurrChartProps    = { "id": "d_pc", "chartTitle": "Irrigazione e Precipitazioni", "chartType": "line", "labelX": "Tempo", "labelY1": "L", "labelY2": "mm", "doubleY": true, "x": "timestamp", "y": "value", "m": "detectedValueTypeDescription" };
var airTempChartProps               = { "id": "at", "chartTitle": "Temperatura dell'aria", "chartType": "line", "labelX": "Tempo", "labelY": "°C", "x": "timestamp", "y": "value", "m": "detectedValueTypeDescription" };
var grndTempChartProps              = { "id": "gt", "chartTitle": "Temperatura del terreno", "chartType": "line", "labelX": "Tempo", "labelY": "°C", "x": "timestamp", "y": "value", "m": "detectedValueTypeDescription" };
var electCondProps                = { "id": "ec", "chartTitle": "Fertilizzazione", "chartType": "line", "labelX": "Tempo", "labelY": "N (ppm)", "x": "timestamp", "y": "value", "m": "detectedValueTypeDescription" };
var umidityBinsChartProps           = { "id": "ub", "chartTitle": "Matrice dell'umidita'", "chartType": "line", "umidity": true, "labelX": "Tempo", "labelY": "#Celle", "x": "timestamp", "y": "count", "m": "umidity_bin" };

function initializeComponents() {
    $("#" + resultsId).empty();
    $('#' + resultsId).append('<div id=\"ub\"></div><div id=\"gw\"></div><div id=\"ec\"></div><div id=\"gt\"></div><div id=\"at\"></div><div id=\"d_pc\"></div>');

    initLineChart("php/getDataOriginal_gw.php", grndWaterChartProps)
        .then(initLineChart("php/getDataOriginal_d_pc.php", dripperAndPluvCurrChartProps))
        .then(initLineChart("php/getDataOriginal_at.php", airTempChartProps))
        .then(initLineChart("php/getDataOriginal_gt.php", grndTempChartProps))
        .then(initLineChart("php/getDataOriginal_ec.php", electCondProps))
        .then(initBins(umidityBinsChartProps));
}

function getUnixTimestamp(subtractDay, jsDate) { 
    var d = jsDate ? jsDate : new Date(); // new Date("May 04, 2020 13:00:00");
    if (subtractDay) { d.setDate(d.getDate() - subtractDay) }
    return Math.round(d.getTime() / 1000); 
}
function getBinId(d) { return (d["refStructureName"] + "_" + d["companyName"] + "_" + d["fieldName"] + "_" + d["plantNum"] + "_" + d["plantRow"] + "_" + d["timestamp"] + "_" + d["umidity_bin"]).replace(/\./g, "").replace(/\s/g, "") }
function getStringId(d) { return d["refStructureName"] + "; " + d["companyName"] + "; " + d["fieldName"] + "; Installazione " + d["plantNum"] + "; Fila " + d["plantRow"] + "; " + d["colture"] + "; " + d["coltureType"] + "; "}

// function getId(d) { return (d["refStructureName"] + "_" + d["companyName"] + "_" + d["fieldName"]).replace(/\./g, "").replace(/\s/g, "") }
// function getIdFromKey(key) { return key.replace(/; /g, "_").replace(/\./g, "").replace(/\s/g, "") }

/**
 * Init dropdown with fields visible to the logged user
 * @returns {*}
 */
function initFields() {
    $.ajax({
        data: {
            userId: loggedUserId,
        },
        type: 'post',
        url: "php/getFields.php",
        error: function(e){
            console.log(e);
        },
        success: function(data) {
            var jsonData = JSON.parse(data);
            function update(d) {
                $('#dropdownMenuButton').text(d);
                d = d.split("; ");
                refStructureName = d[0];
                companyName = d[1];
                fieldName = d[2];
                plantNum = parseInt(d[3].replace("Installazione ", ""));
                plantRow = d[4].replace("Fila ", "");
                colture = d[5];
                coltureType = d[6];
            }
            var dropdown = $("#dropdown_fields");
            var first = true;
            for (key in jsonData) {
                var d = getStringId(jsonData[key]);
                dropdown.append("<a class=\"dropdown-item \" href=\"#\">" + d + "</a>");
                if (first) { update(d); }
                first = false;
            }
            if(Object.keys(jsonAdvice).length !== 0){
                var foundEqual = false;
                for (key in jsonData) {
                    if(_.isEqual(jsonData[key], jsonAdvice)){
                        foundEqual = true;
                        break;
                    }
                }
                foundEqual ? update(getStringId(jsonAdvice)) : console.error("Selected object not found in list")
            }
            jsonAdvice = {};

            // $(".dropdown").on('click', '.dropdown-menu a', function () {
            $('#dropdown_fields a').on('click', function() {
                console.log("Selected: " + $(this).text())
                update($(this).text());
                initializeComponents();
            });
            initializeComponents();
        }
    });
}

/**
 * Init simple line chart with data retrieved from the query and given chartProps
 * @param phpPage containing database query
 * @param chartProps chart properties
 * @returns {*}
 */
function initLineChart(phpPage, chartProps) {
    return $.getJSON(
        phpPage,
        { time_filter: time_filter, refStructureName: refStructureName, companyName: companyName, fieldName: fieldName,
            plantRow: plantRow, plantNum: plantNum, colture: colture, coltureType: coltureType },
        function(data) {
            var outerDiv = $("<div class=\"card abds-card\" style=\"margin-bottom:10px;\"></div>");
            $('#' + chartProps["id"]).append(outerDiv);
            outerDiv.append("<div class=\"card-header d-flex\"><h5 class=\"card-title flex-fill\">" + chartProps["chartTitle"] + "</h5></div>");
            console.log("Ground Water record num: " + data.length)
            if(data.length === 0){
                outerDiv.append("<div class=\"card-body\">No data is available.</div>");
            }else{
                prop = {};
                prop = chartProps;
                prop["appendDiv"] = outerDiv;
                prop["metadata"] = {
                    "refStructureName": data[0]["refStructureName"],
                    "companyName": data[0]["companyName"],
                    "fieldName": data[0]["fieldName"],
                    "plantNum": data[0]["plantNum"],
                    "plantRow": data[0]["plantRow"],
                    "colture": data[0]["colture"],
                    "coltureType": data[0]["coltureType"],
                };
                lineChart(data, prop);
            }
        }
    );
}

function initBins(chartProps) {
    return $.getJSON("php/getUmidityBins.php", 
        { time_filter: time_filter, refStructureName: refStructureName, companyName: companyName, fieldName: fieldName, plantRow: plantRow, plantNum: plantNum },
        function(data) {
            var outerDiv = $("<div class=\"card abds-card\" style=\"margin-bottom:10px;\"></div>");
            $('#' + chartProps["id"]).append(outerDiv);
            outerDiv.append("<div class=\"card-header d-flex\"><h5 class=\"card-title flex-fill\">" + chartProps["chartTitle"] + "</h5></div>");
            if(data.length === 0){
                outerDiv.append("<div class=\"card-body\">No data is available.</div>");
            }else{
                outerDiv.append("<div class=\"card-body\">Click on chart to show the soil slice:</div>");
                ddata =  _.groupBy(data, function(d) { return d["is_top"] + "; " + d["is_left"]});
                var rowDiv = $("<div class=\"row justify-content-center align-content-center\"></div>");
                outerDiv.append(rowDiv);
                // Top / Left, Top / Right, Bot / Left, Bot / Right
                /*for (kkey in ddata) {
                    var innerDiv = $("<div class=\"col-12 col-md-6\"></div>");
                    rowDiv.append(innerDiv);
                    prop = {};
                    prop = chartProps;
                    prop["title"] = kkey;
                    prop["appendDiv"] = innerDiv;
                    prop["appendDiv2"] = rowDiv;
                    prop["metadata"] = {
                        "refStructureName": data[0]["refStructureName"],
                        "companyName": data[0]["companyName"],
                        "fieldName": data[0]["fieldName"],
                        "plantNum": data[0]["plantNum"],
                        "plantRow": data[0]["plantRow"],
                        "colture": data[0]["colture"],
                        "coltureType": data[0]["coltureType"],
                    };
                    lineChart(ddata[kkey], prop);
                }*/
                // ALL chart
                //var innerDiv = $("<div class=\"col-12 col-md-12\"></div>");
                //var title = $("<div class=\"col-12 col-md-6\">Click on chart to show soil slice</div>");
                var innerDiv = $("<div class=\"col-12 col-md-6\"></div>");
                //rowDiv.append(title);
                rowDiv.append(innerDiv);
                prop = {};
                prop = chartProps;
                prop["title"] = "All";
                prop["appendDiv"] = innerDiv;
                prop["appendDiv2"] = rowDiv;
                prop["metadata"] = {
                    "refStructureName": data[0]["refStructureName"],
                    "companyName": data[0]["companyName"],
                    "fieldName": data[0]["fieldName"],
                    "plantNum": data[0]["plantNum"],
                    "plantRow": data[0]["plantRow"],
                    "colture": data[0]["colture"],
                    "coltureType": data[0]["coltureType"],
                };
                result = [];
                data.reduce(function(res, d) {
                    var id = getBinId(d);
                    if (!res[id]) {
                        res[id] = { refStructureName: d["refStructureName"], companyName: d["companyName"], fieldName: d["fieldName"],
                            plantNum: d["plantNum"], plantRow: d["plantRow"], colture: d["colture"], coltureType: d["coltureType"],
                            timestamp: d["timestamp"], umidity_bin: d["umidity_bin"], count: 0 };
                        result.push(res[id])
                    }
                    res[id].count += Number(d["count"]);
                    return res;
                }, {});
                lineChart(result, prop);
            }
    });
}

function lineChart(data, prop) {

    var x = prop["x"];
    var y = prop["y"];
    var m = prop["m"];

    // Create canvas
    var canvasId = "canvas" + curChart++;
    prop["appendDiv"].append("<div class=\"card-body\"><canvas id='" + canvasId + "'></canvas></div>");

    var datasetNames;
    if (prop["umidity"]){
        datasetNames = ["(-1000000, -10000]", "(-10000, -1500]", "(-1500, -300]", "(-300, -100]", "(-100, -30]", "(-30, 0]"];
    }else{
        // Find all datasets in the chart
        datasetNames = data
            .map(item => item[m].trim())
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort();
    }
    // Initialize array that contains all series to be plotted (e.g., all lines)
    var datasets = [];
    const mycolor = function(d) { 
        if (d.includes(", 0]")) {
            return d3.interpolateRdBu(1);  
        } else if (d.includes(", -30]")) {
            return d3.interpolateRdBu(0.80);
        } else if (d.includes(", -100]")) {
            return d3.interpolateRdBu(0.30);
        } else if (d.includes(", -300]")) {
            return d3.interpolateRdBu(0.15);
        } else if (d.includes(", -1500]")) {
            return d3.interpolateRdBu(0.05);
        } else return d3.interpolateRdBu(0)
    };

    var colorFunction = prop["umidity"] ? mycolor : d3.scaleOrdinal(d3.schemeCategory20);

    console.log(datasetNames);
    datasetNames.forEach(function(name, ix) {
        var cfg = {
            label: name,
            data: [],
            fill: false,
            backgroundColor: colorFunction(name),
            borderColor: colorFunction(name),
            pointRadius: 1,
            pointHoverRadius: 4,
            hidden: prop["enableHidden"] ? (fieldName === 'Fondo PROGETTO_1' || fieldName === 'Fondo PROGETTO_2') && !(name.includes("v20 >0") || name.includes("v20 >30")) : false
        };
        if(prop["doubleY"])
            cfg['yAxisID'] = name;
        datasets.push(cfg);
    });

    var ys = {}
    data.forEach(function(el) {
        var val = Math.round(parseFloat(el[y]) * 100) / 100;
        ys[el[x]] = val;
        var p = { x: moment(el[x] * 1000).locale("it"), y: val }
        datasets.filter(function(ds) { return ds.label == el[m].trim(); })[0].data.push(p);
    });

    // Set Chart.js conf
    var config = {
        type: prop["chartType"],
        data: {
            datasets: [] // To be added later
        },
        options: {
            onClick: function (evt) {
                var el = this.getElementAtEvent(evt)[0];
                if (!el) { return; }
                // console.log(el);
                // console.log(el._chart);
                // console.log(el._chart.data);
                // console.log(el._chart.data.datasets[el._datasetIndex]) // dataset
                // console.log(el._chart.data.datasets[el._datasetIndex].data[el._index].x._i / 1000) // x
                // console.log(el._chart.data.datasets[el._datasetIndex].data[el._index].y) // y
                //var date = el._chart.data.datasets[el._datasetIndex].data[el._index].x;
                var x =    el._chart.data.datasets[el._datasetIndex].data[el._index].x._i / 1000;
                getDataInterpolated(prop, x);
            },
            responsive: true,
            title: {
                display: typeof prop["title"] === "undefined" ? false : true,
                text: prop["title"]
            },
            tooltips: {
                mode: 'index',
                intersect: true,
            },
            /*hover: {
                mode: 'nearest',
                intersect: true
            },*/
            scales: {
                xAxes: [{
                    display: true,
                    type: 'time',
                    // The distribution property controls the data distribution along the scale:
                    //   - 'linear': data are spread according to their time (distances can vary)
                    //   - 'series': data are spread at the same distance from each other
                    distribution: 'linear', 
                    time: {
                        unit: time_unit,
                        isoWeekday: true, // lun o dom come inizio settimana
                        // how different time units are displayed
                        displayFormats: {
                            second: 'DD/MM/YYYY HH:mm:SS',
                            minute: 'DD/MM/YYYY HH:mm:SS',
                            hour: 'DD/MM/YYYY HH:mm:SS',
                            day: 'DD/MM/YYYY',
                            month: 'MM/YYYY',
                            year: 'YYYY'
                        },
                        tooltipFormat: 'DD/MM/YYYY HH:mm:SS',
                        // parser: 'DD/MM/YYYY HH:mm:SS' // function(date) { return date; // 'DD/MM/YYYY HH:mm:SS' }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: prop["labelX"]
                    }
                }],
                yAxes: 
                    (prop["doubleY"] 
                    ? [
                        { display: true, id: datasetNames[0], type: 'linear', position: 'left',  scaleLabel: { display: true, labelString: prop["labelY1"] } },
                        { display: true, id: datasetNames[1], type: 'linear', position: 'right', scaleLabel: { display: true, labelString: prop["labelY2"] }, gridLines: { drawOnChartArea: false } }
                    ]
                    : [{ display: true, scaleLabel: { display: true, labelString: prop["labelY"] }, stacked: !!prop["umidity"] }])
            },
            legend: {
                display: true,
                labels: {
                    boxWidth: 1
                }
            },
            plugins: {
                filler: {
                    propagate: !!prop["umidity"]
                }
            }
        }
    };

    if(prop["umidity"]){
        for (i = 0; i < datasets.length; i++) {
                i === 0 ? datasets[i].fill = 'origin' : datasets[i].fill = i-1;
        }
    }

    datasets.forEach(function(ds){
        config.data.datasets.push(ds);
    });

    // Show the chart
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    currentChart = new Chart(ctx, config)
    currentChart["mymetadata"] = prop["metadata"];
    $(canvas).show();

    if(prop["umidity"]){
        var maxTimestamp = 0;
        data.forEach(function(d){
            maxTimestamp = d.timestamp > maxTimestamp ? d.timestamp : maxTimestamp;
        });
        getDataInterpolated(prop, maxTimestamp);
    }
}

function getDataInterpolated(prop, timestamp){
    var date = moment(timestamp * 1000)
    $.getJSON("php/getDataInterpolated.php",
        {
            "refStructureName":  refStructureName,
            "companyName": companyName,
            "fieldName": fieldName,
            "plantNum": plantNum,
            "plantRow": plantRow,
            "timestamp": timestamp
        },
        function(data) {
            $(".heatmap").remove();
            var pprop = {}
            pprop["margin"]      = {top: 30, right: 30, bottom: 100, left: 100};
            pprop["width"]       = 550 - pprop["margin"]["left"] - pprop["margin"]["right"];
            pprop["height"]      = 350 - pprop["margin"]["top"] - pprop["margin"]["bottom"];

            /*div = $("<div class=\"heatmap\ col-12 col-md-6\" id=\"heatmap0\"></div>")
            prop["appendDiv2"].append(div);
            pprop["appendId"] = "heatmap0";
            pprop["title"]       = "Original (" + x + ") " + date.format('DD/MM/YYYY HH:mm:SS'),
            drawHeatmap(pprop, data, "xx", "yy", "value_original");

            div = $("<div class=\"heatmap col-12 col-md-6\" id=\"heatmap2\"></div>")
            prop["appendDiv2"].append(div);
            pprop["appendId"] = "heatmap2";
            pprop["title"]       = "Bil. 4 sensori (" + x + ") " + date.format('DD/MM/YYYY HH:mm:SS'),
            drawHeatmap(pprop, data, "xx", "yy", "value_bilinear_frame");*/

            div = $("<div class=\"heatmap col-12 col-md-6 justify-content-center align-content-center\" id=\"heatmap3\"></div>")
            prop["appendDiv2"].append(div);
            pprop["appendId"] = "heatmap3";
            //pprop["title"]       = "Bilinear interpolation (" + x + ") " + date.format('DD/MM/YYYY HH:mm:SS'),
            pprop["title"]       = "Interpolazione bilineare " + date.format('DD/MM/YYYY HH:mm:SS'),
                drawHeatmap(pprop, data, "xx", "yy", "value_bilinear_cell");
        });
}
