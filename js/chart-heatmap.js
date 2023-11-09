function drawHeatmap(prop, data, d1, d2, c) {
    // Labels of row and columns
    var X = []; // ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    var Y = []; // ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]
    var minc = Number.MAX_VALUE, maxc = Number.MIN_VALUE;
    data.forEach(function(d) {
        X.push(d[d1]);
        Y.push(d[d2]);
        minc = Math.min(minc, d[c]);
        maxc = Math.max(maxc, d[c]);
    });

    const ticks =       [-30, -100, -300, -1500, -10000, -1000000];
    const ticksLabels = ["(-30, 0]", "(-100, -30]", "(-300, -100]", "(-1500, -300]", "(-10000, -1500]", "(-1000000, -10000]"];

    // Linear Scale
    // const colorScaleLinear = d3.scaleSequential(d3.interpolateReds).domain([start, end])

    // Exponential Scale
    // const expScale = d3.scalePow().exponent(Math.E).domain([start, end])
    // const colorScaleExp = d3.scaleSequential((d) => d3.interpolateReds(expScale(d)))

    // Log Scale
    // const logScale = d3.scaleSymlog().constant(-200).domain([-1500, 0]) // scaleLog
    // const mycolor = d3.scaleSequential((d) => d3.interpolateBlues(logScale(d)))
    // const mycolor = function(d) { return d3.interpolateRdBu(logScale(d)) };

    const mycolor = function(d) { 
        if (d >= -30) {
            return d3.interpolateRdBu(1);  
        } else if (d >= -100) {
            return d3.interpolateRdBu(0.80);
        } else if (d >= -300) {
            return d3.interpolateRdBu(0.30);
        } else if (d >= -1500) {
            return d3.interpolateRdBu(0.15);
        } else if (d >= -10000) {
            return d3.interpolateRdBu(0.05);
        } else return d3.interpolateRdBu(0)
    };

    // set the dimensions and margins of the graph
    var margin = prop.margin, width = prop.width, height = prop.height;

    // var div = d3.select("#" + prop["appendId"]).append("<div id=\"" + prop["appendId"] + "_map\"></div>");
    var div = d3.select("#" + prop["appendId"]).append("div");
    var svg = div
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([0, width - 90])
        .domain(X)
        .padding(0.01);
    
    // Build X scales and axis:
    var y = d3.scaleBand()
        .range([0, height])
        .domain(Y)
        .padding(0.01);

    // add the squares
    // var tooltip = createTooltip(div);

    svg.selectAll()
        .data(data, function(d) {return d[d1]+':'+d[d2];})
        .enter()
        .append("g")
            .append("rect")
                .attr("x", function(d) { return x(d[d1]) })
                .attr("y", function(d) { return y(d[d2]) })
                .attr("datapoint", "component")
                .attr("width", x.bandwidth() )
                .attr("height", y.bandwidth() )
                .style("fill", function(d) { return mycolor(d[c]); })
    svg.selectAll("g")
        .append("text")
        .attr("x", function(d) { return x(d[d1]) + 2 ; }) // x.bandwidth() / 4
        .attr("y", function(d) { return y(d[d2]) + y.bandwidth() / 2 ; })
        .attr("fill", "white")
        .attr("dy", ".35em")
        .attr("font-size", 10)
        .text(function(d) { return Math.round(d[c] * 100) / 100; });

    var xAxisLabel = d1 === 'xx' ? '>' : d1;
    var yAxisLabel = d2 === 'yy' ? 'v' : d2;

    svg.append("text")
        .attr("x", (width - 90) / 2 )
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("font-size", 14)
        .text(prop["title"]);
    appendXaxis(svg, x, height);
    appendXlabel(svg, xAxisLabel, width - 90, height);
    appendYaxis(svg, y);
    appendYlabel(svg, yAxisLabel, width - 90, height);

    // /////////////////////////////////////////////////////////////////////////
    // Continuous legend
    // /////////////////////////////////////////////////////////////////////////
    /*
    // var colorScale = mycolor;
    // append a defs (for definition) element to your SVG
    var defs = svg.append('defs');
    // append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append('linearGradient').attr('id', 'linear-gradient');

    // horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    console.log(colorScale(0));
    console.log(colorScale(-100));
    console.log(colorScale(-300));
    console.log(colorScale(-400));

    // append multiple color stops by using D3's data/enter step
    linearGradient.selectAll("stop")
        .data(ticks.map(function(t) { console.log(t + " " + colorScale(t)); return { offset: `${100 * (1 - t/-1500)}%`, color: colorScale(t) }}))    
        .enter().append("stop")
        .attr("offset", function(d) {  return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

    // append title
    svg.append("text")
        .attr("class", "legendTitle")
        .attr("x", width / 8)
        .attr("y", -15)
        .style("text-anchor", "left")
        .text("Umidity");

    // draw the rectangle and fill with gradient
    svg.append("rect")
        .attr("x", width / 4)
        .attr("y", -30)
        .attr("width", width / 2)
        .attr("height", 15)
        .style("fill", "url(#linear-gradient)");

    //create tick marks
    var xLeg = d3.scaleSymlog().domain([-1500, 0]).range([width / 4, 3 * width / 4 - 1]);
    var axisLeg = d3.axisBottom(xLeg).tickValues(ticks)

    svg
        .attr("class", "axis")
        .append("g")
        .attr("transform", "translate(0, -20)")
        .call(axisLeg);
    */

    // /////////////////////////////////////////////////////////////////////////
    // Discrete legend
    // /////////////////////////////////////////////////////////////////////////
    var size = 20
    svg.selectAll("mydots")
        .data(ticks)
        .enter()
        .append("rect")
        .attr("x", width - 85)
        .attr("y", function(d,i){ return height / 4 + i * (size + 5 ) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return mycolor(d)})
   
    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(ticksLabels)
        .enter()
        .append("text")
        .attr("x", width + size - 85)
        .attr("y", function(d,i){ return height / 4 + i * (size + 7) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d,i){ return mycolor(ticks[i])})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .attr("font-size", 10)
        .style("alignment-baseline", "middle")
}