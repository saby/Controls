/// <amd-module name="Controls/_dataSource/_error/Container" />
import { Control, TemplateFunction } from 'UI/Base';
import _template = require('wml!Controls/_dataSource/_error/Container');
import { constants } from 'Env/Env';
import { Mode, Popup, ViewConfig } from 'Controls/error';
import { isEqual } from 'Types/object';
import { load } from 'Core/library';
import { default as IContainer, IContainerConfig } from './IContainer';

interface IInlistTemplateOptions {
    listOptions: object;
}

/**
 * @interface Controls/dataSource/error/Container/Config
 * @extends Controls/_dataSource/_error/ViewConfig
 */
type Config<OptionsType = object> = ViewConfig<OptionsType> & {
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
 * Компонент для отображения сообщения об ошибки на основе данных, полученных от контроллера {@link Controls/_dataSource/_error/Controller}.
 * Может отображать сообщение об ошибке разными способами:
 * - в диалоговом окне;
 * - вместо своего содержимого;
 * - в заглушке, которая растягивается во всю страницу поверх всего остального.
 * @class Controls/_dataSource/_error/Container
 * @extends Core/Control
 * @public
 * @author Северьянов А.А.
 *
 */
export default class Container extends Control<IContainerConfig> implements IContainer {
    private __viewConfig: Config; // tslint:disable-line:variable-name
    private __lastShowedId: number; // tslint:disable-line:variable-name
    private _popupHelper: Popup = new Popup();
    protected _template: TemplateFunction = _template;

    /**
     * Идентификатор текущего открытого диалога. Одновременно отображается только один диалог.
     */
    private _popupId: string;

    /**
     * Скрыть сообщение об ошибке.
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
     * Показать сообщение об ошибке.
     * @param {Controls/_dataSource/_error/ViewConfig} viewConfig
     * @method
     * @public
     */
    show(viewConfig: ViewConfig): void {
        if (viewConfig && viewConfig.mode === Mode.dialog) {
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
            /**
             * Если viewConfig не изменился для режима отображения ошибки в списке,
             * то обновляем опции списка, чтобы он корректно обновлялся
             */
            if (options.viewConfig?.mode === Mode.inlist) {
                this._updateInlistOptions(options);
            }
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

    protected _beforeUnmount(): void {
        this._closeDialog();
    }

    /**
     * Закрыть ранее открытый диалог.
     */
    private _closeDialog(): void {
        this._popupHelper.closeDialog(this._popupId);
        this._popupId = null;
    }

    /**
     * Обработчик закрытия диалога.
     */
    private _onDialogClosed(): void {
        this._notify('dialogClosed', []);
        this._popupId = null;
    }

    /**
     * Открыть диалог.
     * Если есть незакрытый диалог, открытый этим контролом, то сначала он будет закрыт.
     * @param config Конфигурация с шаблоном диалога и опциями для этого шаблона.
     */
    private _openDialog(config: Config): Promise<void> {
        this._closeDialog();

        return this._popupHelper.openDialog(config, this, {
            onClose: () => this._onDialogClosed()
        }).then((popupId) => {
            this._popupId = popupId;
        });
    }

    private _notifyServiceError(template: Control, options: object): Promise<IDialogData> {
        return this._notify('serviceError', [template, options, this], { bubbling: true });
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
        getTemplate(config.template)
            .then((dialogTemplate) => this._notifyServiceError(dialogTemplate, config.options))
            .then((dialogData: IDialogData) => {
                /**
                 * Controls/popup:Global ловит событие 'serviceError'.
                 * В Wasaby окружении Controls/popup:Global есть на каждой странице в виде глобальной обертки.
                 * На старых страницах этого нет, поэтому если errorContainer
                 * был создан в контроле, который был вставлен в старое окружение ws3 с помощью Core/create,
                 * то событие 'serviceError' будет некому ловить и результата _notify не будет.
                 * Тогда гарантированно показываем диалог с помощью popupHelper.
                 */
                if (!dialogData) {
                    return this._openDialog(config);
                }

                this._popupId = dialogData.popupId;
                dialogData.closePopupPromise.then(() => this._onDialogClosed());
            });
    }

    private __updateConfig(options: IContainerConfig): void {
        this.__setConfig(options.viewConfig);

        if (this.__viewConfig) {
            this.__viewConfig.isShowed = this.__viewConfig.isShowed || this.__viewConfig.mode !== Mode.dialog;

            if (this.__viewConfig.mode === Mode.inlist) {
                // __updateConfig вызывается при первом возникновении ошибки.
                // Здесь прокидываем опции для списка в список
                this._updateInlistOptions(options);
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

    private _updateInlistOptions(options: IContainerConfig): void {
        this.__viewConfig.options = {
            ...this.__viewConfig.options
        };
        (this.__viewConfig as Config<IInlistTemplateOptions>).options.listOptions = options;
    }

    /**
     * Нужно загружать стили для показа диалога сразу.
     * При возникновении ошибки они могут не загрузиться (нет связи или сервис недоступен).
     */
    static _theme: string[] = ['Controls/popupConfirmation'];
}

interface IDialogData {
    popupId: string;
    closePopupPromise: Promise<void>;
}
