const maxAge = 1800; // 30 mins
const sMaxAge = 600; // 10 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

import fetch from 'node-fetch';

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const tickerId = req.params.tickerId;

	const mock ={
			comanyName: "Apple Inc",
			ticker: "APPL-NYSE",
			articles: [
				{
					uuid: "2286616a-1a37-11e3-b3da-00144feab7de",
					title: "Strong earnings send FTSE higher",
          timestamp: "2016-11-28T09:49:59",
				}
			]
		};
  res.json(mock);
};
