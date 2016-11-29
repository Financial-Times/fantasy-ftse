import * as d3 from 'd3';
import fetch from 'node-fetch';
import nunjucks from 'nunjucks';

function getNameFromId(id) {
  return id.split(' - ')[1];
}

function getTickerIdFromId(id) {
  return id.split(' - ')[0];
}

async function getTimeseriesSVGFromId(id) {
 return await fetch('http://markets.ft.com/research/webservices/securities/v1/time-series?source=7d373767c4bc81a4&dayCount=1&symbols=' + id.split(' - ')[0])
  .then(async (res) => {
    const responseText = await res.json();
    return responseText;
  }).then(async (data) => {
    var timeseriesData = data.data.items[0].timeSeries.timeSeriesData;
    const currency = data.data.items[0].basic.currency;

    const parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');

    timeseriesData = timeseriesData || [];

    timeseriesData.forEach(function(d) {
      const closeDate = d.lastClose.toString()+'.000Z';
      d.lastClose=parseDate(closeDate);
    });

    const frameWidth = 300;
    const frameHeight = 50;

    const xScale = d3.scaleLinear()
      .rangeRound([0, frameWidth-10])
      .domain(d3.extent(timeseriesData, function(d) { return d.lastClose; }));

    const yScale = d3.scaleLinear()
      .rangeRound([frameHeight-10, 0])
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


async function getRealHoldings() {
    return await fetch('http://localhost:5000/portfolio',{headers: {'userId':'48c88fa7-2034-4f88-987b-40718d6a5521'}})
        .then(async(res) => {
                const responseText = await res.json();
                const realHoldings = [];
                for (var holding in responseText.holdings) {
                    console.log("retrieving: " + holding);
                   realHoldings.push({
                       id: responseText.holdings[holding].id + " - " + responseText.holdings[holding].name,
                       tickerId: responseText.holdings[holding].name,
                       name: responseText.holdings[holding].name,
                       svgChart: await getTimeseriesSVGFromId(responseText.holdings[holding].id + " - " + responseText.holdings[holding].name),
                       amount: 55,
                     });
                 }
                 return realHoldings;
                }).catch((error) => {

        console.log(error);
//            return {
//                holdings,
//              }
          });
}

export default async () => {
  const holdings = [{
    id: '7974:TYO - Nintendo Co Ltd',
    tickerId: getTickerIdFromId('7974:TYO - Nintendo Co Ltd'),
    name: getNameFromId('7974:TYO - Nintendo Co Ltd'),
    svgChart: await getTimeseriesSVGFromId('7974:TYO - Nintendo Co Ltd'),
    amount: 55,
  }, {
    id: 'GOOGLUSD:STO - Alphabet Inc',
    tickerId: getTickerIdFromId('GOOGLUSD:STO - Alphabet Inc'),
    name: getNameFromId('GOOGLUSD:STO - Alphabet Inc'),
    svgChart: await getTimeseriesSVGFromId('GOOGLUSD:STO - Alphabet Inc'),
    amount: 100,
  }, {
    id: 'AAPL:NSQ - Apple Inc',
    tickerId: getTickerIdFromId('AAPL:NSQ - Apple Inc'),
    name: getNameFromId('AAPL:NSQ - Apple Inc'),
    svgChart: await getTimeseriesSVGFromId('AAPL:NSQ - Apple Inc'),
    amount: 30,
  }];
    var value = await getRealHoldings();
    console.log(value);
    console.log(holdings);
    return {value};
};
