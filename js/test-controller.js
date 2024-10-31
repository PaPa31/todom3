// test-controller.js: тест-контроллер для функций StateController

function runTests() {
  var tests = [
    function testProtocol() {
      var controller = new StateController("file:");
      console.assert(
        controller.getProtocol() === "file:",
        "Проверка протокола 'file:'"
      );
    },
    function testDefaultProtocol() {
      var controller = new StateController("http:");
      console.assert(
        controller.getProtocol() === "http:",
        "Проверка протокола 'http:'"
      );
    },
    // Добавляйте новые тесты для контроллера здесь
  ];

  tests.forEach(function (test) {
    try {
      test();
      console.log(test.name + " прошел успешно.");
    } catch (e) {
      console.error(test.name + " не прошел:", e);
    }
  });
}

// Запускайте тесты, когда параметр "test=true" указан в URL
if (window.location.search.indexOf("test=true") > -1) {
  runTests();
}
