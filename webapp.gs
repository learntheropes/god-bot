/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url.replace('/exec', '/dev');
}

function doGet(e) {
  if (e.parameter.page === "hero") {
    return HtmlService.createTemplateFromFile('hero').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
  var p = HtmlService.createTemplateFromFile('template');
  var url = getScriptUrl();
  p.page = e.parameter.page || 'index';
  return p.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// <input type="date" name="from" placeholder="From" onselect="google.script.run.withSuccessHandler(logDate).dateSelect()">
function dateSelect() {
  var app = UiApp.createApplication();
  var handler = app.createServerHandler("change");
  var date = app.createDatePicker().setPixelSize(150, 150).addValueChangeHandler(handler).setId("date");
  app.add(date);
  return app;
}
