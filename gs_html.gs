function doGet(e) {
return HtmlService.createTemplateFromFile('html_index')
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

// <input type="date" name="from" placeholder="From" onselect="google.script.run.withSuccessHandler(logDate).dateSelect()">
function dateSelect() {
  var app = UiApp.createApplication();
  var handler = app.createServerHandler("change");
  var date = app.createDatePicker().setPixelSize(150, 150).addValueChangeHandler(handler).setId("date");
  app.add(date);
  return app;
}

function saveMainTf() {
  return 
}
