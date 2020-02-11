import {assert} from 'chai';

import {NavigationOptionsResolver} from 'Controls/_list/SourceControl/NavigationOptionsResolver';
import {
    INavigationOptionValue,
    INavigationPageSourceConfig, INavigationPositionSourceConfig
} from 'Controls/_interface/INavigation';

describe('Controls/_list/SourceControl/ListSourceLoadingController', () => {
    let instance: NavigationOptionsResolver;

    describe('should resolve INavigationPageSourceConfig', () => {
        let result: INavigationOptionValue<INavigationPageSourceConfig>;

        it('should resolve source and sourceConfig to Page by default', () => {
            instance = new NavigationOptionsResolver();
            result = instance.resolve(0, 100) as INavigationOptionValue<INavigationPageSourceConfig>;
            assert.equal(result.source, 'page');
            assert.equal(result.sourceConfig.page, 0);
            assert.equal(result.sourceConfig.pageSize, 100);
            assert.equal(result.sourceConfig.hasMore, false);
        });

        it ('should resolve source and sourceConfig to Page when source is set', () => {
            instance = new NavigationOptionsResolver({
                source: 'page',
                sourceConfig: <INavigationPageSourceConfig> {
                    hasMore: true,
                    pageSize: 5,
                    page: 25
                }
            });
            result = instance.resolve(30, 5) as INavigationOptionValue<INavigationPageSourceConfig>;
            assert.equal(result.source, 'page');
            assert.equal(result.sourceConfig.page, 30);
            assert.equal(result.sourceConfig.pageSize, 5);
            assert.equal(result.sourceConfig.hasMore, true);
        });
    });

    describe('should resolve INavigationPositionSourceConfig', () => {
        let result: INavigationOptionValue<INavigationPositionSourceConfig>;

        it('should resolve source and sourceConfig to Position when only source is set', () => {
            instance = new NavigationOptionsResolver({source: 'position'}, 'date');
            result = instance.resolve(['2015-03-07T21:00:00.000Z'], 100) as INavigationOptionValue<INavigationPositionSourceConfig>;
            assert.equal(result.source, 'position');
            assert.equal(result.sourceConfig.field, 'date');
            assert.equal(result.sourceConfig.direction, 'after');
            assert.equal(result.sourceConfig.limit, 100);
            assert.equal(result.sourceConfig.position[0], '2015-03-07T21:00:00.000Z');
        });

        it ('should resolve source and sourceConfig to Position when source and sourceConfig is set', () => {
            instance = new NavigationOptionsResolver({
                source: 'position',
                sourceConfig: <INavigationPositionSourceConfig> {
                    field: 'date',
                    direction: 'after',
                    limit: 5,
                    position: ['2015-03-07T21:00:00.000Z']
                }
            });
            result = instance.resolve(['2015-03-08T23:59:59.000Z'], 10) as INavigationOptionValue<INavigationPositionSourceConfig>;
            assert.equal(result.source, 'position');
            assert.equal(result.sourceConfig.field, 'date');
            assert.equal(result.sourceConfig.direction, 'after');
            assert.equal(result.sourceConfig.limit, 10);
            assert.equal(result.sourceConfig.position[0], '2015-03-08T23:59:59.000Z');
        });
    });
});
