import {Rpc} from 'Types/source';
import {TSelectionRecord, ISelectionObject} from 'Controls/interface';
import * as selectionToRecord from 'Controls/_operations/MultiSelector/selectionToRecord';

type TCount = null|number|void;

export interface IGetCountCallParams {
    rpc: Rpc;
    data: object;
    command: string;
}

function getDataForCallWithSelection(selection: ISelectionObject, callParams: IGetCountCallParams): object {
    const data = {...callParams.data || {}};
    const filter = {...(data.filter || {})};
    Object.assign(filter, {selection: getSelectionRecord(selection, callParams.rpc)});
    data.filter = filter;
    return data;
}

function getSelectionRecord(selection: ISelectionObject, rpc: Rpc): TSelectionRecord {
    return selectionToRecord(selection, rpc.getAdapter());
}

function getCount(selection: ISelectionObject, callParams: IGetCountCallParams): Promise<TCount> {
    const data = getDataForCallWithSelection(selection, callParams);

    return callParams.rpc.call(callParams.command, data).then((dataSet) => {
        return dataSet.getScalar('count') as number;
    });
}

export default {
    getCount
};
