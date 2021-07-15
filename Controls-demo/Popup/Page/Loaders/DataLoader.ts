import {load} from 'Core/library';
import {DataLoader} from 'Controls/dataSource';

export function loadData(prefetchConfig: Record<string, any>): Promise<any> {
    return load(prefetchConfig.configLoader).then((loaderModule) => {
        return new DataLoader().loadEvery(loaderModule.getConfig(prefetchConfig.configLoaderArguments));
    });
}