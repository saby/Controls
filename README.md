# yes
##
## Сборка и запуск.

1. Клонируйте репозиторий с контролами, например в папку `sbis3-controls` (все команды в следующих пунктах нужно будет выполнять в этой папке):

        git clone git@github.com:saby/wasaby-controls.git /path/to/sbis3-controls

1. Переключите репозиторий на нужную ветку, например rc-19.100:

        git checkout rc-19.100

1. Установите [Node.js](http://nodejs.org/) и [NPM](http://npmjs.com).

1. Установите зависимости:

        npm install

1. Cоберите проект:

        npm run build

1. Для запуска локального демо-стенда по адресу [localhost:777](http://localhost:777/) выполните:

        npm start

1. Для запуска юнит-тестов под Node.js выполните:

        npm test

1. Для запуска сервера с юнит-тестами по адресу [localhost:1025](http://localhost:1025/) выполните:

        npm run start:units

### Для ОС Linux

Для Linux последовательность действий идентична, однако есть ограничение - можно использовать любые порты, начиная с 2000. Поэтому сделайте следующее:

1. Найдите в корне папки `sbis3-controls` файл `app.js` и откройте его на редактирование:

    1. найдите строку:

            var port = process.env.PORT || 777;

    1. измените порт на 2666:

            var port = process.env.PORT || 2666;

1. Найдите в корне папки `sbis3-controls` файл `package.json` и откройте его на редактирование:

    1. найдите раздел `saby-units/url` и измените значение параметра `port`:

            "port": 1025

    1. на 2025:

            "port": 2025

