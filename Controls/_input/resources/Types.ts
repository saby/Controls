export type IInputType = 'insert' | 'delete' | 'deleteBackward' | 'deleteForward';

export interface ISelection {
    start: number;
    end: number;
}
export interface ISplitValue {
    after: string;
    before: string;
    insert: string;
    delete: string;
}

/**
 * Область выделения текста в поле ввода.
 * @remark
 * Если значения {@link start} и {@link end} равны, то текст не выделяется, но значение указывает на положение каретки внутри поля.
 *
 * @interface Controls/_input/resources/Types:ISelection
 * @public
 * @author Красильников А.С.
 */
/**
 * @name Controls/_input/resources/Types:ISelection#start
 * @cfg {Number} Начало выделения области текста в поле ввода.
 * Значение указывает на порядковый номер первого символа в выделенном фрагменте относительно всего текста.
 */
/**
 * @name Controls/_input/resources/Types:ISelection#end
 * @cfg {Number} Конец выделения области текста в поле ввода.
 * Значение указывает на порядковый номер последнего символа в выделенном фрагменте относительно всего текста.
 */

