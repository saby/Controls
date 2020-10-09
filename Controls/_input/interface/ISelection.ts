export interface ISelectionOptions {
    selectionStart: number;
    selectionEnd: number;
}

/**
 * Интерфейс для контролов, которые поддерживают выделения текста в поле ввода.
 * @remark
 * Если значения {@link selectionStart} и {@link selectionEnd} равны, то текст не выделяется, но значение указывает на положение каретки внутри поля.
 *
 * @interface Controls/_input/interface/ISelection
 * @public
 * @author Красильников А.С.
 */
export interface ISelection {
    readonly '[Controls/input/interface:ISelection]': boolean;
}

/**
 * @name Controls/_input/interface/ISelection#selectionStart
 * @cfg {Number} Начало выделения области текста в поле ввода.
 * Значение указывает на порядковый номер первого символа в выделенном фрагменте относительно всего текста.
 */
/**
 * @name Controls/_input/interface/ISelection#selectionEnd
 * @cfg {Number} Конец выделения области текста в поле ввода.
 * Значение указывает на порядковый номер последнего символа в выделенном фрагменте относительно всего текста.
 */
