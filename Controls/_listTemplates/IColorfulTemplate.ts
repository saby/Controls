import {TemplateFunction} from 'UI/Base';

/**
 * Тема оформления элементов на подложке.
 */
export type Theme = 'dark' | 'light';

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
     * Текст описания.
     */
    description?: string;
    /**
     * Имя поля записи, отвечающей за доминантный цвет изображения.
     */
    dominantColorProperty: keyof T;
    /**
     * Имя поля записи, отвечающей за комплиментарный цвет изображения.
     */
    complementaryColorProperty: keyof T;
    /**
     * Имя поля записи, отвечающей за тему доминантного цвета изображения.
     * Поддерживаются значения типа {@link Theme}.
     * @remark
     * В зависимости от темы определяется оформление элементов распологаемых на подложке доминантного цвета.
     */
    dominantThemeColorProperty: keyof T;
    /**
     * Шаблон подвала.
     */
    footerTemplate: TemplateFunction;
}
