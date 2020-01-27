/// <amd-module name="Controls/_dataSource/_error/Container" />
import Control = require('Core/Control');
import template = require('wml!Controls/_dataSource/_error/Container');
// @ts-ignore
import { constants } from 'Env/Env';
import { ViewConfig } from 'Controls/_dataSource/_error/Handler';
import Mode from 'Controls/_dataSource/_error/Mode';
// @ts-ignore
import { isEqual } from 'Types/object';
// @ts-ignore
import { load } from 'Core/library';
import { default as IContainer, IContainerConfig } from "Controls/_dataSource/_error/IContainer";

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
    private __viewConfig: Config;
    private __lastShowedId: number;
    protected _template = template;
    _options: IContainerConfig;
    _forceUpdate;
    _notify;
    /**
     * Скрыть компонент, отображающий данные об ошибке
     * @method
     * @public
     */
    hide(): void {
        let mode = this.__viewConfig.mode;
        this.__setConfig(null);
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
            return this.__showDialog(viewConfig)
        }
        this.__setConfig(viewConfig);
        this._forceUpdate();
    }
    protected _beforeMount(options: IContainerConfig) {
        this.__updateConfig(options);
    }
    protected _beforeUpdate(options: IContainerConfig) {
        if (isEqual(options.viewConfig, this._options.viewConfig)) {
            return;
        }
        this.__updateConfig(options);
    }
    protected _afterMount() {
        if (this.__viewConfig) {
            this.__showDialog(this.__viewConfig);
        }
    }
    protected _afterUpdate() {
        if (this.__viewConfig) {
            this.__showDialog(this.__viewConfig);
        }
    }
    private __showDialog(config: Config) {
        if (
            config.isShowed ||
            config.mode != Mode.dialog ||
            config.getVersion && config.getVersion() == this.__lastShowedId ||
            !constants.isBrowserPlatform
        ) {
            return;
        }
        this.__lastShowedId = config.getVersion && config.getVersion();
        config.isShowed = true;
        getTemplate(config.template).then((template) => {
            let result: Promise<void> = this._notify('serviceError', [
                template,
                config.options,
                this
            ], { bubbling: true });
            if (result) {
                result.then(this.__notifyDialogClosed.bind(this));
            }
        });
    }
    private __notifyDialogClosed() {
        this._notify('dialogClosed', []);
    }
    private __updateConfig(options: IContainerConfig) {
        this.__setConfig(options.viewConfig);
        if (this.__viewConfig) {
            this.__viewConfig.isShowed = this.__viewConfig.isShowed || this.__viewConfig.mode !== Mode.dialog;
        }
    }
    private __setConfig(viewConfig?: ViewConfig) {
        if (!viewConfig) {
            this.__viewConfig = null;
            return;
        }
        let templateName: string;
        if (typeof viewConfig.template == 'string') {
            templateName = viewConfig.template;
        }
        this.__viewConfig = {
            ...viewConfig,
            templateName
        };
    }
}
