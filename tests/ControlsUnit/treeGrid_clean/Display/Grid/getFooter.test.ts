import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid_clean/Display/Grid/getFooter', () => {

    it('_initializeFooter with outside item actions', () => {
        const footerTemplate = () => 'footer';
        const recordSet = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {id: 1}
            ]
        });
        const collection = new TreeGridCollection({
            collection: recordSet,
            columns: [{ width: ''}],
            header: [{ caption: ''}],
            itemActionsPosition: 'outside',
            footerTemplate,
            footer: [{ width: ''}]
        });

        const footer = collection.getFooter();
        assert.isTrue(!!footer);

        const column = footer.getColumns()[0];

        // проверяем, что при вызове _initializeFooter модель футера создана с учётом itemActionsPosition.
        // В getWrapperClasses колонок должен быть класс, задающий высоту.
        CssClassesAssert.include(column.getWrapperClasses('default', 'default'), 'controls-GridView__footer__itemActionsV_outside');
    });
});
