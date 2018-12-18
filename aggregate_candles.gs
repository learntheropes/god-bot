function aggregate_test() {
  var settings = storage.getAll();
  var pair = 'tQSHUSD';
  var ss = get_ss_by_name_(settings.exchange + pair);
  var data = get_sheet_data_(ss, '5m');
  var aggr = get_aggregated_candles_(_.drop(data), '30m', ss)
}    

function get_aggregation_amount_(tf) {
  switch(tf) {
    case '15m':
      return 3;
      break;
    case '30m':
      return 6;
      break;
    case '1h':
      return 12;
      break;
    case '2h':
      return 12*2;
      break;
    case '4h':
      return 12*4;nomics
      break;
    case '1d':
      return 12*24;
      break;
    case '7d':
      return 12*24*7;
      break;
    default:
      throw ts + ' is an invalid timeframe.'
  }
}

function get_data_in_asc_(data) {
  var first = _.first(data)[0];
  var last = _.last(data)[0];
  if (first > last) {
    data = data.reverse();
  };
  return data;
}

function get_first_aggregated_ts_(data, tf, milli_tf, ss) {
  
  var sheet = get_sheet_by_name_(ss, tf);
  
  if (sheet) {
    var last_row = get_sheet_last_row_(sheet)
    if (last_row === 0) return get_first_aggregated_ts_from_data_(data,milli_tf);
    var range = sheet.getRange(last_row, 1, 1, 6)
    var first_ts = range.getValues()[0][0];
    if (! first_ts) {
      return get_first_aggregated_ts_from_data_(data,milli_tf);
    }
    range.clear()
    return parseInt(first_ts);
  } 
  else {
    return get_first_aggregated_ts_from_data_(data,milli_tf);
  }  
}

function get_first_aggregated_ts_from_data_(data,milli_tf) {
  var first_i = _.findIndex(data, function(o) {
    return (parseInt(o[0]) % parseInt(milli_tf) == 0)
  })
  return parseInt(data[first_i][0]);
}

function get_aggregated_candles_(data, tf, ss) {
  var results = [], sheet;
  sheet = get_sheet_by_name_(ss, tf);
  if (!sheet) {
    sheet = ss.insertSheet(tf); 
  }
  data = get_data_in_asc_(data);
  var last_ts = parseInt(_.last(data)[0]);
  
  var milli_tf = parseInt(get_aggregation_amount_(tf) * 1000 * 60 * 5);
  
  var first_ts = get_first_aggregated_ts_(data, tf, milli_tf, ss);
        
  for (step = first_ts; step < last_ts; step += milli_tf) {

    var group = data.filter(function(elem) {
      
      return ((elem[0] >= this.step) && (elem[0] < this.step + this.milli_tf));
    },{step:step,milli_tf:milli_tf}).map(function(elem) {
      
      elem[0] = this.step;
      return elem;
    },{step:step,milli_tf:milli_tf});
    
    if ( group.length !== 0) {
      var candle = [
        step,
        group[0][1],
        group[group.length-1][2],
        _.max(group.map(function(el) { return el[3]})),
        _.min(group.map(function(el) { return el[4]})),
        _.sum(group.map(function(el) { return el[5]})),
      ];
      results.push(candle)  
    }
  };
  sheet.getRange(1,1,results.length,6).setValues(results);
};