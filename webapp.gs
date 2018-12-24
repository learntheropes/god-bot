/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url.replace('/exec', '/dev');
}

function doGet(e) {
  var p = HtmlService.createTemplateFromFile('template');
  var url = getScriptUrl();
  p.page = e.parameter.page || 'index';
  return p
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('TST | ' + e.parameter.page);
}


function storeStrategy(input) {
  var my_strategies = storage.get('my_strategies') || {};
  my_strategies[input.name] = input.settings;
  storage.set('my_strategies', my_strategies)
  return storage.get("my_strategies")
}

function getStrategies(input) {
  return storage.get(input) || {};
}

// <input type="date" name="from" placeholder="From" onselect="google.script.run.withSuccessHandler(logDate).dateSelect()">
function dateSelect() {
  var app = UiApp.createApplication();
  var handler = app.createServerHandler("change");
  var date = app.createDatePicker().setPixelSize(150, 150).addValueChangeHandler(handler).setId("date");
  app.add(date);
  return app;
}


function saveTemp(){
  storage.set('my_strategies', {a:1,b:2})
  storage.set('public_strategies',{c:3,d:4})
}
