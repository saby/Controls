import {DataLoader, NewSourceController as SourceController} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';

export default class BrowserController {
    constructor(
        private dataLoader: DataLoader
    ) {}

    search(value: string): Promise<RecordSet[]|void|Error> {
        const searchPromises = [];

        this.dataLoader.each((config, id) => {
            if (config.searchParam) {
                searchPromises.push(this.dataLoader.getSearchController(id).then((searchController) => {
                    return searchController.search(value);
                }));
            }
        });

        return Promise.all(searchPromises);
    }

    resetSearch(): void {
        const configsCount = Object.keys(this.dataLoader.getState()).length;
        if (configsCount > 1) {
            this.dataLoader.each(({searchController}) => {
                searchController.reset(Object.keys(this.dataLoader.getState()).length === 1);
            });
        } else {
            this.dataLoader.getSearchControllerSync().reset(true);
        }
    }

    cancelLoading(): void {
        this.dataLoader.each(({sourceController}) => {
            sourceController?.cancelLoading();
        });
    }

    getSourceController(): SourceController {
        return this.dataLoader.getSourceController();
    }
}
