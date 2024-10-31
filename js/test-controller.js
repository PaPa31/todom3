// test-controller.js: Обновленная версия тестов для StateController

function runTests() {
  var tests = [
    function testFileProtocol() {
      var controller = new StateController(window.location.protocol); // Передаем текущий протокол
      console.assert(
        controller.getProtocol() === "file:",
        "Проверка протокола 'file:'"
      );
    },
    function testHTTPProtocol() {
      var controller = new StateController("http:"); // Проверка для HTTP
      console.assert(
        controller.getProtocol() === "http:",
        "Проверка протокола 'http:'"
      );
    },
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

if (window.location.search.indexOf("test=true") > -1) {
  runTests();
}
