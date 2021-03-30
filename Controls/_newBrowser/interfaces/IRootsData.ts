import {TKey} from 'Controls/_interface/IItems';

/**
 * Интерфейс описывает структуру данных, которая содержит информацию о
 * корневых каталогах master- и detail-списка.
 *
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IRootsData {
    /**
     * Идентификатор корневого каталога относительно которого показываются данные
     * в detail-колонке
     */
    detailRoot: TKey;

    /**
     * Идентификатор корневого каталога относительно которого показываются данные
     * в master-колонке
     */
    masterRoot: TKey;
}

/**
 * Тип допустимых данных, которые может вернуть пользовательский обработчик события
 * beforeRootChanged для того, что бы изменить логику проваливания.
 *
 * @public
 */
export type BeforeChangeRootResult = false | undefined | IRootsData;
