function get_ss(ss_name) {
  var files = DriveApp.getFilesByName(ss_name);
  while (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
};

function get_sheet_by_index_(ss, index) {
  return ss.get_sheet_by_index_()[index];
}

function get_sheet_data_(sheet) {
  return sheet.getDataRange().getValues();
}

function create_ss(ss_name) {
    
  var resource = {
    title: ss_name,
    mimeType: MimeType.GOOGLE_SHEETS,
    parents: [{ id: settings.folder_id }]
  }
  
  Drive.Files.insert(resource);
  var ss = get_ss_by_name_(ss_name);
  var sheet = get_sheet_by_index_(ss,0);
  sheet.setName(settings.tf);
  return ss;
};

var sh = (function (ns) {

  ns.getFolderId = function(){
    return storage.getAll()['folder_id'];
  };
  
  ns.getSsByName = function(ss_name) {
    var searchFor = "mimeType = 'application/vnd.google-apps.spreadsheet'"
    + "and title = '" + ss_name + "'"
    + "and '" + this.getFolderId() + "' in parents"
    var files = DriveApp.searchFiles(searchFor);
    while (files.hasNext()) {
      this.ss = SpreadsheetApp.open(files.next());
    }
    return this;
  }

  ns.setSsByName = function(ss_name) { 
    var resource = {
      title: ss_namgetPlotlyDatae,
      mimeType: MimeType.GOOGLE_SHEETS,
      parents: [{ id: this.getFolderId() }]
    }
    Drive.Files.insert(resource);
    this.ss = this.getSS(ss_name);
    return this
  };
  
  ns.getOrSetSsByName = function(ss_name) {
    this.ss = this.getSsByName(ss_name) || this.setSsByName(ss_name);
    return this;
  }
  
  ns.getSheetByIndex = function(index) {
    this.sheet = this.ss.getSheets()[index];
    return this;
  };
  
  ns.getSheetByName = function(sheet_name) {
    this.sheet = this.ss.getSheetByName(sheet_name);
    return this;
  };
  
  ns.setSheetByName = function(sheet_name, sheet_index, template) {
    // this one new developmente, not working;
    this.sheet = this.insertSheet(sheet_name, sheet_index, template);
    return this;  
  };
  
  ns.getOrSetSheetByName = function(sheet_name, sheet_index, template) {
    this.sheet = this.getSheetByName(sheet_name) || this.setSheetByName(sheet_name, sheet_index, template);
    return this;
  };
  
  ns.appendRows = function(data) {
    if (!this.sheet) this.getSsByName(this.ss_name).getSheetByName(this.sheet_name);

    var lastRow = this.sheet.getLastRow();
    var range = this.sheet.getRange(
      lastRow+1,
      1,
      data.length,
      data[0].length
    )
    range.setValues(data);
  };
  
  ns.expose = function(what) {
    return this[what];
  };
  
  ns.getSeries = function(start_ts, end_ts, filters){

    if (!this.sheet) this.getSsByName(this.ss_name).getSheetByName(this.sheet_name);

    // Handle optionals start_ts, end_ts and filters.
    var args = Array.prototype.slice.call(arguments);
    
    if (_.isArray(args[0])) {
      start_ts = null;
      end_ts = null;
      filters = args[0];
    }
    else if (_.isArray(args[1])) {
      end_ts = null;
      filters = args[1];    
    }
        
    if (filters) {
      filters.insert(0, 'timestamp');
    }
    
    // Get sheet data.
    var frozen_rows = this.sheet.getFrozenRows();
    var all_data = this.sheet.getDataRange().getValues();
    
    var headers_index = filters.map(function(filter) {
      return this.headers.indexOf(filter);
    }, {headers: all_data[frozen_rows-1]});
        
    var values = _.drop(all_data, frozen_rows);
    
    var series = filters.reduce(function(obj, filter, index) {
      obj['results'][filter] = obj.values.filter(function(line) {
        return line[0] >= this.start_ts && line[0] <= this.end_ts;
      }, {
        start_ts: parseInt(obj.start_ts),
        end_ts: parseInt(obj.end_ts)
      }).map(function(line) {
         return line[this.headers_index[this.index]];
      }, {
        headers_index: obj.headers_index,
        index: index
      });                                                                                                                       
       return obj;
    },{
      results: {},
      start_ts: start_ts,
      end_ts: end_ts,
      values: values,
      filters: filters,
      headers_index: headers_index})['results']

    this.series = series;
    return this;
  };
  
  return ns;
  
})(sh || {});

// to_timestamp detault is false
function roundDate(ts,round_minutes,to_timestamp){
  var date = new Date(ts)
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var m = (((minutes + 7.5)/round_minutes | 0) * round_minutes) % 60;
  var h = ((((minutes/105) + .5) | 0) + hours) % 24;
  date.setHours(h)
  date.setMinutes(m)
  date.setMilliseconds(0)
  if (to_timestamp) return date.getTime()
  return date;
};

function getSeriesFromSheet(userObj) {

  var exchange = userObj.exchange;
  var pair = userObj.pair;
  var tf = userObj.timeframe;
  // var from = (new Date(userObj.from + 'T00:00:00Z')).getTime();
  var from = parseInt(userObj.from)
  // var to = (new Date(userObj.to + 'T00:00:00Z')).getTime();
  var to = parseInt(userObj.to)
  
  return sh.getSsByName(exchange + "_" + pair).getSheetByIndex(0).getSeries(
    from,
    to,
    [tf+'_close', tf+'_open', tf+'_low', tf+'_high']
  ).expose('series');
};