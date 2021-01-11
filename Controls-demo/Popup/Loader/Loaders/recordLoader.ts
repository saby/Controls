import {Memory, ICrudPlus} from 'Types/source';
import {Model} from 'Types/entity';
import {getStore} from 'Application/Env';

interface ILoaderParams {
    source: ICrudPlus;
    filter: object;
    navigation?: object;
    keyProperty?: string;
}

class Loader {
    private __uid: string = 'RecordLoader';

    init(): void { /**/

    }

    loadData(config): Promise<Model> {
        const memory = new Memory({
            keyProperty: 'id',
            data: [
                {id: 1, city: 'Yaroslavl', country: 'Russia', founded: 1010},
                {id: 2, city: 'Moscow', country: 'Russia'},
                {id: 3, city: 'St-Petersburg', country: 'Russia'}
            ]
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                memory.query().then((dataSet) => {
                    const recordSet = dataSet.getAll();
                    resolve(recordSet.at(0));
                });
            }, 1000);
        });

    }
}

export default new Loader();
