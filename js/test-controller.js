// Тесты для earliest-togglers.js с сохранением исходного состояния

function testEarliestTogglers() {
  console.log("Запуск тестов для earliest-togglers.js");

  // Сохранение исходных значений в localStorage
  const originalDarkMode = localStorage.getItem("todomDarkMode");
  const originalDateMode = localStorage.getItem("todomDateMode");

  try {
    // Тест функции isDarkMode
    localStorage.setItem("todomDarkMode", "set");
    console.assert(
      isDarkMode() === "set",
      "Проверка включенного темного режима"
    );
    localStorage.removeItem("todomDarkMode");
    console.assert(
      isDarkMode() === null,
      "Проверка выключенного темного режима"
    );

    // Тест функции getDateMode с проверкой значения по умолчанию
    localStorage.removeItem("todomDateMode");
    console.assert(
      getDateMode() === MODES.HIDE_BOTH,
      "Проверка режима даты по умолчанию"
    );

    // Тест toggleDateMode: проверка перехода между режимами
    const initialMode = getDateMode();
    const nextMode = toggleDateMode();
    console.assert(
      nextMode === (initialMode + 1) % 4,
      "Проверка переключения режима даты"
    );

    console.log("Тесты для earliest-togglers.js успешно завершены");
  } finally {
    // Восстанавливаем исходные значения в localStorage
    if (originalDarkMode !== null) {
      localStorage.setItem("todomDarkMode", originalDarkMode);
    } else {
      localStorage.removeItem("todomDarkMode");
    }

    if (originalDateMode !== null) {
      localStorage.setItem("todomDateMode", originalDateMode);
    } else {
      localStorage.removeItem("todomDateMode");
    }
  }
}

// Строгая версия тестов для проверки протокола

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
      if (
        window.location.protocol !== "http:" &&
        window.location.protocol !== "https:"
      ) {
        throw new Error(
          "Протокол тестирования не соответствует 'http:' или 'https:'"
        );
      }
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
      console.error(test.name + " не прошел:", e.message);
    }
  });
}

if (window.location.search.includes("test=true")) {
  testEarliestTogglers(); // Запуск тестов для earliest-togglers.js
  runTests(); // Запуск других тестов
}
