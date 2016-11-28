const maxAge = 1800; // 30 mins
const sMaxAge = 600; // 10 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

import fetch from 'node-fetch';

const base="https://api.ft.com";
const concept=`${base}/content?isAnnotatedBy=`;
const content=`${base}/content/`;
const enriched=`${base}/enrichedcontent/`;

export default (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const tickerId = req.params.tickerId;

	const mock ={
			companyName: "Apple Inc",
			ticker: "AAPL-NAS",
			articles: [
				{
					uuid: "0aa1a704-0bfd-30d6-9760-a3e016f97aa2",
					title: "Stocks mixed as Trump rally loses some of its momentum",
					publishedDate: "2016-11-15T16:00:02.000Z",
					teaser: "US stocks are mixed in Tuesday trading, as the rally following Donald Trump's presidential election victory last week lost some of its momentum."
				}
			]
		};
	lookupUPPID(tickerId)
	.then((uuid)=>{
		console.log(`${tickerId} -> ${uuid}`);
		return {};
	})
  res.json(mock);
};

function lookupUPPID(tickerId) {
	return Promise.resolve('2384fa7a-d514-3d6a-a0ea-3a711f66d0d8');
}
