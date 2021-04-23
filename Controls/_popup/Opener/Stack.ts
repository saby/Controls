import { default as BaseOpener, IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import {IStackOpener, IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import openPopup from 'Controls/_popup/utils/openPopup';
import CancelablePromise from 'Controls/_popup/utils/CancelablePromise';

interface IStackOpenerOptions extends IStackPopupOptions, IBaseOpenerOptions {}

const getStackConfig = (stackOptions: IStackOpenerOptions = {}, popupId?: string) => {
    const config = {...stackOptions};
    // The stack is isDefaultOpener by default.
    // For more information, see  {@link Controls/_interface/ICanBeDefaultOpener}
    config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
    config._type = 'stack'; // TODO: Compatible for compoundArea
    config.id = config.id || popupId;

    return config;
};
const POPUP_CONTROLLER = 'Controls/popupTemplate:StackController';
/**
 * Контрол, открывающий всплывающее окно с пользовательским шаблоном внутри. Всплывающее окно располагается в правой части контентной области приложения и растянуто на всю высоту экрана.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FPopup%2FOpener%2FStackDemo демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 * Для открытия стековых окон из кода используйте {@link Controls/popup:StackOpener}.
 * @implements Controls/interface:IPropStorage
 * @author Красильников А.С.
 * @implements Controls/popup:IBaseOpener
 * @demo Controls-demo/Popup/Stack/Index
 * @public
 */

/*
 * Component that opens the popup to the right of content area at the full height of the screen.
 * {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ See more}.
 * @implements Controls/interface:IPropStorage
 * @demo Controls-demo/Popup/Opener/StackDemo
 * @author Красильников А.С.
 * @mixes Controls/popup:IBaseOpener
 * @public
 */
class Stack extends BaseOpener<IStackOpenerOptions> implements IStackOpener {
    readonly '[Controls/_popup/interface/IStackOpener]': boolean;

    open(popupOptions: IStackPopupOptions): Promise<string | undefined> {
        return super.open(this._getStackConfig(popupOptions), POPUP_CONTROLLER);
    }

    private _getStackConfig(popupOptions: IStackOpenerOptions): IStackOpenerOptions {
        return getStackConfig(popupOptions, this._getCurrentPopupId());
    }

    protected _getIndicatorConfig(): void {
        const baseConfig = super._getIndicatorConfig();
        baseConfig.isGlobal = true;
        return baseConfig;
    }

    static _openPopup(config: IStackPopupOptions): CancelablePromise<string> {
        const newCfg = getStackConfig(config);
        const moduleName = Stack.prototype._moduleName;
        return openPopup(newCfg, POPUP_CONTROLLER, moduleName);
    }

    static openPopup(config: IStackPopupOptions): Promise<string> {
        const cancelablePromise = Stack._openPopup(config);
        return new Promise((resolve, reject) => {
            cancelablePromise.then(resolve);
            cancelablePromise.catch(reject);
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

export default Stack;
