function customTimeFormat(d1) {
    var timeFormat = "%Y-%m-%e";
    if (d1.includes("month")) {
        timeFormat = "%Y-%m";
    } else if (d1.includes("year")) {
        timeFormat = "%Y";
    } else if (d1.includes("timestamp")) { // in seconds, use d3.timeFormat(".%L") for milliseconds
        timeFormat = "%Y-%m-%d %H:%M:%S";
    }
    /* var formatMillisecond = d3.timeFormat(".%L"),
     *     formatSecond = d3.timeFormat(":%S"),
     *     formatMinute = d3.timeFormat("%I:%M"),
     *     formatHour = d3.timeFormat("%I %p"),
     *     formatDay = d3.timeFormat("%a %d"),
     *     formatWeek = d3.timeFormat("%b %d"),
     *     formatMonth = d3.timeFormat("%B"),
     *     formatYear = d3.timeFormat("%Y"); */
    return timeFormat;
}
/**
 * Draw a muline chart. 1 line for each of columns specified in M
 * Works for the following schema. I.e., for d1 = "x" and M = ["y1", "y2"]
 * [x, y1, y2, ...]
 * [0,  1,  2, ...]
 * [1,  2,  3, ...] 
 */
function drawMultiline(prop, data, d1, M) {
    // set the dimensions and margins of the graph
    var margin = prop.margin, width = prop.width, height = prop.height;

    // parse the date / time
    var timeFormat = customTimeFormat(d1);
    var parseTime = d3.timeParse(timeFormat);
    var miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
    data.forEach(function(d) {
        d["parseTime"] = parseTime(d[d1]);
        miny = Math.min(miny, d[m]);
        maxy = Math.max(maxy, d[m]);
    });

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg object to the body of the page
    var div = d3.select("#my_dataviz").append("div");
    var svg = div
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var lineColor = d3.scaleOrdinal().domain(M).range(greyPalette());

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d["parseTime"]; }));
    y.domain([miny, maxy]);

    var tooltip = createTooltip(div);
    M.forEach(function (m) {
        var valueline = d3.line()
            .x(function(d) { return x(d["parseTime"]); })
            .y(function(d) { return y(d[m]); })
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .style("stroke", function(d) { return lineColor(m); })
            .attr("d", valueline);

        svg.selectAll("line")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return x(d["parseTime"]) })
            .attr("cy", function(d) { return y(d[m]) })
            .attr("datapoint", "colored")
            .attr("r", 4)
            .on("mouseover",  function f (d) { showTooltip(d, tooltip) })
            .on("mousemove",  function f (d) { moveTooltip(d, tooltip) })
            .on("mouseleave", function f (d) { hideTooltip(d, tooltip) });
    });

    appendXaxis(svg, x, height, d3.timeFormat(timeFormat))
    appendXlabel(svg, d1, width, height);
    appendYaxis(svg, y);
    appendLegend(svg, M, width, height, lineColor);
}


/**
 * Draw a muline chart. 1 line for each of the values specified in the column m
 * Works for the following schema. I.e., for d1 = "x" and m = "y", v="value"
 * [x, y, value]
 * [0, A,     1]
 * [0, B,     2]
 * [1, A,     2]
 * [2, B,     1]
 * ... 
 */
function drawMultiline_values(prop, data, d1, m, v) {
    // set the dimensions and margins of the graph
    var margin = prop.margin, width = prop.width, height = prop.height;

    // parse the date / time
    var timeFormat = customTimeFormat(d1);
    var parseTime = d3.timeParse(timeFormat);
    var miny = Number.MAX_VALUE, maxy = Number.MIN_VALUE;
    M = new Set();
    data.forEach(function(d) {
        if (d1.includes("timestamp")) {
            d["parseTime"] = new Date(d[d1] * 1000);
        } else {
            d["parseTime"] = parseTime(d[d1]);
        }
        miny = Math.min(miny, d[v]);
        maxy = Math.max(maxy, d[v]);
        M.add(d[m]);
    });
    M = Array.from(M);

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // append the svg object to the body of the page
    var div = d3.select("#my_dataviz").append("div");
    var svg = div
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var lineColor = d3.scaleOrdinal().domain(M).range(d3.schemeCategory10);

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d["parseTime"]; }));
    y.domain([miny, maxy]);

    var tooltip = createTooltip(div);
    data = _.groupBy(data, function(d) { return d[m]; });
    for (k in data) {
        var valueline = d3.line()
            .x(function(d) { return x(d["parseTime"]); })
            .y(function(d) { return y(d[v]); })
            .curve(d3.curveMonotoneX);
            
        svg.append("path")
            .data([data[k]])
            .attr("class", "line")
            .style("stroke", function(d) { return lineColor(d[0][m]); })
            .attr("d", valueline);

        svg.selectAll("line")
            .data(data[k])
            .enter()
            .append("circle")
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d) { return x(d["parseTime"]) })
            .attr("cy", function(d) { return y(d[v]) })
            .attr("fill", function(d) { return lineColor(d[m]) })
            .attr("r", 2);
            // .on("mouseover",  function f (d) { showTooltip(d, tooltip) })
            // .on("mousemove",  function f (d) { moveTooltip(d, tooltip) })
            // .on("mouseleave", function f (d) { hideTooltip(d, tooltip) });
    }
    appendXaxis(svg, x, height, d3.timeFormat(timeFormat))
    appendXlabel(svg, d1, width, height);
    appendYaxis(svg, y);
    appendYlabel(svg, v, width, height);
    appendLegend(svg, M, width, height, lineColor);
}