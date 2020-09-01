import {Model} from 'Types/entity';
import {ISelectionObject, TKeySelection, TKeysSelection, TSelectionRecord} from 'Controls/interface';

/**
 * @typedef {String} MOVE_POSITION
 * @description
 * Тип перемещения - в items/source или custom
 */
export enum MOVE_TYPE {
    CUSTOM = 'Custom',
    MOVE_IN_ITEMS = 'MoveInItems'
}

/**
 * @typedef {String} MOVE_POSITION
 * @description
 * Позиция для перемещения записи
 */
export enum MOVE_POSITION {
    on = 'on',
    before = 'before',
    after = 'after'
}

/**
 * @typedef {Controls/interface:TKeySelection|Types/entity:Model} TMoveItem
 * @description
 * Перемещаемый элемент. Может быть Моделью или Id
 * @see Controls/interface:TKeySelection
 */
export type TMoveItem = Model|TKeySelection

/**
 * @typedef {Array<TMoveItem>|Controls/_list/interface/IMoveObject|Controls/interface:TSelectionRecord|Controls/interface:ISelectionObject} TMoveItems
 * @description
 * Перемещаемые элементы. Может быть набором Моделей или Id или Объектом ISelectionObject, объектом IMoveObject, или TSelectionRecord
 * @see Controls/_list/interface/IMoveObject
 * @see Controls/interface:TSelectionRecord
 * @see Controls/interface:ISelectionObject
 * @see ISelectionObject
 * @see TMoveItem
 */
export type TMoveItems = TMoveItem[]|IMoveObject|ISelectionObject|TSelectionRecord;

/**
 * Интерфейс объекта для перемещения в новой логике
 * @interface Controls/_list/interface/IMoveObject
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Move object interface
 * @interface Controls/_list/interface/IMoveObject
 * @public
 * @author Аверкиев П.А.
 */
export interface IMoveObject {
    /**
     * @name Controls/_list/interface/IMoveObject#selectedKeys
     * @cfg {Controls/interface:TKeysSelection} Список выбранных ключей для перемещения
     */
    /*
     * @name Controls/_mover/Controller/IMoveObject#selectedKeys
     * @cfg {Controls/interface:TKeysSelection}
     */
    selectedKeys: TKeysSelection;
    /**
     * @name Controls/_list/interface/IMoveObject#excludedKeys
     * @cfg {Controls/interface:TKeysSelection} Список выбранных ключей для исключения из перемещаемых элементов
     */
    /*
     * @name Controls/_mover/Controller/IMoveObject#excludedKeys
     * @cfg {Controls/interface:TKeysSelection}
     */
    excludedKeys: TKeysSelection;
    /**
     * @name Controls/_list/interface/IMoveObject#filter
     * @cfg {Controls/interface:TKeysSelection} Дополнительный фильтр, применяемый к перемещаемым записям
     */
    /*
     * @name Controls/_mover/Controller/IMoveObject#filter
     * @cfg {Controls/interface:TKeysSelection}
     */
    filter?: object;
}
