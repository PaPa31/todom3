// test-controller.js с оберткой runTest из test-runner.js

function testEarliestTogglers() {
  const originalDarkMode = localStorage.getItem("todomDarkMode");
  const originalDateMode = localStorage.getItem("todomDateMode");

  // Тест функции isDarkMode
  runTest("Проверка включенного темного режима", function () {
    localStorage.setItem("todomDarkMode", "set");
    console.assert(isDarkMode() === "set", "Темный режим включен");
  });

  runTest("Проверка выключенного темного режима", function () {
    localStorage.removeItem("todomDarkMode");
    console.assert(isDarkMode() === null, "Темный режим выключен");
  });

  // Тест функции getDateMode
  runTest("Проверка режима даты по умолчанию", function () {
    localStorage.removeItem("todomDateMode");
    console.assert(
      getDateMode() === MODES.HIDE_BOTH,
      "Режим даты по умолчанию"
    );
  });

  // Тест функции toggleDateMode
  runTest("Проверка переключения режима даты", function () {
    const initialMode = getDateMode();
    const nextMode = toggleDateMode();
    console.assert(
      nextMode === (initialMode + 1) % 4,
      "Переключение режима даты"
    );
  });

  // Восстановление исходных значений
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

function testListOrderFunctions() {
  const originalListOrder = localStorage.getItem("todomListReverseOrder");
  const contentElement = document.getElementById("content");

  // Тест функции isReversed
  runTest("Проверка обратного порядка списка включена", function () {
    localStorage.setItem("todomListReverseOrder", "set");
    console.assert(isReversed() === "set", "Обратный порядок включен");
  });

  runTest("Проверка обратного порядка списка выключена", function () {
    localStorage.removeItem("todomListReverseOrder");
    console.assert(isReversed() === null, "Обратный порядок выключен");
  });

  // Тест функции toggleReversedMode
  runTest("Проверка класса 'reversed' добавлен", function () {
    contentElement.classList.remove("reversed");
    toggleReversedMode();
    console.assert(
      contentElement.classList.contains("reversed"),
      "Класс 'reversed' добавлен"
    );
  });

  runTest("Проверка класса 'reversed' удален", function () {
    toggleReversedMode();
    console.assert(
      !contentElement.classList.contains("reversed"),
      "Класс 'reversed' удален"
    );
  });

  // Восстанавливаем исходное значение и синхронизируем отображение
  if (originalListOrder !== null) {
    localStorage.setItem("todomListReverseOrder", originalListOrder);
  } else {
    localStorage.removeItem("todomListReverseOrder");
  }
  if (isReversed()) {
    contentElement.classList.add("reversed");
  } else {
    contentElement.classList.remove("reversed");
  }
}

function runProtocolTests() {
  runTest("Проверка протокола 'file:'", function () {
    var controller = new StateController("file:");
    if (window.location.protocol !== "file:") {
      throw new Error("Протокол тестирования не соответствует 'file:'");
    }
    console.assert(
      controller.getProtocol() === "file:",
      "Проверка протокола 'file:'"
    );
  });

  runTest("Проверка протокола 'http:'", function () {
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
  });
}

if (window.location.search.includes("test=true")) {
  testEarliestTogglers();
  testListOrderFunctions();
  runProtocolTests();
}
