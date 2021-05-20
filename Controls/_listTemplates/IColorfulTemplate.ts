import {TemplateFunction} from 'UI/Base';

/**
 * Тема оформления элементов на подложке.
 */
export type Theme = 'dark' | 'light';

/**
 * Набор имён полей записи, данные которой используются для стилизации по изображению.
 * @param T запись.
 */
export interface IColorProperties<T> {
    /**
     * Имя поля записи, отвечающей за доминантный цвет изображения.
     */
    dominant: keyof T;
    /**
     * Имя поля записи, отвечающей за комплиментарный цвет изображения.
     */
    complimentary: keyof T;
    /**
     * Имя поля записи, отвечающей за тему доминантного цвета изображения.
     * Поддерживаются значения типа {@link Theme}.
     * @remark
     * В зависимости от темы определяется оформление элементов распологаемых на подложке доминантного цвета.
     */
    dominantTheme: keyof T;
}

/**
 * Шаблон отображения записи в {@link Controls/columns:View многоколоночном списке}, который стилизуется в зависимости от изображения.
 *
 * @class Controls/listTemplates/ColorfulTemplate
 * @mixes Controls/columns:ItemTemplate
 *
 * @param T запись.
 *
 * @see Controls/columns:View
 *
 * @public
 */
export interface IColorfulTemplateOptions<T> {
    /**
     * Текст заголовка.
     */
    title: string;
    /**
     * Текст дополнительной информации.
     */
    additionalText?: string;
    /**
     * Набор имён полей для стилизации.
     */
    colorProperty: IColorProperties<T>;
    /**
     * Шаблон подвала.
     */
    footerTemplate: TemplateFunction;
}
