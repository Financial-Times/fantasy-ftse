const maxAge = 1800; // 30 mins
const sMaxAge = 600; // 10 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

var fetch = require('node-fetch');

const base="https://api.ft.com";
const concept=`${base}/content?isAnnotatedBy=`;
const content=`${base}/content/`;
const enriched=`${base}/enrichedcontent/`;
const searchURL="https://api.ft.com/content/search/v1";

export default (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const companyName = req.params.companyName;

	const mock ={
			companyName: "Apple Inc",
			ticker: "AAPL-NAS",
			articles: [
				{
					uuid: "0aa1a704-0bfd-30d6-9760-a3e016f97aa2",
					title: "Stocks mixed as Trump rally loses some of its momentum",
					publishedDate: "2016-11-28T10:00:02.000Z",
					teaser: "US stocks are mixed in Tuesday trading, as the rally following Donald Trump's presidential election victory last week lost some of its momentum."
				}
			]
		};
	// lookupUPPID(tickerId)
	// .then((uuid)=>{
	// 	console.log(`${tickerId} -> ${uuid}`);
	// 	return {};
	// })
	articlesByCompany(companyName)
	.then((articles) => {
		// console.log(JSON.stringify(articles));
		// console.log(articles.results);
		var articles = articles.results[0].results.map((article)=> {
			return {
				title: article.title.title,
				teaser: article.summary.excerpt,
				publishedDate: article.lifecycle.initialPublishDateTime,
				uuid: article.id,
				contentType: article.aspectSet
			}
		});
		// articles.forEach((article)=>{
		// 	console.log(article);
		// })
		res.json(articles);
	})

};

function lookupUPPID(tickerId) {
	return Promise.resolve('2384fa7a-d514-3d6a-a0ea-3a711f66d0d8');
}

function articlesByCompany(companyName) {
	var body = {
		"queryString": `organisations:${companyName}`,
		"queryContext":{"curations":["ARTICLES","BLOGS","PODCASTS","VIDEOS"]},
		"resultContext" : {"aspects" : [ "title","lifecycle","summary"]}
	};
	var options = {body:JSON.stringify(body), method: "POST", headers:{"x-api-key": process.env.UPP_API_KEY}}
	return fetch(searchURL, options)
	.then((res) => {
		return res.json()
	});
}
