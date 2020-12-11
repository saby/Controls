import {Record} from 'Types/entity';
import {IControlOptions} from 'UI/Base';
import {IFontSizeOptions} from 'Controls/interface';

/**
 * Интерфейс для контролов, отображающих "хлебные крошки".
 * @interface Controls/_breadcrumbs/interface/IBreadCrumbsOptions
 * @public
 * @author Красильников А.С.
 */
/*
 * Interface for breadcrumbs.
 *
 * @interface Controls/_breadcrumbs/interface/IBreadCrumbsOptions
 * @public
 * @author Авраменко А.С.
 */
export interface IBreadCrumbsOptions extends IControlOptions, IFontSizeOptions {
    items: Record[];
    keyProperty: string;
    parentProperty: string;
    displayProperty: string;
    containerWidth: number;
}

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#items
 * @cfg {Array.<Record>} Массив хлебных крошек.
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#items
 * @cfg {Array.<Record>} Array of breadcrumbs to draw.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#keyProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
 * @see parentProperty
 * @see displayProperty
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#keyProperty
 * @cfg {String} Name of the item property that uniquely identifies collection item.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#parentProperty
 * @cfg {String} Имя свойства, содержащего сведения о родительском узле.
 * @see keyProperty
 * @see displayProperty
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#parentProperty
 * @cfg {String} Name of the field that contains information about parent node.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#displayProperty
 * @cfg {String} Имя свойства элемента, содержимое которого будет отображаться.
 * @default title
 * @see keyProperty
 * @see parentProperty
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#displayProperty
 * @cfg {String} Name of the item property which content will be displayed.
 * @default title
 */

/**
 * @typedef {String} BackgroundStyle
 * @variant master Предназначен для настройки фона masterDetail
 * @variant stack Предназначен для настройки фона стековой панели.
 * @variant detailContrast
 * @variant listItem
 * @variant stackHeader
 * @variant default фон по-умолчанию
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#backgroundStyle
 * @cfg {BackgroundStyle} Префикс стиля для настройки фона внутренних компонентов хлебных крошек.
 * @default default
 * @remark
 * Согласно <a href="/doc/platform/developmentapl/interface-development/controls/list/list/background/">документации</a> поддерживаются любые произвольные значения опции.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#containerWidth
 * @cfg {Number} Ширина контейнера крошек.
 * Необходимо указывать для правильного расчета ширины вкладок.
 */

/**
 * @event Происходит после клика по хлебным крошкам.
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому произвели клик.
 */

/*
 * @event Happens after clicking on breadcrumb.
 * @name Controls/_breadcrumbs/interface/IBreadCrumbsOptions#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Record} item Key of the clicked item.
 */
