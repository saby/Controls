import PanelWithList from 'Controls-demo/OperationsPanelNew/PanelWithList/Default/Index';

export default class extends PanelWithList {
    _beforeMount(): void {
        super._beforeMount();
        this._navigation = {
            source: 'page',
            view: 'pages',
            sourceConfig: {
                pageSize: 5,
                page: 0,
                hasMore: false
            }
        };
    }
}
