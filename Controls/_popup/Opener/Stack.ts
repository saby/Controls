import { default as BaseOpener, IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import {Logger} from 'UI/Utils';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {IStackOpener, IStackPopupOptions} from 'Controls/_popup/interface/IStack';

/**
 * Контрол, открывающий всплывающее окно с пользовательским шаблоном внутри. Всплывающее окно располагается в правой части контентной области приложения и растянуто на всю высоту экрана.
 * @remark
 * Подробнее о работе с контролом читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/stack/ здесь}.
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FPopup%2FOpener%2FStackDemo">демо-пример</a>.
 * @class Controls/popup:Stack
 * @extends Controls/_popup/Opener/BaseOpener
 * @control
 * @author Красильников А.С.
 * @category Popup
 * @mixes Controls/_popup/interface/IBaseOpener
 * @mixes Controls/_popup/interface/IStack
 * @mixes Controls/_interface/IPropStorage
 * @demo Controls-demo/Popup/Opener/StackPG
 * @public
 */

/*
 * Component that opens the popup to the right of content area at the full height of the screen.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/stack/ See more}.
 *
 *  <a href="/materials/Controls-demo/app/Controls-demo%2FPopup%2FOpener%2FStackDemo">Demo-example</a>.
 * @class Controls/_popup/Opener/Stack
 * @extends Controls/_popup/Opener/BaseOpener
 * @control
 * @author Красильников А.С.
 * @category Popup
 * @mixes Controls/_popup/interface/IBaseOpener
 * @mixes Controls/_popup/interface/IStack
 * @mixes Controls/_interface/IPropStorage
 * @public
 */

interface IStackOpenerOptions extends IStackPopupOptions, IBaseOpenerOptions {}

const getStackConfig = (stackOptions: IStackOpenerOptions = {}, popupId?: string) => {
    const config = {...stackOptions};
    // The stack is isDefaultOpener by default.
    // For more information, see  {@link Controls/interface/ICanBeDefaultOpener}
    config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
    config._type = 'stack'; // TODO: Compatible for compoundArea
    config.id = config.id || popupId;

    return config;
};
const POPUP_CONTROLLER = 'Controls/popupTemplate:StackController';

class Stack extends BaseOpener<IStackOpenerOptions> implements IStackOpener {
    readonly '[Controls/_popup/interface/IStackOpener]': boolean;

    open(popupOptions: IStackPopupOptions): Promise<string | undefined> {
        return super.open(this._getStackConfig(popupOptions), POPUP_CONTROLLER);
    }

    private _getStackConfig(popupOptions: IStackOpenerOptions): IStackOpenerOptions {
        return getStackConfig(popupOptions, this._getCurrentPopupId());
    }

    static openPopup(config: IStackPopupOptions): Promise<string> {
        return new Promise((resolve) => {
            const newCfg = getStackConfig(config);
            if (!newCfg.hasOwnProperty('opener')) {
                Logger.error('Controls/popup:Stack: Для открытия окна через статический метод, обязательно нужно указать опцию opener');
            }
            BaseOpener.requireModules(newCfg, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, newCfg, result.controller).then((popupId: string) => {
                    resolve(popupId);
                });
            });
        });
    }
    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

export default Stack;
