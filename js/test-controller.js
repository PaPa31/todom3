// test-controller.js: Строгая версия тестов для StateController

function runTests() {
  var tests = [
      function testFileProtocol() {
          var controller = new StateController("file:");
          if (window.location.protocol !== "file:") {
              throw new Error("Протокол тестирования не соответствует 'file:'");
          }
          console.assert(
              controller.getProtocol() === "file:",
              "Проверка протокола 'file:'"
          );
      },
      function testHTTPProtocol() {
          var controller = new StateController("http:");
          if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
              throw new Error("Протокол тестирования не соответствует 'http:' или 'https:'");
          }
          console.assert(
              controller.getProtocol() === "http:",
              "Проверка протокола 'http:'"
          );
      }
  ];

  tests.forEach(function (test) {
      try {
          test();
          console.log(test.name + " прошел успешно.");
      } catch (e) {
          console.error(test.name + " не прошел:", e.message);
      }
  });
}

if (window.location.search.indexOf("test=true") > -1) {
  runTests();
}
