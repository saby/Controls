import rk = require('i18n!Controls');

// tslint:disable-next-line
export function LengthChecker(args) {
    if (!args.value) {
        return true;
    }
// tslint:disable-next-line
    return (args.value.length > 3) || rk('Введите больше 3 символов');
}

// tslint:disable-next-line
export function ChangedChecker(args) {
    return  (args.changed === 'Changed') || rk('Данные не изменились');
}
