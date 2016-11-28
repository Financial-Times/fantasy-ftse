import {Converter} from 'csvtojson';


export default async (req, res) => {
	var rs=require("fs").createReadStream("fixtures/ticker_exchange_and_figi_to_org_uuid.csv");
	var conv=new Converter({construct:false});
	conv.transform=function(json){
	  console.log(json);
	};
	conv.on("end_parsed",function(){
		res.json({done:true});
	});
	rs.pipe(conv);
}

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
