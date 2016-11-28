function drawChart() {
  var frame = d3.select('#ticker-timeseries');
  frame.html('');
  var margins = {
    left: 30,
    right: 10,
    top: 0,
    bottom: 50,
  }
  var frameWidth = document.getElementById('ticker-timeseries').offsetWidth - margins.left - margins.right;
  var frameHeight = 400 - margins.top - margins.bottom;
  var svg = frame.append('svg')
    .attr('width', frameWidth + margins.left + margins.right)
    .attr('height', frameHeight + margins.top + margins.bottom);
  var g = svg.append('g')
    .attr('id', 'ticker-chart')
    .attr('width', frameWidth)
    .attr('height', frameHeight)
    .attr('transform', 'translate('+margins.left+','+margins.top+')');
  var annotations = svg.append('g')
    .attr('id', 'ticker-annotations')
    .attr('width', frameWidth)
    .attr('height', frameHeight)
    .attr('transform', 'translate('+margins.left+','+margins.top+')');

  var xScale = d3.scaleLinear()
    .rangeRound([0, frameWidth]);

  var yScale = d3.scaleLinear()
    .rangeRound([frameHeight, 0]);

  var parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S');

  d3.json('/js/pson-dummy-data.json', function (d) {
    var timeseriesData = d.data.items[0].timeSeries.timeSeriesData;
    var currency = d.data.items[0].basic.currency;

    console.log(timeseriesData)

    timeseriesData.forEach(function(d) {
      d.lastClose=parseDate(d.lastClose);
    });

    xScale.domain(d3.extent(timeseriesData, function(d) { return d.lastClose; }))

    yScale.domain(d3.extent(timeseriesData, function(d) { return d.close; }))

    var xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M"));

    var line = d3.line()
      .x(function(d) { return xScale(d.lastClose); })
      .y(function(d) { return yScale(d.close); });

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + frameHeight + ')')
        .call(xAxis);

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(yScale))
      .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .style('text-anchor', 'end')
        .text('Close price ('+currency+')');

    g.append('path')
        .datum(timeseriesData)
        .attr('class', 'line')
        .attr('d', line);

    d3.json('/content/goog:nye', function(d) {
      var articles = d.articles;
      for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        var articleTimestamp = parseDate(article.timestamp);

        var bisect = d3.bisector(function(d) { return d.lastClose; }).left;
        var item = timeseriesData[bisect(timeseriesData, articleTimestamp)];

        annotations.append('circle')
          .attr('cx', xScale(articleTimestamp))
          .attr('cy', yScale(item.close)-3) // TODO: get position on line
          .attr('r', 6)
          .attr('fill', '#fff1e0')
          .attr('stroke', '#9e2f50')
          .attr('stroke-width', '3');
      }
    });

  });
}

function init() {
  drawChart();
}

d3.select(window).on('resize', init());
