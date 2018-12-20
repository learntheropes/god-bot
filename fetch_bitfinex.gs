/*
function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  ScriptApp.deleteTrigger(triggers[0]);
}

function fatch_and_store() {
  var settings = storage.getAll();
  
  [1].forEach(function() {
    getAndSaveOhlcv(this.settings);
  }, {settings:settings})
};

function getMonday( date ) {
  var day = date.getDay() || 7;  
  if(day !== 1)
    date.setHours(-24 * (day - 1));
  return date;
};

function initializeTs(settings) {
  var query = {
    start: '0000000000000',
    sort: '1'
  };
  var url = getUrl(settings, query);
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());
  var date = getMonday(new Date(parseInt(data[0][0])));
  date.setDate(date.getDate() + 7);
  date.setUTCHours(0,0,0,0);
  return date.getTime();
};

function getLastTs(sheet, settings) {
  var last_row = sheet.getLastRow();
  var frozen_row = sheet.getFrozenRows();
  
  return (last_row !== frozen_row)
  ? sheet.getRange(last_row,1).getValue()
  : initializeTs(settings);
};

function getUrl(settings, query) {
  return 'https://api.bitfinex.com/v2/candles/trade:'
  + settings.tf + ':'
  + settings.pair + '/hist'
  + '?' + qs.querify(query);
}

function getAndSaveOhlcv(settings) {
  
  var sheet = new SHEETS_LIB(settings.exchange + settings.pair, settings.tf).sheet();
  var requests_objects = [];
  var start = getLastTs(sheet, settings);
  
  if (parseInt(start) >= 1544053500000) {
    deleteTrigger();  
  };
  
  for (step = start; step < start + 604800000; step += 86400000) {
    
    var query = {
      start: (step + 1).toString(),
      end: (step + 86400000).toString(),
      sort: '1'
    };
    
    if (step === start) { 
      settings.start = step;
      settings.end = step + 604800000;
    }
    
    requests_objects.push({url: getUrl(settings, query)});
  }
 
  var responses = UrlFetchApp.fetchAll(requests_objects); // 1 week of candles (7 objects of 1 day candle)
  
  var week_candles = [];
  responses.map(function(response) {
    week_candles = week_candles.concat(JSON.parse(response.getContentText()))
  });
  
  var results = elaborate_data(settings, week_candles);
  
  sheet.appendRows(_.drop(results));
};
  
function elaborate_data(settings, candles) {
  var results = [], i = 0;
  for (step = settings.start; step <= settings.end; step += 900000) { // 15m steps in 1w
    
    ++i;
      
    var elem_index = _.findIndex(candles, function(o) {
      return o[0] === step;
    });
    
    var elem = (elem_index === -1) ? null : candles[elem_index];
    
    var result = [
      step,                  // 15m ts result[0]
      (elem) ? elem[4] : '', // 15m low result[1]
      (elem) ? elem[1] : '', // 15m open result[2]
      (elem) ? elem[2] : '', // 15m close result[3]
      (elem) ? elem[3] : '', // 15m high result[4]
      (elem) ? elem[5] : '', // 15m volume result[5]
    ];
    results.push(result);
      
    [1800000,3600000,7200000,14400000,86400000,604800000].forEach(function(period) {
      
      if (is_multiple(step, period))
        var tf = concatAggregated(period, this.results)
      else
        var tf = ['','','','',''];
        
      var temp = this.results[this.i].concat(tf);
      results[this.i] = temp;
    },{results:results,i:i});
  }
  return results;
};

function is_multiple(value, n) {
  if ((value % (n)) == 0)  return true
  else return false;
};

function concatAggregated(multiple_of, results) {
  var arr = _.takeRight(results, multiple_of/900000);
  var tf = [
    _.min(arr.map(function(e) {return e[1]})) || '', // low
    _.head(_.compact(arr.map(function(e) {return e[2]}))) || '', // open
    _.last(_.compact(arr.map(function(e) {return e[3]}))) || '', // close
    _.max(arr.map(function(e) {return e[4]})) || '', // high
    _.sum(_.compact(arr.map(function(e) {return e[5]}))) || '', // volume
  ];
  return tf;    
};
  
*/