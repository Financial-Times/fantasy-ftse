function findYatX(x, linePath) {
  function getXY(len) {
      var point = linePath.getPointAtLength(len);
      return [point.x, point.y];
  }
  var curlen = 0;
  while (getXY(curlen)[0] < x) { curlen += 0.01; }
  return getXY(curlen);
}

function drawChart() {
  var frame = d3.select('#ticker-timeseries');
  frame.html('');
  var margins = {
    left: 30,
    right: 10,
    top: 20,
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

  var parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');

  d3.json('/js/pson-dummy-data.json', function (d) {
    var timeseriesData = d.data.items[0].timeSeries.timeSeriesData;
    var currency = d.data.items[0].basic.currency;

    timeseriesData.forEach(function(d) {
      var closeDate = d.lastClose.toString()+'.000Z'
      d.lastClose=parseDate(closeDate);
    });

    console.log(timeseriesData)

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
        var articleTimestamp = parseDate(article.publishedDate);

        var bisect = d3.bisector(function(d) { return d.lastClose; }).left;
        var item = timeseriesData[bisect(timeseriesData, articleTimestamp)];
        console.log(xScale(articleTimestamp), findYatX(xScale(articleTimestamp), d3.select('.line').node()))

        annotations.append('circle')
          .attr('cx', xScale(articleTimestamp))
          .attr('cy', findYatX(xScale(articleTimestamp), d3.select('.line').node())[1])
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
