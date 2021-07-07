import Base from 'Controls/_popup/PopupHelper/Base';
import DialogOpener from 'Controls/_popup/PopupHelper/Dialog';
import StackOpener from 'Controls/_popup/PopupHelper/Stack';
import StickyOpener from 'Controls/_popup/PopupHelper/Sticky';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';
import PageController from 'Controls/_popup/Page/Controller';
import {Control} from 'UI/Base';
import {merge} from 'Types/object';
import {loadModule} from 'Controls/_popup/utils/moduleHelper';

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
 * @public
 */
export default class PageOpener extends Base<IPagePopupOptions> {
    private _opener: TOpener;
    constructor(popupCfg: IPageOpenerOptions) {
        super(popupCfg);
        this._opener = new OPENER_CLASS_BY_MODE[popupCfg.mode]();
    }



    open(popupOptions: IPagePopupOptions): unknown {
        const openConfig = merge({}, this._options, popupOptions);
        return PageController.getPageConfig(openConfig.pageId).then((pageData: object) => {
            const templateOptions = this._getTemplateOptions(pageData, openConfig);
            const [preloadResult] = this._startPreload(pageData, templateOptions);
            templateOptions.dataLoaderResult = preloadResult;
            openConfig.template = 'Controls/popupTemplate:Page';
            openConfig.templateOptions = templateOptions;
            return this._opener.open(openConfig);
        });
    }

    close(): void {
        this._opener.close();
    }

    private _getTemplateOptions(
        pageData: object,
        popupOptions: IPagePopupOptions
    ): {pageTemplate: string, pageTemplateOptions: object} {
        const workspaceConfig = pageData?.contentConfig?.workspaceConfig;
        if (workspaceConfig?.templateName) {
            return {
                pageTemplate: workspaceConfig.templateName,
                pageTemplateOptions: {
                    ...workspaceConfig.templateOptions,
                    ...(popupOptions?.templateOptions as object || {})
                }
            };
        } else {
            throw new Error(`
                Страница с указанным идентификатором имеет некорректное описание.
                В описании должен быть workspaceConfig с заданным templateName.
            `);
        }
    }

    private _startPreload(
        pageData: object,
        templateOptions: object
    ): [Promise<unknown>, Promise<Control>] {
        return [
            PageController.loadData(pageData, templateOptions.pageTemplateOptions),
            loadModule(templateOptions.pageTemplate)
        ];
    }
}
