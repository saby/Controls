import {USER} from 'ParametersWebAPI/Scope';
import {Record} from 'Types/entity';

const scope = {};

// @ts-ignore
USER.load = ([name]) => {
    const result = {};
    result[name] = scope[name];
    return Promise.resolve(new Record({rawData: result}));
};

// @ts-ignore
USER.set = (name: string, value: string) => {
    scope[name] = value;
};
