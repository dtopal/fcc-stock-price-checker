"use strict"
var rp = require('request-promise');

function PriceHandler() {

  this.checkTwo = async function(stocks) {
    stocks = stocks.map(stock => 'https://repeated-alpaca.glitch.me/v1/stock/' + stock + '/quote');
    let results = [];
    for (let i = 0; i < stocks.length; i++) {
      var response = await rp.get({ uri: stocks[i], json: true })
      results.push(response);
    }
    return results;
  };
}

module.exports = PriceHandler;
