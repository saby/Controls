import { constants } from 'Env/Env';

const imagesPath = constants.resourceRoot + 'Controls-demo/tree/images/';

const data = [
    {
        key: 1,
        title: 'Ресторан Мили',
        parent: null,
        status: '',
        image: '',
        type: true
    },
    {
        key: 11,
        title: 'Основной зал',
        parent: 1,
        status: 'Используется',
        image: `${ imagesPath }11.png`,
        type: null
    },
    {
        key: 12,
        title: '14 февраля',
        parent: 1,
        status: '14 фев',
        image: `${ imagesPath }12.png`,
        type: null
    },
    {
        key: 2,
        title: 'Летнее кафе',
        parent: null,
        status: '',
        image: ``,
        type: true
    },
    {
        key: 21,
        title: 'Веранда',
        parent: 2,
        status: 'Используется',
        image: `${ imagesPath }21.png`,
        type: null
    },
    {
        key: 22,
        title: 'Фуршет',
        parent: 2,
        status: 'Не используется',
        image: `${ imagesPath }22.png`,
        type: null
    },
    {
        key: 23,
        title: 'Летняя веранда',
        parent: 2,
        status: 'Не используется',
        image: `${ imagesPath }23.png`,
        type: null
    }
];

export default data;
