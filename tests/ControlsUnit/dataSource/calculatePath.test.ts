import {calculatePath} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {ok} from 'assert';

describe('Controls/dataSource/calculatePath', () => {
    it('path is empty', () => {
        const pathOptions = calculatePath(new RecordSet(), 'caption');
        ok(!pathOptions.path);
        ok(!pathOptions.pathWithoutItemForBackButton);
        ok(!pathOptions.backButtonCaption);
    });

    it('one item in path', () => {
        const path = new RecordSet({
            rawData: [{
                key: 0,
                caption: 'folder 0'
            }]
        });
        const recordSet = new RecordSet();
        recordSet.setMetaData({
            path
        });
        const pathOptions = calculatePath(recordSet, 'caption');
        ok(pathOptions.path.length === 1);
        ok(!pathOptions.pathWithoutItemForBackButton);
        ok(pathOptions.backButtonCaption === 'folder 0');
    });

    it('two items in path', () => {
        const path = new RecordSet({
            rawData: [
                {
                    key: 0,
                    caption: 'folder 0'
                },
                {
                    key: 1,
                    caption: 'folder 1'
                }]
        });
        const recordSet = new RecordSet();
        recordSet.setMetaData({
            path
        });
        const pathOptions = calculatePath(recordSet, 'caption');
        ok(pathOptions.path.length === 2);
        ok(pathOptions.pathWithoutItemForBackButton.length === 1);
        ok(pathOptions.pathWithoutItemForBackButton[0].get('caption') === 'folder 0');
        ok(pathOptions.backButtonCaption === 'folder 1');
    });
});