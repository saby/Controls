import {isEqualItems} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {ok} from 'assert';

describe('Controls/dataSource:isEqualItems', () => {

    describe('isEqual by model', () => {

        it('modes as alias', () => {
            let recordSet1;
            let recordSet2;

            recordSet1 = new RecordSet({
                model: 'Types/entity:Model'
            });
            recordSet2 = new RecordSet({
                model: 'Types/entity:Model'
            });
            ok(isEqualItems(recordSet1, recordSet2));

            recordSet1 = new RecordSet({
                model: 'Types/entity:Model'
            });
            recordSet2 = new RecordSet({
                model: 'Types/entity:Model2'
            });
            ok(!isEqualItems(recordSet1, recordSet2));
        });

        it('modes as alias and class', () => {
            let recordSet1;
            let recordSet2;

            recordSet1 = new RecordSet({
                model: 'Types/entity:Model'
            });
            recordSet2 = new RecordSet({
                model: Model
            });
            ok(isEqualItems(recordSet1, recordSet2));

            recordSet1 = new RecordSet({
                model: 'Types/entity:Model2'
            });
            recordSet2 = new RecordSet({
                model: Model
            });
            ok(!isEqualItems(recordSet1, recordSet2));
        });

    });

});