import {loadModule} from 'Controls/_popup/utils/moduleHelper';
import {DataLoader} from 'Controls/dataSource';

export function loadData(prefetchConfig: Record<string, any>): Promise<any> {
    return loadModule(prefetchConfig.configLoader).then((loaderModule) => {
        return new DataLoader().loadEvery(loaderModule.getConfig(prefetchConfig.configLoaderArguments));
    });
}