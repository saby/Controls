/**
 * @typedef {String} TagStyle
 * @variant info
 * @variant danger
 * @variant primary
 * @variant success
 * @variant warning
 * @variant secondary
 */
export type TagStyle = 'info' | 'danger' | 'primary' | 'success' | 'warning' | 'secondary';

/**
 * Интерфейс тега (цветной индикатор, который отображается в правом верхнем углу поля).
 *
 * @interface Controls/_input/interface/ITag
 * @public
 * @author Красильников А.С.
 */
export interface ITagOptions {
    /**
     * @name Controls/_input/interface/ITag#tagStyle
     * @cfg {TagStyle} Стиль отображения тега.
     * @demo Controls-demo/Input/TagStyles/Index
     */
    tagStyle?: TagStyle;
}

/**
 * @event Происходит при клике на тег.
 * @name Controls/_input/interface/ITag#tagClick
 * @param {SyntheticEvent} event Дескриптор события.
 * @param {SVGElement} tag Тег по которому кликнули.
 * @remark Событие никогда не запустится, если вы не укажете опцию tagStyle.
 * @demo Controls-demo/Input/TagEvents/Index
 * @see tagStyle
 * @see tagHover
 */

/**
 * @event Происходит при наведении курсора мыши на тег.
 * @name Controls/_input/interface/ITag#tagHover
 * @param {SyntheticEvent} event Дескриптор события.
 * @param {SVGElement} tag Тег по которому кликнули.
 * @remark Событие никогда не запустится, если вы не укажете опцию tagStyle.
 * @demo Controls-demo/Input/TagEvents/Index
 * @see tagStyle
 * @see tagClick
 */

interface ITag {
    readonly '[Controls/_input/interface/ITag]': boolean;
}

export default ITag;