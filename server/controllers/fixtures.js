import {Converter} from 'csvtojson';
import {MongoClient} from 'mongodb';

export default async (req, res) => {
	MongoClient.connect(process.env.MONGOHQ_URL).then((db) => {
		var collection = db.collection('tickers');
		var done = false;
		var processed = 0;
		var rs=require("fs").createReadStream("fixtures/ticker_exchange_and_figi_to_org_uuid.csv");
		var conv=new Converter({construct:false});
		conv.transform=function(json){
			var ticker = /^\w+/.exec(json.ticker_exchange)[0];
			var orgUUID = json.org_upp_id;
			// var exchange = /^\w+-+(\w+)/.exec(json.ticker_exchange)[1];
			var data={
				ticker,
				orgUUID
			};
			db.collection('tickers').insertOne(data).then(()=>{
				processed++
				if (done) {
					db.close();
				}
			})
			// console.log(json);
		  console.log(data);
		};
		conv.on("end_parsed",function(){
			done = true;
			res.json({done:true, processed});
		});
		rs.pipe(conv);
	})
};

// var MongoClient = require('mongodb').MongoClient,
//   co = require('co'),
//   assert = require('assert');
//
// co(function*() {
//   // Connection URL
//   var url = 'mongodb://localhost:27017/myproject';
//   // Use connect method to connect to the Server
//   var db = yield MongoClient.connect(url);
//   // Close the connection
//   db.close();
// }).catch(function(err) {
//   console.log(err.stack);
// });
