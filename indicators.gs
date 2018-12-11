function calculate_indicators(sourceData, sma_periods, ema_periods, macd_periods) {
  var indicators = new INDICATORS_LIB(sourceData.timestamps, sourceData.OHLC, sourceData.volumes);
  var sma = indicators.getSMA(sma_periods);
  var ema = indicators.getEMA(ema_periods);
  var macd = indicators.getMACD(macd_periods);
  var macd_line = macd.line;
  var macd_signal = macd.signal;
  var macd_histogram = macd.histogram;

  // Crosess
  var indicators_arrays = [sma, ema, macd_line, macd_signal, macd_histogram];
  var indicators_names = ['sma', 'ema', 'macd_line', 'macd_signal', 'macd_histogram'];
  var crosses = indicators_arrays.reduce(function(obj, first_indicator, index) {
    indicators_arrays.forEach(function(second_indicator, i) {
      if (this.index !== i) {
        var key = indicators_names[index]+'_'+indicators_names[i];
        var val = indicators.getCrosses(this.sourceData.timestamps, this.first_indicator, second_indicator);
        obj[key] = val
      }
    }, {first_indicator: first_indicator, index: index, sourceData: obj.sourceData});
    return obj;
  }, {sourceData: sourceData, res: {}})['res'];
  
  return {
    timestamps: sourceData.timestamps,
    ohlc: sourceData.OHLC,
    volumes: sourceData.volumes,
    sma: sma,
    ema: ema,
    macd : {
      line: macd_line,
      signal: macd_signal,
      histogram: macd_histogram,    
    },
    crosses: crosses,
  }
}

function INDICATORS_LIB(timestamps, OHLC, volumes) {

  this.timestamps = timestamps;
  this.OHLC = OHLC;
  this.volumes = volumes;
  
  this.getSMA = function(periods, data) {
    
    // Defaults periods = 5
    if (!periods) periods = 5;
    
    // Default data is closure price.
    if (!data ) data = this.OHLC.getColumn(3);
    
    var result = data.map(function(close, index){
      var current_array = _.takeRight(_.dropRight(this.data, index),this.periods);
      return (current_array.length === this.periods) ? _.mean(current_array) : null;
      }, {periods: periods, data: data}).reverse();

    return result
  };
  
  this.getEMA = function(periods, data) {
    
    // Defaults periods = 10
    if (!periods) periods = 10;
    
    // Default data is closures
    if (!data) data = this.OHLC.getColumn(3);
    
    // Initial SMA: periods-period sum / 10 
    var initial_SMA = this.getSMA(periods);

    // Multiplier: (2 / (Time periods + 1) )
    var multiplier = 2 / (periods + 1);
    
    // EMA: {Close - EMA(previous day)} x multiplier + EMA(previous day). 
    return data.reduce(function(accumulator, elem, index) {
      if (accumulator['SMA'][index] == null) {
        accumulator['EMA'].push(null);
      }
      else if (accumulator['SMA'][index-1] == null) {
        accumulator['EMA'].push(accumulator['SMA'][index]);
      }
      else {
        var previousEma = accumulator['EMA'][index-1];
        accumulator['EMA'].push(multiplier * (elem - previousEma) + previousEma);
      }
      return accumulator;
    }, {SMA: initial_SMA, multiplier: multiplier, EMA : []})['EMA']
  };
  
  this.getMACD = function(periods, data) {
    
    // Define standard periods
    if (!periods) periods = [12,26,9];
    
    // Default data is closures
    if (!data) data = this.OHLC.getColumn(3);
    
    // MACD Line: (12-day EMA - 26-day EMA)

    var EMA12 = this.getEMA(periods[0], data), EMA26 = this.getEMA(periods[1], data);
    
    var last_null_MACD_line_index = 0;
    
    var MACD_line = EMA12.map(function(ema12, index) {
      var ema26 = this[index];
      if (ema12 && ema26) {
        var result = ema12- ema26;
      }
      else {
        var result = null;
        last_null_MACD_line_index = index;
      }
      return result;
    }, EMA26);
    
    // Signal Line: 9-day EMA of MACD Line
    var MACD_signal = newArray(last_null_MACD_line_index, null)
                      .concat(this.getEMA(periods[2], MACD_line));
    
    // MACDd3 Histogram: MACD Line - Signal Line
    var MACD_histogram = MACD_line.map(function(line, index) {
      var signal = this[index];
      return (line && signal) ? (line - signal) : null;
    },MACD_signal);
    
    return {
      line: MACD_line,
      signal: MACD_signal,
      histogram: MACD_histogram
    }
  };
  
  this.getCrosses = function(timestamp, first_indicator, second_indicator) {
    
    var crosses = [];
    first_indicator.forEach(function(elem, index) {
      var current_first = elem, current_second = second_indicator[index];
      var current = (current_first > current_second) ? 0 : 1;
      if (index !== 0) {
        var last_first = first_indicator[index];
        var last_second = second_indicator[index];
        var last = (last_first > last_second) ? 0 : 1;
        // Mance da gestire last_first - last_second = 0
        if (last !== current) {
          var current_timestamp = timestamp[index];
          var last_timestamp = timestamp[index-1]
          var timestamp_diff = current_timestamp - last_timestamp;
          var current_diff = current_first - current_second;
          var last_diff = last_first - last_second;
          var ratio_diff = (current_diff / (current_diff + last_diff)) * timestamp_diff;
          
          // Cross timestamp and 0 if first > second, else 1;
          crosses.push([current_timestamp - timestamp_diff, current])
        }
      }
    });
    
    // [[1143239546,0],[1343239546,1],[1543239546,0]]
    return crosses;
  };
};