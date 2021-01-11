import {Memory, ICrudPlus} from 'Types/source';
import {RecordSet} from 'Types/collection';

interface ILoaderParams {
    source: ICrudPlus;
    filter: object;
    navigation?: object;
    keyProperty?: string;
}

class Loader {

    init(): void { /**/
    }

    loadData(config: ILoaderParams): Promise<RecordSet> {
        const memory = new Memory({
            keyProperty: 'id',
            data: [
                {id: 1, title: 'Yaroslavl', url: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Yaroslavl_Montage_2018.png?uselang=ru'},
                {id: 2, title: 'Moscow', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Moscow_July_2011-16.jpg/800px-Moscow_July_2011-16.jpg'},
                {id: 3, title: 'St-Petersburg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Palace_Bridge_SPB_%28img2%29_Crop.jpg/1920px-Palace_Bridge_SPB_%28img2%29_Crop.jpg'},
                {id: 4, title: 'Kazan', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/KAZ_Collage_2015.png/800px-KAZ_Collage_2015.png'},
                {id: 5, title: 'Sochi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Sochi_harbour.jpg/1280px-Sochi_harbour.jpg'}
            ]
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                memory.query().then((dataSet) => {
                    resolve(dataSet.getAll());
                });
            }, 2000);
        });
    }
}

export default new Loader();
