import * as d3 from 'd3';
import fetch from 'node-fetch';
import nunjucks from 'nunjucks';

function getNameFromId(id) {
  return id.split(' - ')[1];
}

async function getTimeseriesSVGFromId(id) {
 return await fetch('http://markets.ft.com/research/webservices/securities/v1/time-series?source=7d373767c4bc81a4&dayCount=1&symbols=' + id.split(' - ')[0])
  .then(async (res) => {
    const responseText = await res.json();
    return responseText;
  }).then(async (data) => {
    const timeseriesData = data.data.items[0].timeSeries.timeSeriesData;
    const currency = data.data.items[0].basic.currency;

    const parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');

    timeseriesData.forEach(function(d) {
      const closeDate = d.lastClose.toString()+'.000Z';
      d.lastClose=parseDate(closeDate);
    });

    const frameWidth = 300;
    const frameHeight = 100;

    const xScale = d3.scaleLinear()
      .rangeRound([0, frameWidth])
      .domain(d3.extent(timeseriesData, function(d) { return d.lastClose; }));

    const yScale = d3.scaleLinear()
      .rangeRound([frameHeight, 0])
      .domain(d3.extent(timeseriesData, function(d) { return d.close; }));

    const line = d3.line()
      .x(function(d) { return xScale(d.lastClose); })
      .y(function(d) { return yScale(d.close); });

    return nunjucks.render('partials/holdings-timeseries.svg', {
      width: frameWidth,
      height: frameHeight,
      line: {
        d: line(timeseriesData),
      }
    });
  }).catch((error) => {
      console.log('Data failed');
      console.log(error && error.stack);
      return 'No chart available';
    });
}

export default async () => {
  const holdings = [{
    id: '7974:TYO - Nintendo Co Ltd',
    name: getNameFromId('7974:TYO - Nintendo Co Ltd'),
    svgChart: await getTimeseriesSVGFromId('7974:TYO - Nintendo Co Ltd'),
    amount: 55,
  }, {
    id: 'GOOGLUSD:STO - Alphabet Inc',
    name: getNameFromId('GOOGLUSD:STO - Alphabet Inc'),
    svgChart: await getTimeseriesSVGFromId('GOOGLUSD:STO - Alphabet Inc'),
    amount: 100,
  }, {
    id: 'AAPL:NSQ - Apple Inc',
    name: getNameFromId('AAPL:NSQ - Apple Inc'),
    svgChart: await getTimeseriesSVGFromId('AAPL:NSQ - Apple Inc'),
    amount: 30,
  }];

  return {
    holdings,
  }
};
