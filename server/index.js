import express from 'express';
import chalk from 'chalk';
import nunjucks from 'nunjucks';
import dashboardController from './controllers/dashboard';
import tickersController from './controllers/tickers';
import contentAPI from './controllers/content-api';
import fixtures from './controllers/fixtures';
import somethingController from  './controllers/something';
import dotenv from 'dotenv';
import * as portfolio from './controllers/portfolio';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
dotenv.config({silent: true});
app.disable('x-powered-by');


function addUserId(req, res, next) {
	console.log("addUserId");
	delete req.headers.host;
	console.log("addUserId deleted host");
	console.log(fetch);
	fetch('https://session-next.ft.com', {headers:req.headers})
	.then((apiRes)=>{
		console.log("resp recieved");
		console.log(apiRes.status);
		return apiRes.json();
	})
	.then((json)=>{
		console.log("json recieved");
		console.log(json);
		req.set("userId", json.uuid);
		console.log(req.get("userId"));
		next();
	})
	.catch((err)=>{
		console.log("aaaarrrsse");
		console.log(err);
		next(err);
	});
};

nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

app.get('/__gtg', (req, res) => {
  res.send('ok');
});

app.use(express.static('public'));
app.use(bodyParser.json());
// app.use(addUserId());

app.get('/', dashboardController);
app.get('/funds/:tickerId', tickersController);
app.get('/content/:companyName', contentAPI);
//app.get('/articles/:uuid', contentAPI);
app.get('/fixtures/load', fixtures);
app.get('/welcome', somethingController);
app.post('/portfolio', portfolio.create);
app.get('/portfolio', portfolio.read);
app.put('/portfolio/buy', portfolio.buy);
app.put('/portfolio/sell', portfolio.sell);

const server = app.listen(process.env.PORT || 5000, () => {
  const { port } = server.address();

  console.log(chalk.magenta(
    `Running at http://localhost:${port}/\n`
  ));
});
