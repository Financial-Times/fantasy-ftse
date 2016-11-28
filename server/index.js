import express from 'express';
import chalk from 'chalk';
import nunjucks from 'nunjucks';
import dashboardController from './controllers/dashboard';
import tickersController from './controllers/tickers';
import contentAPI from './controllers/content-api';

const app = express();
app.disable('x-powered-by');

nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

app.get('/__gtg', (req, res) => {
  res.send('ok');
});

app.use(express.static('public'));

app.get('/', dashboardController);
app.get('/funds/:tickerId', tickersController);
app.get('/content/:tickerId', contentAPI);
//app.get('/articles/:uuid', contentAPI);

const server = app.listen(process.env.PORT || 5000, () => {
  const { port } = server.address();

  console.log(chalk.magenta(
    `Running at http://localhost:${port}/\n`
  ));
});
