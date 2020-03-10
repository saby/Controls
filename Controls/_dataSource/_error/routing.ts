import { constants } from 'Env/Env';

/**
 * Функция устанавливает HTTP-код ответа при построении на сервере.
 * При вызове в браузере ничего не делает.
 * <h2>Аргументы функции</h2>
 *
 * Функция на вход приниает конфигурацию для отображения ошибки.
 * Подобный объект можно получить через вызов {@link Controls/dataSource:error.Controller#process}:
 * * status: Number - HTTP-код ответа;
 * * template: String - шаблон страницы, который будет построен, если не указан status;
 * * options: Object - опции шаблона, указанного в template.
 *
 * @class Controls/_dataSource/_error/routing
 * @public
 * @author Северьянов А.А.
 */
export default function routing(config: { status?: number; template: string; options?: object}): boolean {
    if (!constants.isServerSide ||
        !config.status && typeof config.template !== 'string' ||
        typeof process === 'undefined' || !process.domain || !process.domain.res) {
        return false;
    }

    if (config.status > 0) {
        process.domain.res.sendStatus(config.status);
        return true;
    }

    return false;
}
