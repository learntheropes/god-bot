/*
function fatch_and_store() {
  
  var settings = storage.getAll();
  
  reset_latest_timestamp(settings);
    
  for (step = 1; step <= settings.rate_limit; step++) {

    get_bitfinex_ohlc_(settings);
  };
};

function get_end_from_storage_(settings, pair) {
  return parseInt(settings[pair + '_end'])
};

function pair_is_finish_(sattings, pair) {
  return get_end_from_storage_(settings, pair) == 'end';
};

function get_end_from_sheet_(settings, pair) {
  var ss = get_ss_by_name_(settings.exchange + pair);
  var sheet = get_sheet_by_name_(ss, this.settings.tf);
  var last_row = get_sheet_last_row_(sheet);
  return parseInt(sheet.getRange(last_row,1).getValue()) - 300000 || ''; 
};

function reset_latest_timestamp_(settings) {
  if(!settings) settings = storage.getAll();  
  settings.pairs.forEach(function(pair) {
    if (!pair_is_finish_(this.settings, pair)) {
      var end = get_end_from_sheet_(this.settings, pair).toString();
      storage.set(pair + '_end', end);
    }
  }, {settings:settings})
};

function get_request_objects_(settings) {
    
  return settings.pairs.filter(function(pair) {
  
    return (!pair_is_finish_(this.settings, pair));
  
  },{settings:settings}).map(function(pair) {
    var end = get_end_from_sheet_(this.settings, pair);
    var url = 'https://api.bitfinex.com/v2/candles/trade:' + this.settings.tf + ':' + pair + '/hist?end=' + end;
    Logger.log(url)
    return {
      url: url,
      muteHttpExceptions: true,
      method: 'get',
    }
  }, {settings:settings});
};

function save_responses_(settings, request_objects, responses) {
  
  responses.map(function(response, index) {
    
    var data = JSON.parse(response.getContentText());
  
    var pair = this.settings.pairs[index];
    
    if (data.error) {
      
      save_error_(settings, [JSON.stringify(request_objects[index]), JSON.stringify(data)]);
    }
    else {
      if (data.length !== 0) {
        var end = data[data.length-1][0];
        storage.set(pair + '_end', end.toString());
        save_to_sheet_(this.settings, pair, data);
      }
      else {
        storage.set(pair + '_end', 'end');
      }
    }
  }, {settings: settings});
};

function get_bitfinex_ohlc_(settings) {
    
  var request_objects = get_request_objects_(settings);
    
  var responses = UrlFetchApp.fetchAll(request_objects);
  
  return save_responses_(settings, request_objects, responses);
};
  
function save_to_sheet_(settings, pair, data) {
  var ss, ss_name = settings.exchange + pair;
  ss = get_ss_by_name_(ss_name);
  if (!ss) ss = create_ss_(ss_name);
  var sheet = get_sheet_by_name_(ss, settings.tf);
  var lastRow = get_sheet_last_row_(sheet);
  var range = sheet.getRange(lastRow+1, 1, data.length, 6)
  return range.setValues(data); 
};

function save_error_(settings, data) {
    var ss = get_ss_by_name_(settings.exchange + 'errors');
    var sheet = get_sheet_by_index_(ss,0);
    sheet.appendRow(data);
};

var end = (function (ns) {
  ns.get = function (pair) {
    return storage.get(pair + '_end');
  };
  ns.set = function (pair, data) {
    if (data.length) storage.set(pair + '_end', 'end');
    else storage.set(pair + '_end', data[data.length-1][0] - 900)
  };
  return ns;
})(end || {});
*/