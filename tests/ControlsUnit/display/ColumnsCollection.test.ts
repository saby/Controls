import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import { ColumnsCollection, ColumnsCollectionItem } from 'Controls/display';
import { ItemsEntity } from 'Controls/dragnDrop';
import ColumnsDrag from 'Controls/_display/itemsStrategy/ColumnsDrag';

describe('Controls/_display/ColumnsCollection', () => {
    let model;
    let items;
    let list;

    interface IItem {
        id: number;
        name?: string;
    }

    function getItems(): IItem[] {
        return [{
            id: 1,
            name: 'Иванов'
        }, {
            id: 2,
            name: 'Петров'
        }, {
            id: 3,
            name: 'Сидоров'
        }, {
            id: 4,
            name: 'Пухов'
        }, {
            id: 5,
            name: 'Молодцов'
        }, {
            id: 6,
            name: 'Годолцов'
        }, {
            id: 7,
            name: 'Арбузнов'
        }];
    }

    beforeEach(() => {
        items = getItems();
        list = new RecordSet({
            rawData: items,
            keyProperty: 'id'
        });
        model = new ColumnsCollection<Model, ColumnsCollectionItem<Model>>({
            // @ts-ignore
            collection: list
        });
    });

    // Тестируем что при попытке переместить элемент в колонке, колонка должна учитываться.
    it('should set column for dragged item avatar', () => {
        const item = model.at(2);
        item.setColumn(1);
        const entity = new ItemsEntity( { items: [3] } );
        model.setDraggedItems(item, entity);
        const strategy = model.getStrategyInstance(ColumnsDrag);
        assert.equal(strategy.avatarItem.getColumn(), 1);
    });
});
