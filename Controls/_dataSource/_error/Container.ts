/// <amd-module name="Controls/_dataSource/_error/Container" />
import {Control, TemplateFunction} from 'UI/Base';
import _template = require('wml!Controls/_dataSource/_error/Container');
// @ts-ignore
import { constants } from 'Env/Env';
import { ViewConfig } from 'Controls/_dataSource/_error/Handler';
import Mode from 'Controls/_dataSource/_error/Mode';
// @ts-ignore
import { isEqual } from 'Types/object';
// @ts-ignore
import { load } from 'Core/library';
import { default as IContainer, IContainerConfig } from "Controls/_dataSource/_error/IContainer";
import Popup from './Popup';

/**
 * @interface Controls/dataSource/error/Container/Config
 * @extends Controls/_dataSource/_error/ViewConfig
 */
type Config = ViewConfig & {
    /**
     * @cfg {Boolean} [isShowed?]
     * @name Controls/dataSource/error/Container/Config#isShowed
     */
    isShowed?: boolean;
    /**
     * @cfg {String} [templateName?]
     * @name Controls/dataSource/error/Container/Config#templateName
     */
    templateName?: string;
    /**
     * @cfg {any} [template?]
     * @name Controls/dataSource/error/Container/Config#template
     */
    template?: any;
}
let getTemplate = (template: string | Control): Promise<Control> => {
    if (typeof template == 'string') {
        return load(template);
    }
    return Promise.resolve(template);
};
/**
 * Компонент для отображения шаблона ошибки по данным контрола {@link Controls/_dataSource/_error/Controller}
 * @class Controls/_dataSource/_error/Container
 * @extends Core/Control
 * @public
 * @author Санников К.А.
 *
 */
export default class Container extends Control implements IContainer {
    /**
     * @cfg {Controls/_dataSource/_error/Container/Config} Режим отображения
     */
    private _viewConfig: Config;
    private _lastShowedId: number;
    private _popupHelper: Popup = new Popup();

    protected _template: TemplateFunction = _template;
    /**
     * Скрыть компонент, отображающий данные об ошибке
     * @method
     * @public
     */
    hide(): void {
        let mode = this._viewConfig.mode;
        this._setConfig(null);
        if (mode == Mode.dialog) {
            return;
        }
        this._forceUpdate();
    }
    /**
     * Показать парковочный компонент, отображающий данные об ошибке
     * @param {Controls/_dataSource/_error/ViewConfig} viewConfig
     * @method
     * @public
     */
    show(viewConfig: ViewConfig) {
        if (viewConfig.mode == Mode.dialog) {
            return this._showDialog(viewConfig)
        }
        this._setConfig(viewConfig);
        this._forceUpdate();
    }
    protected _beforeMount(options: IContainerConfig) {
        this._updateConfig(options);
    }
    protected _beforeUpdate(options: IContainerConfig) {
        if (isEqual(options.viewConfig, this._options.viewConfig)) {
            return;
        }
        this._updateConfig(options);
    }
    protected _afterMount() {
        if (this._viewConfig) {
            this._showDialog(this._viewConfig);
        }
    }
    protected _afterUpdate() {
        if (this._viewConfig) {
            this._showDialog(this._viewConfig);
        }
    }
    private _showDialog(config: Config): void {
        if (
            config.isShowed ||
            config.mode !== Mode.dialog ||
            config.getVersion && config.getVersion() === this._lastShowedId ||
            !constants.isBrowserPlatform
        ) {
            return;
        }

        this._lastShowedId = config.getVersion && config.getVersion();
        config.isShowed = true;

        getTemplate(config.template).then((template) => {
            let result = this._notify('serviceError', [
                template,
                config.options,
                this
            ], { bubbling: true });

            if (!result) {
                result = this._popupHelper.openDialog(config, this);
            }

            if (result) {
                (result as Promise<null>).then(this._notifyDialogClosed.bind(this));
            }
        });
    }
    private _notifyDialogClosed() {
        this._notify('dialogClosed', []);
    }
    private _updateConfig(options: IContainerConfig) {
        this._setConfig(options.viewConfig);
        if (this._viewConfig) {
            this._viewConfig.isShowed = this._viewConfig.isShowed || this._viewConfig.mode !== Mode.dialog;
        }
    }
    private _setConfig(viewConfig?: ViewConfig) {
        if (!viewConfig) {
            this._viewConfig = null;
            return;
        }
        let templateName: string;
        if (typeof viewConfig.template == 'string') {
            templateName = viewConfig.template;
        }
        this._viewConfig = {
            ...viewConfig,
            templateName
        };
    }

    /**
     * Нужно загружать стили для показа диалога сразу.
     * При возникновении ошибки они могут не загрузиться (нет связи или сервис недоступен).
     */
    static _theme: string[] = ['Controls/popupConfirmation'];
}
