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

interface IPagePopupOptions extends IStackPopupOptions, IStickyPopupOptions, IDialogPopupOptions {
    pageId: string;
}

interface IPageOpenerOptions extends IPagePopupOptions {
    mode: OpenMode;
}

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
 * Хэлпер для открытия страницы внутри окна.
 * @class Controls/_popup/PopupHelper/Page
 *
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/SlidingPanel/Index
 * @public
 */
export default class PageOpener extends Base<IPagePopupOptions> {
    private _opener: TOpener;
    constructor(popupCfg: IPageOpenerOptions) {
        super(popupCfg);
        this._opener = new OPENER_CLASS_BY_MODE[popupCfg.mode]();
    }
    open(popupOptions: IPagePopupOptions): unknown {
        const openConfig = {...this._options, ...popupOptions};
        return this._getPageTemplateOptions(openConfig.pageId).then((config: object) => {
            const templateOptions = {
                ...config,
                ...(openConfig?.templateOptions as object || {})
            };
            openConfig.template = 'Controls/popupTemplate:Page';
            openConfig.templateOptions = templateOptions;
            return this._opener.open(openConfig);
        });
    }

    close(): void {
        this._opener.close();
    }

    private _getPageTemplateOptions(pageId: string): Promise<unknown> {
        return ManagerController.getPageConfig(pageId).then((pageData) => {
            return ManagerController.loadData(pageData.loaders || []).then((loaderResult: object) => {
                return {
                    ...pageData.templateOptions,
                    ...loaderResult
                };
            });
        });
    }
}
