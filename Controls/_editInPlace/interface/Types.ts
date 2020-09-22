import {Model} from 'Types/entity';

/**
 * @typedef {String} CONSTANTS
 * @description
 * Набор констант, использующихся в редактировании по месту
 * @variant CANCEL позволяет отменить асинхронную операцию, вернув значение из функции обратного вызова до начала операции.
 */
export enum CONSTANTS {
    CANCEL = 'Cancel'
}

/**
 * @typedef {String|Number|Null} TKey
 * @description Тип ключа редактируемого элемента
 */
export type TKey = string | number | null;

/**
 * @typedef {Promise.<void | { canceled: true }>} TOperationPromise
 * @description Тип возвращаемого значения из операций редактирования по месту
 */
export type TOperationPromise = Promise<void | { canceled: true }>;

/**
 * @typedef {void|CONSTANTS.CANCEL|Promise.<void|{CONSTANTS.CANCEL}>} TBeforeCallbackBaseResult
 * @description Базовый тип, который можно вернуть из любой функций обратного вызова до начала операции редактирования по месту
 */
type TBeforeCallbackBaseResult = void | CONSTANTS.CANCEL | Promise<void | CONSTANTS.CANCEL>;

/**
 * @typedef {Function} TBeforeBeginEditCallback
 * @description Функция обратного вызова перед запуском редактирования
 * @param options Набор опций для запуска редактирования. Доступные свойства: item {Types/entity:Model} - запись для которой запускается редактирование.
 * @param isAdd Флаг, принимает значение true, если запись добавляется
 */
export type TBeforeBeginEditCallback =
    (options: { item?: Model }, isAdd: boolean) => TBeforeCallbackBaseResult | Model | Promise<Model>;

/**
 * @typedef {Function} TBeforeEndEditCallback
 * @description Функция обратного вызова перед завершением редактирования
 * @param {Types/entity:Model} item Редактируемая запись для которой запускается завершение редактирования.
 * @param willSave Флаг, принимает значение true, если ожидается, что запись будет сохранена.
 * @param isAdd Флаг, принимает значение true, если запись добавляется
 */
export type TBeforeEndEditCallback = (item: Model, willSave: boolean, isAdd: boolean) => TBeforeCallbackBaseResult;
