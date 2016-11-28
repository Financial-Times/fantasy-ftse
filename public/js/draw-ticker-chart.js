var findYatX = function(x, path, error){
  var length_end = path.getTotalLength()
    , length_start = 0
    , point = path.getPointAtLength((length_end + length_start) / 2) // get the middle point
    , bisection_iterations_max = 50
    , bisection_iterations = 0

  error = error || 0.01

  while (x < point.x - error || x > point.x + error) {
    // get the middle point
    point = path.getPointAtLength((length_end + length_start) / 2)

    if (x < point.x) {
      length_end = (length_start + length_end)/2
    } else {
      length_start = (length_start + length_end)/2
    }

    // Increase iteration
    if(bisection_iterations_max < ++ bisection_iterations)
      break;
  }
  return point.y
}

function drawChart(dayCount) {
  var frame = d3.select('#ticker-timeseries');
  frame.html('');
  d3.select('#ticker-articles tbody').html('');

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

  var baseFetchURL = "http://markets.ft.com/research/webservices/securities/v1/time-series-interday";
  if (dayCount === '1') {
    baseFetchURL = "http://markets.ft.com/research/webservices/securities/v1/time-series";
  }

  d3.json(baseFetchURL + '?source=7d373767c4bc81a4&dayCount='+dayCount+'&symbols=' + window.tickerId, function (d) {
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

    var timeseriesLine = g.append('path')
        .datum(timeseriesData)
        .attr('class', 'line')
        .attr('d', line);

    d3.json('/content/' + window.companyName, function(articles) {
      for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        var articleTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')(article.publishedDate);

        var bisect = d3.bisector(function(d) { return d.lastClose; }).left;
        var item = timeseriesData[bisect(timeseriesData, articleTimestamp)];
        // console.log(articleTimestamp, xScale(articleTimestamp), findYatX(xScale(articleTimestamp), timeseriesLine.node()))

        annotations.append('circle')
          .attr('cx', xScale(articleTimestamp))
          .attr('cy', findYatX(xScale(articleTimestamp), timeseriesLine.node()))
          .attr('r', 6)
          .attr('fill', '#fff1e0')
          .attr('stroke', '#9e2f50')
          .attr('stroke-width', '3');

        var articleTeaser = d3.select('#ticker-articles .o-teaser')
          .append('div')
          .attr('class', 'o-teaser__content')

        articleTeaser
          .append('a')
            .attr('class', 'o-teaser__tag')
            .attr('href', '//ft.com/content/" + article.uuid + "')
            .text('World');

        articleTeaser
          .append('h2')
          .attr('class', 'o-teaser__heading')
          .text(article.title);

        articleTeaser
          .append('p')
          .attr('class', 'o-teaser__standfirst')
          .text(article.teaser);

        articleTeaser
          .append('div')
          .attr('class', 'o-teaser__timestamp')
          .text(d3.timeFormat("%b %d, %Y %H:%M")(d3.utcParse('%Y-%m-%dT%H:%M:%SZ')(article.publishedDate)));
      }
    });

  });
}

function init() {
  dayCount = 31;
  drawChart(dayCount);
}

d3.select(window).on('resize', init());

var timePeriodButtons = document.querySelectorAll('#ticker-timeseries-controls button');
for (var i = 0; i < timePeriodButtons.length; i++) {
  timePeriodButtons[i].addEventListener('click', function(event) {
    // change attributes on button (view)
    for (var j = 0; j < timePeriodButtons.length; j++) {
      var button = timePeriodButtons[j];
      button.setAttribute('aria-selected', false);
    }
    this.setAttribute('aria-selected', true);

    // redraw chart
    var period = this.getAttribute("data-period");
    drawChart(period);
  });
}
