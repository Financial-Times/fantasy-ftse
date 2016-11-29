function getNameFromId(id) {
  return id.split(' - ')[1];
}

function getTimeseriesSVGFromId(id) {
  return '<svg><text>Hello world dummy svg</text></svg>';
}

export default async () => {
  const holdings = [{
    id: '7974:TYO - Nintendo Co Ltd',
    name: getNameFromId('7974:TYO - Nintendo Co Ltd'),
    svgChart: getTimeseriesSVGFromId('7974:TYO - Nintendo Co Ltd'),
    amount: 55,
  }, {
    id: 'GOOGLUSD:STO - Alphabet Inc',
    name: getNameFromId('GOOGLUSD:STO - Alphabet Inc'),
    svgChart: getTimeseriesSVGFromId('GOOGLUSD:STO - Alphabet Inc'),
    amount: 100,
  }, {
    id: 'AAPL:NSQ - Apple Inc',
    name: getNameFromId('AAPL:NSQ - Apple Inc'),
    svgChart: getTimeseriesSVGFromId('AAPL:NSQ - Apple Inc'),
    amount: 30,
  }];

  return {
    holdings,
  }
};
