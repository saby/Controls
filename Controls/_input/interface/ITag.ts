export type TagStyle = 'info' | 'danger' | 'primary' | 'success' | 'warning' | 'secondary';

export interface ITagOptions {
    tagStyle?: TagStyle;
}

/**
 * Интерфейс тега (цветной индикатор, который отображается в правом верхнем углу поля).
 *
 * @interface Controls/_input/interface/ITag
 * @public
 * @author Красильников А.С.
 */
export interface ITag {
    readonly '[Controls/_input/interface/ITag]': boolean;
}

/**
 * @typedef {String} TagStyle
 * @description Допустимые значения для опции {@link tagStyle}.
 * @variant info
 * @variant danger
 * @variant primary
 * @variant success
 * @variant warning
 * @variant secondary
 */

/**
 * @name Controls/_input/interface/ITag#tagStyle
 * @cfg {TagStyle} Стиль отображения тега.
 * @demo Controls-demo/Input/TagStyles/Index
 */

/**
 * @event Происходит при клике на тег.
 * @name Controls/_input/interface/ITag#tagClick
 * @param {UICommon/Events:SyntheticEvent}} event Дескриптор события.
 * @param {SVGElement} tag Тег, по которому кликнули.
 * @remark Событие никогда не произойдет, если вы не укажете опцию {@link tagStyle}.
 * @demo Controls-demo/Input/TagEvents/Index
 * @see tagStyle
 * @see tagHover
 */
/**
 * @event Происходит при наведении курсора мыши на тег.
 * @name Controls/_input/interface/ITag#tagHover
 * @param {UICommon/Events:SyntheticEvent}} event Дескриптор события.
 * @param {SVGElement} tag Тег, на который навели курсор мыши.
 * @remark Событие никогда не произойдет, если вы не укажете опцию {@link tagStyle}.
 * @demo Controls-demo/Input/TagEvents/Index
 * @see tagStyle
 * @see tagClick
 */
