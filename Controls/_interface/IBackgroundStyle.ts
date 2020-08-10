export interface IBackgroundStyleOptions {
    backgroundStyle: string;
}

/**
 * Интерфейс для контролов, которые поддерживают настройку фона внутренних элементов.
 *
 * @interface Controls/_interface/IBackgroundStyle
 * @public
 * @author Красильников А.С.
 */
export default interface IBackgroundStyle {
    readonly '[Controls/_interface/IBackgroundStyle]': boolean;
}
/**
 * @name Controls/_interface/IBackgroundStyle#caption
 * @cfg {String} Определяет префикс стиля для настройки фона внутренних элементов контрола.
 * @default default (фон цвета темы)
 * @demo Controls-demo/Spoiler/Cut/BackgroundStyle/Index
 */
