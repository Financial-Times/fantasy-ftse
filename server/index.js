import express from 'express';
import chalk from 'chalk';
import nunjucks from 'nunjucks';
import dashboardController from './controllers/dashboard';
import companiesController from './controllers/companies';

const app = express();
app.disable('x-powered-by');

nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

app.get('/__gtg', (req, res) => {
  res.send('ok');
});

app.get('/', dashboardController);
app.get('/funds/:company', companiesController);

const server = app.listen(process.env.PORT || 5000, () => {
  const { port } = server.address();

  console.log(chalk.magenta(
    `Running at http://localhost:${port}/\n`
  ));
});
