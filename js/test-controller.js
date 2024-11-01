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

// Тесты для функций в list-order.js
function testListOrderFunctions() {
  console.log("Запуск тестов для list-order.js");

  // Сохраняем исходное значение
  const originalListOrder = localStorage.getItem("todomListReverseOrder");
  const contentElement = document.getElementById("content"); // Инициализация один раз

  try {
    // Тест функции isReversed
    localStorage.setItem("todomListReverseOrder", "set");
    console.assert(
      isReversed() === "set",
      "Проверка обратного порядка списка включена"
    );

    localStorage.removeItem("todomListReverseOrder");
    console.assert(
      isReversed() === null,
      "Проверка обратного порядка списка выключена"
    );

    // Тест toggleReversedMode с переключением класса
    contentElement.classList.remove("reversed");
    toggleReversedMode();
    console.assert(
      contentElement.classList.contains("reversed"),
      "Класс 'reversed' добавлен"
    );

    toggleReversedMode();
    console.assert(
      !contentElement.classList.contains("reversed"),
      "Класс 'reversed' удален"
    );

    console.log("Тесты для list-order.js успешно завершены");
  } finally {
    // Восстанавливаем исходное значение в localStorage
    if (originalListOrder !== null) {
      localStorage.setItem("todomListReverseOrder", originalListOrder);
    } else {
      localStorage.removeItem("todomListReverseOrder");
    }

    // Устанавливаем класс 'reversed' в соответствии с значением в localStorage
    if (isReversed()) {
      contentElement.classList.add("reversed");
    } else {
      contentElement.classList.remove("reversed");
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
  testListOrderFunctions(); // Запуск тестов для list-order.js
  runTests(); // Запуск других тестов
}
