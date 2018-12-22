function INDICATORS(ohlcv) {
  
  "use strict";
  
  if (!(this instanceof INDICATORS)){
    return new INDICATORS();
  };
  
  this.ohlcv = ohlcv.open;
  this.close = ohlcv.close;
  this.low = ohlcv.low;
  this.high = ohlcv.high;
  this.volume = ohlcv.volume;
  
  function BOLL(high, low, close, periods, sdn) {
    if (!periods) { periods = 20; }
    if (!sdn) { sdn = 2; }
    var tp = [];
    for (var i = 0; i < close.length; i++) {
      tp.push((high[i] + low[i] + close[i]) / 3);
    }
    var middleBand = SMA(tp, periods);
    var sd = standardDeviation(tp, periods);
    var upperBand = [];
    var lowerBand = [];
    for (var i = 0; i < close.length; i++) {
      if (sd[i] !== null && middleBand[i] !== null) {
        upperBand.push(middleBand[i] + sdn * sd[i]);
        lowerBand.push(middleBand[i] - sdn * sd[i]);
      }
      else {
        upperBand.push(null);
        lowerBand.push(null);
      }
    }
    return [lowerBand, middleBand, upperBand];
  };
  
  this.BOLL = function(settings) {
    return BOLL(this.high, this.low, this.close, settings.periods, settings.sdn);
  };
  
  
  function CCI(high, low, close, periods) {
    if (!periods) { periods = 26; }
    var highestHigh = highest(high, periods);
    var lowestLow = lowest(low, periods);
    var tp = [];
    for (var i = 0; i < close.length; i++) {
      tp.push((highestHigh[i] + lowestLow[i] + close[i]) / 3);
    }
    var atp = SMA(tp, periods);
    var di = [];
    for (var i = 0; i < close.length; i++) {
      di.push(atp[i] - close[i]);
    }
    var md = SMA(di, periods);
    var cci = [];
    for (var i = 0; i < close.length; i++) {
      cci.push((tp[i] - atp[i]) / (0.015 * md[i]));
    }
    return cci;
  };
  
  this.CCI = function(settings) {
    return CCI(this.high, this.low, this.close, settings.periods);
  };
  
  function DMA(close, fast, slow) {
    if (!fast) { fast = 10; }
    if (!slow) { slow = 50; }
    var result1 = SMA(close, fast);
    var result2 = SMA(close, slow);
    var dif = [];
    for (var i = 0; i < close.length; i++) {
      dif.push(result1[i] - result2[i]);
    }
    return dif;
  }
  
  this.DMA = function(settings) {
    return DMA(this.close, settings.fast, settings.slow);
  };
  
  
  function MINUS_DM(high, low, periods) {
    if (!periods) { periods = 14; }
    var minusDM = [0];
    for (var i = 1; i < high.length; i++) {
      var deltaHigh = high[i - 1] - high[i];
      var deltaLow = low[i] - low[i - 1];
      if ((deltaHigh < 0 && deltaLow < 0) || deltaHigh == deltaLow) {
        minusDM.push(0);
      }
      else if (deltaHigh > deltaLow) {
        minusDM.push(0);
      }
      else if (deltaHigh < deltaLow) {
        minusDM.push(deltaLow);
      }
    }
    return minusDM;
  }
  function PLUS_DM(high, low, periods) {
    if (!periods) { periods = 14; }
    var plusDM = [0];
    for (var i = 1; i < high.length; i++) {
      var deltaHigh = high[i - 1] - high[i];
      var deltaLow = low[i] - low[i - 1];
      if ((deltaHigh < 0 && deltaLow < 0) || deltaHigh == deltaLow) {
        plusDM.push(0);
      }
      else if (deltaHigh > deltaLow) {
        plusDM.push(deltaHigh);
      }
      else if (deltaHigh < deltaLow) {
        plusDM.push(0);
      }
    }
    return plusDM;
  }
  function TR(high, low, close, periods) {
    if (!periods) { periods = 14; }
    var trueR = [high[0] - low[0]];
    for (var i = 1; i < high.length; i++) {
      var trueHigh = void 0;
      var trueLow = void 0;
      if (high[i] > close[i - 1]) {
        trueHigh = high[i];
      }
      else {
        trueHigh = close[i - 1];
      }
      if (low[i] < close[i - 1]) {
        trueLow = low[i];
      }
      else {
        trueLow = close[i - 1];
      }
      trueR.push(trueHigh - trueLow);
    }
    return trueR;
  }
  function PLUS_DI(high, low, close, periods) {
    if (!periods) { periods = 14; }
    var plusDM = [0];
    var trueR = [high[0] - low[0]];
    for (var i = 1; i < high.length; i++) {
      var deltaHigh = high[i - 1] - high[i];
      var deltaLow = low[i] - low[i - 1];
      if ((deltaHigh < 0 && deltaLow < 0) || deltaHigh == deltaLow) {
        plusDM.push(0);
      }
      else if (deltaHigh > deltaLow) {
        plusDM.push(deltaHigh);
      }
      else if (deltaHigh < deltaLow) {
        plusDM.push(0);
      }
      var trueHigh = void 0;
      var trueLow = void 0;
      if (high[i] > close[i - 1]) {
        trueHigh = high[i];
      }
      else {
        trueHigh = close[i - 1];
      }
      if (low[i] < close[i - 1]) {
        trueLow = low[i];
      }
      else {
        trueLow = close[i - 1];
      }
      trueR.push(trueHigh - trueLow);
    }
    var plusDMSum = [];
    var trueRSum = [];
    for (var i = 0; i < periods - 1; i++) {
      plusDMSum.push(null);
      trueRSum.push(null);
    }
    plusDMSum.push(plusDM.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    trueRSum.push(trueR.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    for (var i = periods - 1; i < high.length; i++) {
      plusDMSum.push(plusDMSum[i - 1] - plusDMSum[i - 1] / periods + plusDM[i]);
      trueRSum.push(trueRSum[i - 1] - trueRSum[i - 1] / periods + trueR[i]);
    }
    var plusDI = [];
    for (var i = 0; i < close.length; i++) {
      if (trueRSum[i] !== null) {
        plusDI.push(100 * (plusDMSum[i] / trueRSum[i]));
      }
      else {
        plusDI.push(null);
      }
    }
    return plusDI;
  }
  function MINUS_DI(high, low, close, periods) {
    if (!periods) { periods = 14; }
    var minusDM = [0];
    var trueR = [high[0] - low[0]];
    for (var i = 1; i < high.length; i++) {
      var deltaHigh = high[i - 1] - high[i];
      var deltaLow = low[i] - low[i - 1];
      if ((deltaHigh < 0 && deltaLow < 0) || deltaHigh == deltaLow) {
        minusDM.push(0);
      }
      else if (deltaHigh > deltaLow) {
        minusDM.push(0);
      }
      else if (deltaHigh < deltaLow) {
        minusDM.push(deltaLow);
      }
      var trueHigh = void 0;
      var trueLow = void 0;
      if (high[i] > close[i - 1]) {
        trueHigh = high[i];
      }
      else {
        trueHigh = close[i - 1];
      }
      if (low[i] < close[i - 1]) {
        trueLow = low[i];
      }
      else {
        trueLow = close[i - 1];
      }
      trueR.push(trueHigh - trueLow);
    }
    var minusDMSum = [];
    var trueRSum = [];
    for (var i = 0; i < periods - 1; i++) {
      minusDMSum.push(null);
      trueRSum.push(null);
    }
    minusDMSum.push(minusDM.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    trueRSum.push(trueR.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    for (var i = periods - 1; i < high.length; i++) {
      minusDMSum.push(minusDMSum[i - 1] - minusDMSum[i - 1] / periods + minusDM[i]);
      trueRSum.push(trueRSum[i - 1] - trueRSum[i - 1] / periods + trueR[i]);
    }
    var minusDI = [];
    for (var i = 0; i < close.length; i++) {
      if (trueRSum[i] !== null) {
        minusDI.push(100 * (minusDMSum[i] / trueRSum[i]));
      }
      else {
        minusDI.push(null);
      }
    }
    return minusDI;
  }
  function DX(high, low, close, periods) {
    if (!periods) { periods = 14; }
    var minusDM = [0];
    var plusDM = [0];
    var trueR = [high[0] - low[0]];
    for (var i = 1; i < high.length; i++) {
      var deltaHigh = high[i - 1] - high[i];
      var deltaLow = low[i] - low[i - 1];
      if ((deltaHigh < 0 && deltaLow < 0) || deltaHigh == deltaLow) {
        plusDM.push(0);
        minusDM.push(0);
      }
      else if (deltaHigh > deltaLow) {
        plusDM.push(deltaHigh);
        minusDM.push(0);
      }
      else if (deltaHigh < deltaLow) {
        plusDM.push(0);
        minusDM.push(deltaLow);
      }
      var trueHigh = void 0;
      var trueLow = void 0;
      if (high[i] > close[i - 1]) {
        trueHigh = high[i];
      }
      else {
        trueHigh = close[i - 1];
      }
      if (low[i] < close[i - 1]) {
        trueLow = low[i];
      }
      else {
        trueLow = close[i - 1];
      }
      trueR.push(trueHigh - trueLow);
    }
    var plusDMSum = [];
    var minusDMSum = [];
    var trueRSum = [];
    for (var i = 0; i < periods - 1; i++) {
      plusDMSum.push(null);
      minusDMSum.push(null);
      trueRSum.push(null);
    }
    plusDMSum.push(plusDM.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    minusDMSum.push(minusDM.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    trueRSum.push(trueR.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    for (var i = periods - 1; i < high.length; i++) {
      plusDMSum.push(plusDMSum[i - 1] - plusDMSum[i - 1] / periods + plusDM[i]);
      minusDMSum.push(minusDMSum[i - 1] - minusDMSum[i - 1] / periods + minusDM[i]);
      trueRSum.push(trueRSum[i - 1] - trueRSum[i - 1] / periods + trueR[i]);
    }
    var minusDI = [];
    var plusDI = [];
    for (var i = 0; i < close.length; i++) {
      if (trueRSum[i] !== null) {
        plusDI.push(100 * (plusDMSum[i] / trueRSum[i]));
        minusDI.push(100 * (minusDMSum[i] / trueRSum[i]));
      }
      else {
        minusDI.push(null);
        plusDI.push(null);
      }
    }
    var dx = [];
    for (var i = 0; i < close.length; i++) {
      if (minusDI[i] !== null && plusDI[i] !== null) {
        dx.push(Math.abs(plusDI[i] - minusDI[i]) / (plusDI[i] + minusDI[i]) * 100);
      }
      else {
        dx.push(null);
      }
    }
    return dx;
  }
  function ADX(high, low, close, periods) {
    if (!periods) { periods = 14; }
    return SMA(DX(high, low, close, periods), periods);
  }
  function ADXR(high, low, close, periods) {
    if (!periods) { periods = 14; }
    var adx = ADX(high, low, close, periods);
    var adxr = [];
    for (var i = 0; i < periods; i++) {
      adxr.push(null);
    }
    for (var i = periods; i < adx.length; i++) {
      adxr.push((adx[i] - adx[i - periods]) / 2);
    }
    return adxr;
  }
  function DMI(high, low, close, periods) {
    if (!periods) { periods = 14; }
    var minusDM = [0];
    var plusDM = [0];
    var trueR = [high[0] - low[0]];
    for (var i = 1; i < high.length; i++) {
      var deltaHigh = high[i - 1] - high[i];
      var deltaLow = low[i] - low[i - 1];
      if ((deltaHigh < 0 && deltaLow < 0) || deltaHigh == deltaLow) {
        plusDM.push(0);
        minusDM.push(0);
      }
      else if (deltaHigh > deltaLow) {
        plusDM.push(deltaHigh);
        minusDM.push(0);
      }
      else if (deltaHigh < deltaLow) {
        plusDM.push(0);
        minusDM.push(deltaLow);
      }
      var trueHigh = void 0;
      var trueLow = void 0;
      if (high[i] > close[i - 1]) {
        trueHigh = high[i];
      }
      else {
        trueHigh = close[i - 1];
      }
      if (low[i] < close[i - 1]) {
        trueLow = low[i];
      }
      else {
        trueLow = close[i - 1];
      }
      trueR.push(trueHigh - trueLow);
    }
    var plusDMSum = [];
    var minusDMSum = [];
    var trueRSum = [];
    for (var i = 0; i < periods - 1; i++) {
      plusDMSum.push(null);
      minusDMSum.push(null);
      trueRSum.push(null);
    }
    plusDMSum.push(plusDM.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    minusDMSum.push(minusDM.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    trueRSum.push(trueR.slice(0, periods).reduce(function (pre, cur, index, arr) {
      return pre + cur;
    }));
    for (var i = periods - 1; i < high.length; i++) {
      plusDMSum.push(plusDMSum[i - 1] - plusDMSum[i - 1] / periods + plusDM[i]);
      minusDMSum.push(minusDMSum[i - 1] - minusDMSum[i - 1] / periods + minusDM[i]);
      trueRSum.push(trueRSum[i - 1] - trueRSum[i - 1] / periods + trueR[i]);
    }
    var minusDI = [];
    var plusDI = [];
    for (var i = 0; i < close.length; i++) {
      if (trueRSum[i] !== null) {
        plusDI.push(100 * (plusDMSum[i] / trueRSum[i]));
        minusDI.push(100 * (minusDMSum[i] / trueRSum[i]));
      }
      else {
        minusDI.push(null);
        plusDI.push(null);
      }
    }
    var dx = [];
    for (var i = 0; i < close.length; i++) {
      if (minusDI[i] !== null && plusDI[i] !== null) {
        dx.push(Math.abs(plusDI[i] - minusDI[i]) / (plusDI[i] + minusDI[i]) * 100);
      }
      else {
        dx.push(null);
      }
    }
    var adx = SMA(dx, periods);
    var adxr = [];
    for (var i = 0; i < periods; i++) {
      adxr.push(null);
    }
    for (var i = periods; i < adx.length; i++) {
      adxr.push((adx[i] - adx[i - periods]) / 2);
    }
    return [minusDI, plusDI, adx, adxr];
  };
  
  this.DMI = function(settings) {
    return DMI(this.high, this.low, this.close, settings.periods);
  };
  
  function SMA(close, periods) {
    if (!periods) { periods = 30; }
    var result = [];
    var queue = [];
    for (var i = 0; i < periods - 1; i++) {
      queue.push(close[i]);
      result.push(null);
    }
    for (var i = periods - 1; i < close.length; i++) {
      queue.push(close[i]);
      result.push(queue.reduce(function (pre, cur, index, arr) {
        return pre + cur;
      }) / periods);
      queue.shift();
    }
    return result;
  };
  
  this.SMA = function(settings) {
    return SMA(this.close, settings.periods) 
  };
  
  function EMA(close, periods) {
    if (!periods) { periods = 30; }
    var k = 2 / (periods + 1);
    var result = [close[0]];
    for (var i = 1; i < close.length; i++) {
      result.push(k * close[i] + (1 - k) * result[i - 1]);
    }
    return result;
  };
  
  this.EMA = function(settings) {
    return EMA(this.close, settings.periods);
  };
  
  function MACD(close, fast, slow, signal) {
    if (!fast) { fast = 12; }
    if (!slow) { slow = 26; }
    if (!signal) { signal = 9; }
    var ema1 = EMA(close, fast);
    var ema2 = EMA(close, slow);
    var diff = [];
    for (var i = 0; i < close.length; i++) {
      diff.push(ema2[i] - ema1[i]);
    }
    var dea = SMA(diff, signal);
    var macd = [];
    for (var i = 0; i < close.length; i++) {
      if (dea[i] !== null) {
        macd.push(diff[i] - dea[i]);
      }
      else {
        macd.push(null);
      }
    }
    return [diff, dea, macd];
  };
  
  this.MACD = function(settings){
    return MACD(this.close, settings.fast, settings.slow, settings.signal);
  };
  
  function MTM(close, periods) {
    if (!periods) { periods = 12; }
    var mtm = [];
    for (var i = 0; i < periods; i++) {
      mtm.push(null);
    }
    for (var i = periods; i < close.length; i++) {
      mtm.push(close[i] - close[i - periods]);
    }
    return mtm;
  };
  
  this.MTM = function(settings) {
    return MTM(this.close, settings.periods);  
  };
  
  function OBV(close, volume) {
    var obv = [volume[0]];
    for (var i = 1; i < close.length; i++) {
      if (close[i] > close[i - 1]) {
        obv.push(obv[i - 1] + volume[i]);
      }
      else if (close[i] < close[i - 1]) {
        obv.push(obv[i - 1] - volume[i]);
      }
      else {
        obv.push(obv[i - 1]);
      }
    }
    return obv;
  };
  
  this.OBV = function(){
    return OBV(this.close, this.volume);
  };
  
  function ROC(close, periods) {
    if (!periods) { periods = 12; }
    var roc = [];
    for (var i = 0; i < periods; i++) {
      roc.push(null);
    }
    for (var i = periods; i < close.length; i++) {
      roc.push((close[i] - close[i - periods]) / close[i - periods] * 100);
    }
    return roc;
  };
  
  this.ROC = function(settings){
    return ROC(this.close, settings.periods);
  };
  
  function RSI(close, periods) {
    if (!periods) { periods = 14; }
    var up = [0];
    var dn = [0];
    for (var i = 1; i < close.length; i++) {
      if (close[i] > close[i - 1]) {
        up.push(close[i] - close[i - 1]);
        dn.push(0);
      }
      else {
        up.push(0);
        dn.push(close[i - 1] - close[i]);
      }
    }
    var upma = SMA(up, periods);
    var dnma = SMA(dn, periods);
    var rsi = [];
    for (var i = 0; i < close.length; i++) {
      rsi.push(upma[i] / (upma[i] + dnma[i]) * 100);
    }
    return rsi;
  };
  
  this.RSI = function(settings) {
    return RSI(this.close, settings.periods);
  };
  
  function TRIX(close, periods) {
    if (!periods) { periods = 12; }
    var tr = EMA(EMA(EMA(close, periods), periods), periods);
    var trix = [null];
    for (var i = 1; i < close.length; i++) {
      trix.push((tr[i] - tr[i - 1]) / tr[i] * 100);
    }
    return trix;
  };
  
  this.TRIX = function(settings) {
    return TRIX(this.close, settings.periods);
  };
  
  function lowest(arr, periods) {
    var result = [];
    var queue = [];
    for (var i = 0; i < periods - 1; i++) {
      queue.push(arr[i]);
      result.push(Math.min.apply(null, queue));
    }
    for (var i = periods - 1; i < arr.length; i++) {
      queue.push(arr[i]);
      result.push(Math.min.apply(null, queue));
      queue.shift();
    }
    return result;
  };
  
  this.lowest = function(arr, periods){
    return lowest(arr, periods);
  };
  
  function highest(arr, periods) {
    var result = [];
    var queue = [];
    for (var i = 0; i < periods - 1; i++) {
      queue.push(arr[i]);
      result.push(Math.max.apply(null, queue));
    }
    for (var i = periods - 1; i < arr.length; i++) {
      queue.push(arr[i]);
      result.push(Math.max.apply(null, queue));
      queue.shift();
    }
    return result;
  };
  
  this.highest = function(arr, periods){
    return highest(arr, periods);
  };
  
  function standardDeviation(arr, periods) {
    var result = [];
    var queue = [];
    for (var i = 0; i < periods - 1; i++) {
      queue.push(arr[i]);
      result.push(null);
    }
    for (var i = periods - 1; i < arr.length; i++) {
      queue.push(arr[i]);
      var ave = queue.reduce(function (pre, cur, index, arr) {
        return pre + cur;
      }) / queue.length;
      var d = 0;
      for (var x = 0; x < queue.length; x++) {
        d = d + Math.pow(queue[x] - ave, 2);
      }
      var sd = Math.sqrt(d / queue.length);
      result.push(sd);
      queue.shift();
    }
    return result;
  }
  
  this.standardDeviation = function(arr, periods){
    return standardDeviation(arr, periods);
  };
}