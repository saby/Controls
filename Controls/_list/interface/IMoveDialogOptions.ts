import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {TMoveItems} from './IMoveObject';

/**
 * @typedef {Function} TOnResultHandler
 * @description
 * Обработчик результата перемещения в диалоге
 * @param {Controls/_list/interface/IMoveObject/TMoveItems.typedef} items элементы, которые необходимо переместить
 * @param {Types/entity:Model} target элемент, к которому производится перемещение
 */
type TOnResultHandler = (items: TMoveItems, target: Model) => void;

/**
 * Интерфейс опций диалога перемещения
 * @interface Controls/_list/interface/IMoveDialogOptions
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Move dialog options
 * @interface Controls/_list/interface/IMoveDialogOptions
 * @public
 * @author Аверкиев П.А.
 */
export interface IMoveDialogOptions {
    /**
     * @name Controls/_list/interface/IMoveDialogOption#opener
     * @cfg {UI/Base:Control} Экземпляр контрола, из которого будет открыт диалог
     */
    /*
     * @name Controls/_mover/Controller/IMoveDialogOption#opener
     * @cfg {UI/Base:Control} Control instance from what the dialog will opened
     */
    opener: Control<IControlOptions, unknown> | null;
    /**
     * @name Controls/_list/interface/IMoveDialogOption#templateOptions
     * @cfg {Object} Опции для шаблона диалога
     */
    /*
     * @name Controls/_list/interface/IMoveDialogOption#templateOptions
     * @cfg {Object} dialog template options
     */
    templateOptions?: object;
    /**
     * @name Controls/_list/interface/IMoveDialogOption#template
     * @cfg {String|UI/Base:TemplateFunction|Control<IControlOptions, any>} Путь к шаблону диалога
     */
    /*
     * @name Controls/_list/interface/IMoveDialogOption#template
     * @cfg {String|UI/Base:TemplateFunction|Control<IControlOptions, any>} dialog template path
     */
    template?: string|TemplateFunction|Control<IControlOptions, any>;
    /**
     * @name Controls/_list/interface/IMoveDialogOption#onResultHandler
     * @cfg {TOnResultHandler} Обработчик результата перемещения в диалоге
     */
    /*
     * @name Controls/_list/interface/IMoveDialogOption#onResultHandler
     * @cfg {TOnResultHandler} Dialog move result handler
     */
    onResultHandler?: TOnResultHandler;
}
