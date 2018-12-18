function INDICATORS_LIB(series) {

  this.series = series;
  
  this.MA = function(periods) {
    while (i >= periods && i <= this.series.length) {
      return _.mean(_.takeRight(_.compact(series.slice(0, i)), periods));
      i++;
    }
  };
  
  this.EMA = function(periods) {
  
  }
  
  
  this.EMA = function(periods) {
 
    var initial_SMA = this.SMA(periods);

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
  
  this.MACD = function(periods, data) {
    
    // Define standard periods
    if (!periods) periods = [12,26,9];
    
    // Default data is closures
    if (!data) data = this.OHLC.getColumn(3);
    
    // MACD Line: (12-day EMA - 26-day EMA)

    var EMA12 = this.EMA(periods[0], data), EMA26 = this.EMA(periods[1], data);
    
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
                      .concat(this.EMA(periods[2], MACD_line));
    
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