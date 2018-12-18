var query = {
  key: 'fdaa2d33a4cd6f3c21164f23abe8df22'
}

function getLiveCandles(exchanges, interval) {
 
  var requests = getAllMarkets().filter(function(market) {
    
    return (this.exchanges.indexOf(market.exchange) > -1);
  }, {exchanges: exchanges}).map(function(element) {
    
    query.market = element.market;
    query.exchange = element.exchange;
    query.interval = this.interval;
    return {
      url: 'https://api.nomics.com/v1/exchange_candles?'+qs.querify(query)
    };
  }, {interval: interval});
  
  return _.flatten(_.chunk(requests,1000).map(function(chuck) {
    return UrlFetchApp.fetchAll(requests).map(function(response, index) {
      if (response.getResponseCode() !== 200) {
        Logger.log(response.getResponseCode()+':'
                   +this.chuck[index]['url']);
      };
      return JSON.parse(response.getContentText());       
    }, {chuck: chuck})
  }))
};

function getAllMarkets(){
  var url = 'https://api.nomics.com/v1/markets?'+qs.querify(query);
  var fetch = UrlFetchApp.fetch(url);
  return JSON.parse(fetch);
}


function testLive() {
  var startTime = Date.now();
  var all = getLiveCandles(['bitfinex','kraken','binance','poloniex'], '15m');
  var endTime = Date.now();
  Logger.log((endTime - startTime) / 1000);
  Logger.log(all.length);
}
