const maxAge = 1800; // 30 mins
const sMaxAge = 600; // 10 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const tickerId = req.params.tickerId;

	const mock = [
		{
			comanyName: "Apple Inc",
			ticker: "APPL-NYSE",
			articles: [
				{
					uuid: "2286616a-1a37-11e3-b3da-00144feab7de"

				}
			]
		}
	];
  res.json(mock);
};
