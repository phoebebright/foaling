
var marginFocus = {top: 10, right: 10, bottom: 250, left: 40},
    marginContext = {top: 430, right: 10, bottom: 170, left: 40},
    width = 960 - marginFocus.left - marginFocus.right,
    heightFocus = 650 - marginFocus.top - marginFocus.bottom,
    heightContext = 650 - marginContext.top - marginContext.bottom;
legendOffset = 550;

var parseDate = d3.time.format("%d/%m/%y %H:%M").parse;

var xFocus = d3.time.scale().range([0, width]),
    xContext = d3.time.scale().range([0, width]),
    yFocus = d3.scale.linear().range([heightFocus, 0]),
    yContext = d3.scale.linear().range([heightContext, 0]);

var xAxisFocus = d3.svg.axis().scale(xFocus).orient("bottom"),
    xAxisContext = d3.svg.axis().scale(xContext).orient("bottom"),
    yAxisFocus = d3.svg.axis().scale(yFocus).orient("left");

var levelFocus = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xFocus(d.date); })
    .y(function(d) { return yFocus(d.level); });


var levelContext = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xContext(d.date); })
    .y(function(d) { return yContext(d.level); });

var svg = d3.select("svg")
    .attr("width", width + marginFocus.left + marginFocus.right)
    .attr("height", heightFocus + marginFocus.top + marginFocus.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", heightFocus);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")");

d3.csv("data.csv", function(error, data) {
    data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.level = +d.level;
    });

    xFocus.domain(d3.extent(data.map(function (d) {
        return d.date;
    })));
    yFocus.domain([d3.min(data.map(function (d) {
        return d.level;
    })) - 2, 0]);
    xContext.domain(xFocus.domain());
    yContext.domain(yFocus.domain());

    // Nest the entries by piezo
    var dataNest = d3.nest()
        .key(function (d) {
            return d.piezo;
        })
        .entries(data);

    console.log(dataNest)

    legendSpace = width / dataNest.length; // spacing for legend // ******


    var brush = d3.svg.brush()
        .x(xContext)
        .on("brush", brushed);


    svg.selectAll("text").data(dataNest)
        .enter()
        .append("text")
        .attr("x", function (d, i) {
            return (legendSpace / 2) + i * legendSpace
        }) // spacing
        .attr("y", legendOffset)
        .attr("class", "legend") // style the legend
        .attr("id", function (d) {
            return "legend-" + d.key.replace(/\s+/g, '')
        })  //the replace stuff is getting rid of spaces
        .on("click", function (d) {
            // Determine if current line is visible
            var active = d.active ? false : true,
                newOpacity = active ? 0 : 1;
            // Hide or show the elements based on the ID
            d3.selectAll("#" + d.key.replace(/\s+/g, ''))
                .transition()
                .style("stroke-width", 3)
                .transition().duration(500)
                .style("opacity", newOpacity)
                .style("stroke-width", 1);
            // Update whether or not the elements are active
            d.active = active;
        })
        .text(function (d) {
            return d.key
        });

    focus.selectAll("g").data(dataNest)
        .enter()
        .append("g")
        .attr("id", function (d) {
            return d.key.replace(/\s+/g, '')
        })  //the replace stuff is getting rid of spaces
        .append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return levelFocus(d.values);
        });

    context.selectAll("g").data(dataNest)
        .enter()
        .append("g")
        .attr("class", "line")
        .attr("id", function (d) {
            return d.key.replace(/\s+/g, '')
        })  //the replace stuff is getting rid of spaces
        .append("path")
        .attr("d", function (d) {
            return levelContext(d.values);
        });

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightFocus + ")")
        .call(xAxisFocus);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxisFocus);

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightContext + ")")
        .call(xAxisContext);

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", heightContext + 7);


    function brushed() {
        xFocus.domain(brush.empty() ? xContext.domain() : brush.extent());
        focus.selectAll("path.line").attr("d", function (d) {
            return levelFocus(d.values);
        });
        focus.select(".x.axis").call(xAxisFocus);
    }

});