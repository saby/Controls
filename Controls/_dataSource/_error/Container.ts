/// <amd-module name="Controls/_dataSource/_error/Container" />
import { Control, TemplateFunction } from 'UI/Base';
import _template = require('wml!Controls/_dataSource/_error/Container');
import { constants } from 'Env/Env';
import { ViewConfig } from './Handler';
import Mode from './Mode';
import { isEqual } from 'Types/object';
import { load } from 'Core/library';
import { default as IContainer, IContainerConfig } from './IContainer';
import routing from './routing';

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
};

const getTemplate = (template: string | Control): Promise<Control> => {
    if (typeof template === 'string') {
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
export default class Container extends Control<IContainerConfig> implements IContainer {
    /**
     * @cfg {Controls/_dataSource/_error/Container/Config} Режим отображения
     */
    private __viewConfig: Config; // tslint:disable-line:variable-name
    private __lastShowedId: number; // tslint:disable-line:variable-name
    protected _template: TemplateFunction = _template;

    /**
     * Скрыть компонент, отображающий данные об ошибке
     * @method
     * @public
     */
    hide(): void {
        const mode = this.__viewConfig.mode;
        this.__setConfig(null);
        if (mode === Mode.dialog) {
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
    show(viewConfig: ViewConfig): void {
        if (viewConfig.mode === Mode.dialog) {
            return this.__showDialog(viewConfig);
        }
        this.__setConfig(viewConfig);
        this._forceUpdate();
    }

    protected _beforeMount(options: IContainerConfig): void {
        this.__updateConfig(options);
    }

    protected _beforeUpdate(options: IContainerConfig): void {
        if (isEqual(options.viewConfig, this._options.viewConfig)) {
            return;
        }
        this.__updateConfig(options);
    }

    protected _afterMount(): void {
        if (this.__viewConfig) {
            this.__showDialog(this.__viewConfig);
        }
    }

    protected _afterUpdate(): void {
        if (this.__viewConfig) {
            this.__showDialog(this.__viewConfig);
        }
    }

    private __showDialog(config: Config): void {
        if (
            config.isShowed ||
            config.mode !== Mode.dialog ||
            config.getVersion && config.getVersion() === this.__lastShowedId ||
            !constants.isBrowserPlatform
        ) {
            return;
        }
        this.__lastShowedId = config.getVersion && config.getVersion();
        config.isShowed = true;
        getTemplate(config.template).then((template) => {
            const result = this._notify('serviceError', [
                template,
                config.options,
                this
            ], { bubbling: true });
            if (result) {
                Promise.resolve(result).then(this.__notifyDialogClosed.bind(this));
            }
        });
    }

    private __notifyDialogClosed(): void {
        this._notify('dialogClosed', []);
    }

    private __updateConfig(options: IContainerConfig): void {
        this.__setConfig(options.viewConfig);
        if (this.__viewConfig) {
            this.__viewConfig.isShowed = this.__viewConfig.isShowed || this.__viewConfig.mode !== Mode.dialog;

            if (this.__viewConfig.mode === Mode.routing) {
                routing(this.__viewConfig);
            }
        }
    }

    private __setConfig(viewConfig?: ViewConfig): void {
        if (!viewConfig) {
            this.__viewConfig = null;
            return;
        }
        let templateName: string;
        if (typeof viewConfig.template === 'string') {
            templateName = viewConfig.template;
        }
        this.__viewConfig = {
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
