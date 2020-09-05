/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var request = require("request");
var rp = require('request-promise');

var PriceHandler = require('./priceHandler.js');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {

  var priceHandler = new PriceHandler();

  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    console.log("db connection successful");
    //mongodb 3.x returns a client for callback, not db
    var db = client.db('test');

    var collection = db.collection("stocks");

    var stockAPI = "https://repeated-alpaca.glitch.me/v1/stock/"; // .../stock/[symbol]/quote

    app.route("/api/stock-prices").get( function(req, res) {
      //console.log(req.query);

      //one stock
      if (typeof req.query.stock == 'string'){
        var url = stockAPI + req.query.stock + "/quote";
        rp({ uri: url, json: true })
          .then(response => {
            var stockData = {
              stock: response.symbol,
              price: response.latestPrice.toString(),
              likes: 0
            };
            if (req.query.like) {
              stockData.likes = 1
            };

            //make db call and update stock
            collection.findOneAndUpdate(
              { stock: stockData.stock },
              { $inc: { likes: stockData.likes }, $set: { price: stockData.price } },
              { returnOriginal: false, upsert: true },
              function(err, data){
                if (err) {
                  console.log(err);
                } else {
                  //console.log(data.value);
                  res.json({ stockData: data.value });
                }
              }
            );

          });

      };

      //two stocks
      if (Array.isArray(req.query.stock)){
        //stock
        var stocks = [...req.query.stock];
        //console.log(req.query);
        //console.log(stocks);
        priceHandler.checkTwo(stocks)
          .then(data => {
            var stockA = {
              stock: data[0].symbol,
              price: data[0].latestPrice.toString(),
              likes: 0
            };
            var stockB = {
              stock: data[1].symbol,
              price: data[1].latestPrice.toString(),
              likes: 0
            };
            if (req.query.like){
              stockA.likes = 1;
              stockB.likes = 1;
            }
          return [stockA, stockB];
          })
          .then(stocks => {
            //update database and return stockData to client: stock, price, rel_likes
            collection.findOneAndUpdate({ stock: stocks[0].stock }, { $inc: { likes: stocks[0].likes }, $set: { price: stocks[0].price } }, { returnOriginal: false, upsert: true }, (err, docA) => {
              collection.findOneAndUpdate({ stock: stocks[1].stock }, { $inc: { likes: stocks[1].likes }, $set: { price: stocks[1].price } }, { returnOriginal: false, upsert: true }, (err, docB) => {
                var stockA = { stock: docA.value.stock, price: docA.value.price, rel_likes: docA.value.likes - docB.value.likes };
                var stockB = { stock: docB.value.stock, price: docB.value.price, rel_likes: docB.value.likes - docA.value.likes };
                //console.log(stockA);
                //console.log(stockB);
                res.json({ stockData: [stockA, stockB] });
              })
            })
          })


      };
    });

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res
        .status(404)
        .type("text")
        .send("Not Found");
    });
  });
};
