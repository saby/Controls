import {IAdditionalQueryParams, Direction} from './IAdditionalQueryParams';
import {RecordSet} from 'Types/collection';

/**
 * Интерфейс для работы с контроллерами пейджинации
 * @interface Controls/source/IQueryParamsController
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Pagination controller interface
 * @interface Controls/interface/IQueryParamsController
 * @private
 * @author Аверкиев П.А.
 */
export interface IQueryParamsController {
    /**
     * Вычисляет текущее состояние контроллера, например, текущую и следующую страницу, или позицию для навигации
     * @param list {Types/collection:RecordSet} объект, содержащий метаданные текущего запроса
     * @param direction {Direction} направление навигации ('up' или 'down')
     */
    /*
     * Calculates current controller state, i.e. current and next page, or position for navigation
     * @param list {Types/collection:RecordSet} object containing meta information for current request
     * @param direction {Direction} nav direction ('up' or 'down')
     */
    calculateState(list: RecordSet, direction?: Direction): void;

    /**
     * Метод для разрушения текущего объекта IQueryParamsController
     */
    /*
     * Destroy current object IQueryParamsController
     */
    destroy(): void;

    /**
     * Считает количество записей всего по мета информации из текущего состояния контроллера и ключу DataSet
     * @param rootKey свойство key в DataSet
     */
    /*
     * Calculates total records count by meta information from current controller state and DataSet key
     * @param rootKey DataSet key property
     */
    getAllDataCount(rootKey?: string|number): boolean | number;

    /**
     * Считает число записей, загружаемых за один запрос
     */
    /*
     * Calculates count of records loaded per request
     */
    getLoadedDataCount(): number;

    /**
     * Проверяет, есть ли ещё данные для загрузки
     * @param direction {Direction} nav direction ('up' или 'down')
     * @param rootKey свойство key в DataSet
     */
    /*
     * Checks if there any more data to load
     * @param direction {Direction} nav direction ('up' or 'down')
     * @param rootKey DataSet key property
     */
    hasMoreData(direction: Direction, rootKey: string|number): boolean|undefined;

    /**
     * Позволяет вручную установить текущее состояние контроллера, например, текущую и следующую страницу, или позицию
     * для навигации
     * @param state
     * TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
     */
    /*
     * Allows manual set of current controller state, i.e. current and next page, or position for navigation
     * @param state
     */
    setState(state: any): void;

    /**
     * Устанавливает текущую страницу в контроллере
     * при прокрутке при помощи скроллпэйджинга в самое начало или самый конец списка.
     * @param direction {Direction} направление навигации ('up' или 'down')
     */
    /*
     * Set current page in controller when scrolling with "scrollpaging" to the top or bottom of the list
     * @param direction {Direction} nav direction ('up' or 'down')
     */
    setEdgeState(direction: Direction): void;

    /**
     * Собирает параметры текущего состояния пейджинации для передачи их в Query
     * @param direction
     */
    /*
     * Collect current pagination state to pass them to Query object
     * @param direction
     */
    prepareQueryParams(direction: Direction): IAdditionalQueryParams;
}
