import {Logger} from 'UI/Utils';
// TODO: Удалить после удаления всех устаревших утилит
// https://online.sbis.ru/opendoc.html?guid=c0258219-1b73-4640-bc04-8be8770ea01a
const oldUtilLogger = (oldUtilName, newUtilName) => {
    Logger.error(`Используется устаревшая утилита ${oldUtilName}, используйте ${newUtilName}`);
};

export default oldUtilLogger;
