import {MongoClient} from 'mongodb';

import fetch from 'node-fetch';

export {
	create,
	read,
	buy,
	sell
};

const source=process.env.SOURCE;

const newPortfolio = {
	id: "",
	value: 0.00,
	cash : 10000.00,
	holdings: {},
	rank: 0,
	history : [],
	lastUpdated: null
};

const newHolding = {
	id :"",
	name: "",
	quantity : 0
};

const newHistory = {
	date: null,
	portfolio : {}
};

function getConnection(){
	return Promise.resolve(MongoClient.connect(process.env.MONGOHQ_URL));
}

function create(req, res) {
	var uuid = req.get('user');
	var p = Object.assign({}, newPortfolio);
	p.id = req.get('userId');
	getConnection().then((db)=>{
		db.collection('portfolios').deleteOne({id:p.id})
		.then((r)=>{
			console.log(`Deleted ${r.deletedCount}`);
			db.collection('portfolios').insertOne(p)
			.then(()=>{
				delete p["_id"];
				db.close();
				res.status(201).json(p);
			});
		});
	})
	.catch((err)=>{
		res.status(500).json({err});
	});
}


function read(req, res) {
	var id = req.get('userId');
	return getConnection().then((db)=>{
		db.collection('portfolios').findOne({id})
		.then((r)=>{
			console.log(r);
			if (r == null) {
				return create(req, res);
			}
			update(r)
			.then((ur)=>{
				delete r["_id"];
				db.close();
				res.status(200).json(ur);
			});
		});
	})
	.catch((err)=>{
		res.status(500).json({err});
	});
}

function getStockInfo(symbols) {
	const url=`http://markets.ft.com/research/webservices/securities/v1/quotes?symbols=${symbols}&source=${source}`;
	return fetch(url).then(res=>{
		if (res.status == 200) {
			return res.json();
		} else {
			res.text()
			.then (msg =>{
				console.log(`Lookup of ${symbols} returned ${res.stats} ${msg}`);
				return Promise.reject("msg");
			});
		}
	})
	.then(data=>{
		console.log(data);
		var item = data.items[0];
		console.log(`${item.basic.name} (${item.basic.symbol}) ${item.quote.lastPrice}`);
		return item;
	});
}

function update(portfolio) {
	var holdings = (portfolio.holdings);
	var totalValue = 0;
	var updates = Object.keys(holdings).map((key) => {
		return getStockInfo(key)
		.then((info)=>{
			var value = info.quote.lastPrice * holdings[key].quantity;
			totalValue = totalValue + value;
		});
	});
	return Promise.all(updates)
	.then((res) => {
		// console.log(totalValue);
		return getConnection().then((db)=>{
			portfolio.lastUpdated = new Date().toJSON();
			portfolio.value = totalValue;
			return db.collection('portfolios').updateOne({id:portfolio.id}, {$set:{value:portfolio.value, lastUpdated:portfolio.lastUpdated}})
			.then((result)=>{
				return portfolio;
			});
		});
	});
}

function addStockInfo(req, res) {
	var stock=req.body.tickerId;
	console.log(req.body);
	console.log(`stock ${stock}`);
	return getStockInfo(stock)
	.then((info) => {
		req.body.price = info.quote.lastPrice;
		req.body.stockName = info.basic.name;
		console.log(`Added ${req.body.lastPrice} for ${req.body.stockName}`);
		return Promise.resolve(info);
	}).catch((err) => {
		console.log(err);
		throw err;
	});
}

function buy(req, res){
	addStockInfo(req, res)
	.then(()=>{
			return performTrade(req, res, true);
	})
	.catch((err) => {
		res.status(500).json({err});
	});
}

function sell(req, res){
	addStockInfo(req, res)
	.then(()=>{
			return performTrade(req, res, false);
	})
	.catch((err) => {
		res.status(500).json({err});
	});
}

function performTrade(req, res, isBuy) {
	var stock=req.body.tickerId;
	var stockName = req.body.stockName;
	var quantity=req.body.quantity;
	var price = req.body.price;
	// console.log(`performTrade: ${isBuy?"Buy":"Sell"} ${quantity} of ${stock} @ ${price}`);
	var db;
	return getConnection()
	.then((d)=>{
		db=d;
		return d.collection('portfolios').findOne({id:req.get("userId")});
	})
	.then((r)=>{
		console.log(r);
		var tradeValue = price*quantity;
		var cp = r.holdings[stock];
		var currVolume = 0;
		if (cp) {
			currVolume = cp.quantity;
		}
		console.log(`current number of ${stockName} ${currVolume}`);
		if (isBuy && tradeValue >= r.cash ) {
			delete r["_id"];
			res.status(402).json({err: "NotEnoughDosh", message: `You have ${r.cash}, stock ${price}*${quantity}=${tradeValue}. You are short by ${tradeValue-r.cash}`});
		} else if (!isBuy && quantity > currVolume ) {
			delete r["_id"];
			res.status(402).json({err: "NotEnoughStock", message: `You don't have ${quantity} of ${stockName}. Please don't try to cheat!`});
		} else {
			// console.log(`${isBuy?"Buying":"Selling"} ${quantity} of ${stock} @ ${price}`);
			var history = Object.assign({}, newHistory);
			history.date = new Date().toJSON();
			var oldHoldings = {};
			Object.keys(r.holdings).forEach((key) => {
				oldHoldings[key] = Object.assign({}, r.holdings[key]);
			});
			history.portfolio =  { value: r.value, cash: r.cash, holdings: oldHoldings, rank: r.rank };
			// console.log(history);
			r.history.push(history);
			// console.log(r);
			if (isBuy) {
				r.value = r.value + tradeValue;
				r.cash = r.cash - tradeValue;
			} else {
				r.value = r.value - tradeValue;
				r.cash = r.cash + tradeValue;
			}

			// var holding = r.holdings.find((h)=>{ return h.stock.id === stock; });
			var holding = r.holdings[stock];
			if (holding == undefined) {
								holding = Object.assign({}, newHolding);
								holding.id = stock;
								holding.name = stockName;
			}
			// console.log(holding);
			if (isBuy) {
				holding.quantity = holding.quantity + quantity;
				// r.cash = r.cash - tradeValue;
			} else {
				holding.quantity = holding.quantity - quantity;
				// r.cash = r.cash + tradeValue;
			}
			// console.log(holding);
			r.holdings[stock] = holding;
			// console.log(r.holdings);
			// console.log("Update db");
			// {holdings: r.holdings, value: r.value, cash: r.cash}
			return db.collection('portfolios').updateOne({id:r.id}, {$set: r})
			.then((result)=>{
				// console.log(result);
				db.close();
				delete r["_id"];
				res.status(200).json(r);
			}).catch((err) => {
				// console.log(err);
				db.close();
				res.status(500).json(err);
			});
		}
	})
	.catch((err)=>{
		console.log(err);
		throw err;
	});
}
