// test-runner.js: Простая обертка для выполнения тестов

function runTest(testName, testFunc) {
  try {
    console.log(`Выполнение теста: ${testName}`);
    testFunc();
    console.log(`✅ ${testName} прошел успешно`);
  } catch (error) {
    console.error(`❌ Ошибка в тесте ${testName}:`, error.message);
  } finally {
    // Очистка после теста (можно расширить при необходимости)
    console.log(`Завершение теста: ${testName}`);
  }
}
