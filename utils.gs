var _ = lodash.load();

Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

var storage = (function (ns) {
  ns.get = function(key) {
    var val = PropertiesService
    .getScriptProperties()
    .getProperty(key);
    return isJson.parse(val);
  };
  ns.set = function(key,val) {
    PropertiesService
    .getScriptProperties()
    .setProperty(key, isJson.stringify(val));
  };
  
  ns.getAll = function() {
    var vals = PropertiesService
    .getScriptProperties()
    .getProperties();
    return Object.keys(vals)
    .reduce(function(obj, key) {
      obj[key] = isJson.parse(vals[key]);
      return obj;
    },{})
  };
  return ns;
})(storage || {});

var isJson = (function (ns) {
  ns.stringify = function (item) {
    return (typeof item === 'object') ?
      JSON.stringify(item) : item;
  };
  ns.parse = function(item) {
    var isJsonString = function(variable) {
      try {JSON.parse(variable);}
      catch (e) {return false;};
      return true;
    }
    return (isJsonString(item)) ?
      JSON.parse(item) : item;
  };
  return ns;
})(isJson || {});

var qs = (function (ns) {
  
  ns.querify = function(obj) {
    return Object.keys(obj).reduce(function(p, e, i) {
      return p + (i == 0 ? "" : "&") + (Array.isArray(obj[e]) ? obj[e].reduce(function(str, f, j) {
          return str + e + "=" + encodeURIComponent(f) + (j != obj[e].length - 1 ? "&" : "") 
        },"") : e + "=" + encodeURIComponent(obj[e]));
    },"");
  };
  
  ns.parse = function(query) {
    return query.split('&').reduce(function(p,e) {
      var k = e.split('=')[0], v = e.split('=')[1];
      if (p[k] == null) p[k] = decodeURIComponent(v)
      else if (_.isString(p[k])) p[k] = [p[k],v]
      else p[k].push(v);
      return p;
    },{})
  };
  
  return ns;
  
})(qs || {});

function convert_tf_to_ms(tf) {
  switch(tf) {
    case '5m':
      return 300000;
      break;
    case '15m':
      return 900000;
      break;
    case '30m':
      return 1800000;
      break;
    case '1h':
      return 3600000;
      break;
    case '2h':
      return 7200000;
      break;
    case '4h':
      return 14400000;
      break;
    case '1d':
      return 86400000;
      break;
    case '1w':
      return 604800000;
      break;
    default:
      throw ts + ' is an invalid timeframe.'
  }
};