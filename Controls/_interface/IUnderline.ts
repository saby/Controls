export type TUnderline = 'hovered' | 'fixed' | 'none';

export interface IUnderlineOptions {
    underline?: TUnderline;
}

/**
 * Интерфейс для контролов, которые поддерживают разные стиль декоративной линии, отображаемой для текста.
 * @public
 * @author Красильников А.С.
 */
export default interface IUnderline {
    readonly '[Controls/_interface/IUnderline]': boolean;
}

/**
 * @name Controls/_interface/IUnderline#underline
 * @cfg {String} Стиль декоративной линии
 * @variant fixed всегда будет подчеркивание
 * @variant none никогда не будет подчеркивания
 * @variant hovered подчеркивание только по наведению
 * @default hovered
 */
