import Base from 'Controls/_popup/PopupHelper/Base';
import DialogOpener from 'Controls/_popup/PopupHelper/Dialog';
import StackOpener from 'Controls/_popup/PopupHelper/Stack';
import StickyOpener from 'Controls/_popup/PopupHelper/Sticky';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';

interface IPagePopupOptions {
    mode: OpenMode;
    pageId: string;
    popupOptions: IStackPopupOptions | IStickyPopupOptions | IDialogPopupOptions;
}

type TOpener = DialogOpener | StackOpener | StickyOpener;

const OPENER_CLASS_BY_MODE = {
    dialog: DialogOpener,
    stack: StackOpener,
    sticky: StickyOpener
};

export enum OpenMode {
    dialog = 'dialog',
    stack = 'stack',
    sticky = 'sticky'
}

/**
 * Хелпер для открытия Шторки.
 * @class Controls/_popup/PopupHelper/SlidingPanel
 * @implements Controls/popup:ISlidingPanel
 *
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/SlidingPanel/Index
 * @public
 */
export default class PageOpener extends Base<IPagePopupOptions> {
    private _openerByMode: Record<string, TOpener> = {};
    open({mode, pageId, popupOptions}: IPagePopupOptions): unknown {
        return this._getPageTemplateOptions(pageId).then((config: object) => {
            const templateOptions = {
                ...config,
                ...(popupOptions?.templateOptions as object || {})
            };
            return this._getOpener(popupOptions.mode).open({
                ...popupOptions,
                template: 'Controls/popupTemplate:Page',
                templateOptions
            });
        });
    }

    private _getOpener(mode: OpenMode): TOpener {
        if (!this._openerByMode[mode]) {
            this._openerByMode[mode] = new OPENER_CLASS_BY_MODE[mode]();
        }
        return this._openerByMode[mode];
    }

    private _getPageTemplateOptions(pageId: string): Promise<unknown> {
        return ManagerController.getPageConfig(pageId).then((pageData) => {
            return ManagerController.loadData(pageData.loaders).then((loaderResult: object) => {
                return {
                    ...pageData.templateOptions,
                    ...loaderResult
                };
            });
        });
    }
}
