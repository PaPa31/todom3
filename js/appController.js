// appController.js
const appController = (() => {
    const protocol = window.location.protocol;

    // Инициализация состояния
    const state = {
        protocol: protocol,
        note: null,
        file: null,
        folder: null
    };

    // Загрузка скриптов для протокола
    const loadProtocolScripts = () => {
        if (protocol === "file:") {
            loadScript("js/protocol-file.js");
        } else if (protocol === "http:" || protocol === "https:") {
            loadScript("js/protocol-http.js");
        }
    };

    // Функция подгрузки скриптов
    const loadScript = (src) => {
        const script = document.createElement("script");
        script.src = src;
        document.head.appendChild(script);
    };

    // Действия для разных команд
    const actions = {
        createNote: () => {
            console.log("Creating new note");
            // Логика для создания заметки
        },
        openExistingNote: () => {
            state.note = localStorage.getItem("note") || null;
            console.log("Opening existing note from localStorage:", state.note);
        },
        openFile: () => {
            console.log("Opening file");
            // Логика для открытия файла
        },
        openFolder: () => {
            console.log("Opening folder");
            // Логика для открытия папки
        },
        saveFile: () => {
            console.log("Saving file");
            // Логика для сохранения файла
        }
    };

    // Инициализация приложения
    const initializeApp = () => {
        loadProtocolScripts();

        // Проверка протокола и инициализация в зависимости от него
        if (protocol === "file:") {
            actions.openExistingNote();
        } else if (protocol === "http:" || protocol === "https:") {
            actions.openExistingNote();
        }
    };

    return {
        initialize: initializeApp,
        actions: actions
    };
})();

// Инициализация приложения
document.addEventListener("DOMContentLoaded", appController.initialize);
