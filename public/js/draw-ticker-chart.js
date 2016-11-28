var frame = d3.select('#ticker-timeseries');
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
  .attr('width', frameWidth)
  .attr('height', frameHeight)
  .attr('transform', 'translate('+margins.left+','+margins.top+')');

d3.json('/js/pson-dummy-data.json', function (d) {
  var timeseriesData = d.data.items[0].timeSeries.timeSeriesData;
  var currency = d.data.items[0].basic.currency;

  console.log(timeseriesData)
  var parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S');

  timeseriesData.forEach(function(d) {
    d.lastClose=parseDate(d.lastClose);
  });

  var xScale = d3.scaleLinear()
    .domain(d3.extent(timeseriesData, function(d) { return d.lastClose; }))
    .rangeRound([0, frameWidth]);

  var yScale = d3.scaleLinear()
    .domain(d3.extent(timeseriesData, function(d) { return d.close; }))
    .rangeRound([frameHeight, 0]);

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

});
