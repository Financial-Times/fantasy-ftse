import * as d3 from 'd3';
import fetch from 'node-fetch';
import nunjucks from 'nunjucks';

function getNameFromId (id) {
	return id.split(' - ')[1];
}

function getTickerIdFromId (id) {
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
	
	//return fetch('http://fantasy-ftse.ft.com/portfolio', {
	return fetch('https://fantasy-ftse.ft.com/portfolio', {
		headers: {
			'userId': 'f1a0bc4b-8ddf-4954-956f-9e7429e58e41'
		}
	})
		.then(res => {
			//console.log('uhh');
			return res.json()
		})
		.then(responseText => {


			//console.log('this is the stuff', responseText);


			return Promise.all(Object.keys(responseText.holdings).map(holdingKey => {
				const holding = responseText.holdings[holdingKey];
				//console.log("retrieving: " + JSON.stringify(holding));
				return getTimeseriesSVGFromId(holding.id + " - " + holding.name)
					.then(svg => {
						//console.log('got svg', svg);
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
		});

}

export default function () {
	return getRealHoldings()
		.then(holdings => {
			console.log('Got real holdings!', holdings);
			return {
				holdings
			}
		});
}
