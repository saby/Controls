import rk = require('i18n!Controls');

export = function (args) {
    if (!args.value) {
        return true;
    }

    return (args.value.length > 3) || rk ('Введите больше 3 символов');
}
