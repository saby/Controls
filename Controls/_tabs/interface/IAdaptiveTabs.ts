import {IControlOptions} from 'UI/Base';
import {SbisService} from 'Types/source';
import {ISingleSelectableOptions, IItemsOptions} from 'Controls/interface';
export interface IAdaptiveTabs {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean;
}

/**
 * Интерфейс для опций контрола адаптивных вкладок.
 * @interface Controls/_tabs/interface/IAdaptiveTabs
 * @public
 * @author Бондарь А.В.
 */

export interface IAdaptiveTabsOptions extends IControlOptions, ISingleSelectableOptions, IItemsOptions<object> {
    source?: SbisService;
    style?: string;
    displayProperty?: string;
    align?: string;
    containerWidth: number;

}

/**
 * @typedef {String} Style
 * @variant primary
 * @variant secondary
 */

/**
 * @name Controls/_tabs/interface/IAdaptiveTabs#style
 * @cfg {Style} Стиль отображения вкладок.
 * @default primary
 * @remark
 * Если стандартная тема вам не подходит, вы можете переопределить переменные:
 *
 * * @border-color_Tabs-item_selected_primary
 * * @text-color_Tabs-item_selected_primary
 * * @border-color_Tabs-item_selected_secondary
 * * @text-color_Tabs-item_selected_secondary
 */

/**
 * @name Controls/_tabs/interface/IAdaptiveTabs#source
 * @cfg {Types/source:Base} Object that implements ISource interface for data access.
 * @default undefined
 */

/**
 * @name Controls/_tabs/interface/IAdaptiveTabs#align
 * @cfg {String} Выравнивание вкладок по правому или левому краю.
 * @variant left Вкладки выравниваются по левому краю.
 * @variant right Вкладки выравниваются по правому краю.
 * @default right
 */

/**
 * @name Controls/_tabs/interface/IAdaptiveTabs#containerWidth
 * @cfg {Number} Ширина контейнера вкладок. Необходимо указывать для правильного расчета ширины вкладок.
 */
