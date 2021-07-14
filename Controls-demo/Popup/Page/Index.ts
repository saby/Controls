import {Control, TemplateFunction} from 'UI/Base';
import {StackOpener, Controller, PageController} from 'Controls/popup';
import * as Template from 'wml!Controls-demo/Popup/Page/Index';
import {Memory} from 'Types/source';

const WIDGETS_COUNT = 50;

PageController.getPageConfig = (pageId) => {
    return Promise.resolve(PAGE_CONFIGS[pageId]);
};

PageController.setDataLoaderModule('Controls-demo/Popup/Page/Loaders/DataLoader');

const PAGE_CONFIGS = {
    stackTemplate: {
        contentConfig: {
            prefetchConfig: {
                configLoader: 'Controls-demo/Popup/Page/Loaders/Stack',
                configLoaderArguments: {},
                objectMode: true
            },
            workspaceConfig: {
                templateName: 'Controls-demo/Popup/Page/templates/Stack'
            }
        }
    }
};
const WIDGET_SOURCE = [];

for (let i = 0; i < WIDGETS_COUNT; i++) {
    PAGE_CONFIGS['widget' + i] = {
        contentConfig: {
            prefetchConfig: {
                configLoader: 'Controls-demo/Popup/Page/Loaders/Widget',
                configLoaderArguments: {
                    index: i
                }
            },
            workspaceConfig: {
                templateName: 'Controls-demo/Popup/Page/templates/ScrollableWidget'
            }
        }
    };

    WIDGET_SOURCE.push({
        key: 'widget' + i
    });
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _stackOpener: StackOpener = new StackOpener();

    _openStack(): void {

        // Потому что в странице которая строит демки на WI не задал лоадер
        const popupManager = Controller.getManager();
        popupManager._dataLoaderModule = 'Controls-demo/DataLoader';

        this._stackOpener.open({
            pageId: 'stackTemplate',
            opener: this,
            width: 900,
            templateOptions: {
                preloadWidgetsCount: 15,
                widgetSource: new Memory({
                    keyProperty: 'key',
                    data: WIDGET_SOURCE
                })
            }
        });

    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
