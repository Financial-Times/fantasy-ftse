import * as d3 from 'd3';
import fetch from 'node-fetch';
import nunjucks from 'nunjucks';

function getNameFromId(id) {
  return id.split(' - ')[1];
}

function getTickerIdFromId(id) {
  return id.split(' - ')[0];
}

function getTimeseriesSVGFromId (id) {
	return fetch('http://markets.ft.com/research/webservices/securities/v1/time-series?source=7d373767c4bc81a4&dayCount=1&symbols=' + id.split(' - ')[0])
		.then(res => res.json())
		.then(data => {
			var timeseriesData = data.data.items[0].timeSeries.timeSeriesData;

			const parseDate = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ');

			timeseriesData = timeseriesData || [];

			timeseriesData.forEach(function (d) {
				const closeDate = d.lastClose.toString() + '.000Z';
				d.lastClose = parseDate(closeDate);
			});

			const frameWidth = 300;
			const frameHeight = 50;

			const xScale = d3.scaleLinear()
				.rangeRound([0, frameWidth - 10])
				.domain(d3.extent(timeseriesData, function (d) {
					return d.lastClose;
				}));

			const yScale = d3.scaleLinear()
				.rangeRound([frameHeight - 10, 0])
				.domain(d3.extent(timeseriesData, function (d) {
					return d.close;
				}));

			const line = d3.line()
				.x(function (d) {
					return xScale(d.lastClose);
				})
				.y(function (d) {
					return yScale(d.close);
				});

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


function getRealHoldings () {

	//console.log('wat');
	return fetch('https://fantasy-ftse.ft.com/portfolio', {headers: {'userId': 'f1a0bc4b-8ddf-4954-956f-9e7429e58e41'}})
		.then(res => {
			//console.log('uhh');
			return res.json()
		})
		.then(responseText => {
			console.log('lol', responseText);
			return Promise.all(Object.keys(responseText.holdings).map(holdingKey => {
				const holding = responseText.holdings[holdingKey];
				//console.log("retrieving: " + holding);
				return getTimeseriesSVGFromId(holding.id + " - " + holding.name)
					.then(svg => {
						return {
							id: holding.id + " - " + holding.name,
							tickerId: holding.name,
							name: holding.name,
							svgChart: svg,
							amount: 55
						}
					})
			}));
		})
		.catch((error) => {
			console.log('error', error);
//            return {
//                holdings,
//              }
		});

}

export default function () {
  //const holdings = [{
  //  id: '7974:TYO - Nintendo Co Ltd',
  //  tickerId: getTickerIdFromId('7974:TYO - Nintendo Co Ltd'),
  //  name: getNameFromId('7974:TYO - Nintendo Co Ltd'),
  //  svgChart: await getTimeseriesSVGFromId('7974:TYO - Nintendo Co Ltd'),
  //  amount: 55,
  //}, {
  //  id: 'GOOGLUSD:STO - Alphabet Inc',
  //  tickerId: getTickerIdFromId('GOOGLUSD:STO - Alphabet Inc'),
  //  name: getNameFromId('GOOGLUSD:STO - Alphabet Inc'),
  //  svgChart: await getTimeseriesSVGFromId('GOOGLUSD:STO - Alphabet Inc'),
  //  amount: 100,
  //}, {
  //  id: 'AAPL:NSQ - Apple Inc',
  //  tickerId: getTickerIdFromId('AAPL:NSQ - Apple Inc'),
  //  name: getNameFromId('AAPL:NSQ - Apple Inc'),
  //  svgChart: await getTimeseriesSVGFromId('AAPL:NSQ - Apple Inc'),
  //  amount: 30,
  //}];
    getRealHoldings()
        .then(stuff => {
		    //console.log('Got real holdings!', stuff);
	    });
}
