import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';

// TODO: Удалить после удаления всех устаревших утилит
// https://online.sbis.ru/opendoc.html?guid=c0258219-1b73-4640-bc04-8be8770ea01a
const oldUtilLogger = (oldUtilName, newUtilName) => {
    if (constants.isBrowserPlatform) {
        Logger.error(`Используется устаревшая утилита ${oldUtilName}, используйте ${newUtilName}`);
    }
};

export default oldUtilLogger;
