import {Record} from 'Types/entity';

export const main: Record = new Record({
    rawData: {
        id: 1,
        text: 'Hello world!!!'
    }
});

export const secondary: Record = new Record({
    rawData: {
        id: 2,
        text: 'Hello people!!!'
    }
});

export const date: Record = new Record({
    rawData: {
        id: 3,
        date: new Date(2020, 0)
    }
});
