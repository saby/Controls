import {Rpc} from 'Types/source';
import {TSelectionRecord, ISelectionObject} from 'Controls/interface';
import selectionToRecord from 'Controls/_operations/MultiSelector/selectionToRecord';
import {Record} from 'Types/entity';

type TCount = null|number|void;

export interface IGetCountCallParams {
    rpc: Rpc;
    data: object;
    command: string;
}

function getDataForCallWithSelection(selection: ISelectionObject, callParams: IGetCountCallParams): object {
    const data = {...callParams.data || {}};
    const filter = {...(data.filter || {})};
    const adapter = callParams.rpc.getAdapter();

    Object.assign(filter, {selection: getSelectionRecord(selection, callParams.rpc)});
    data.filter = Record.fromObject(filter, adapter);

    return data;
}

function getSelectionRecord(selection: ISelectionObject, rpc: Rpc): TSelectionRecord {
    return selectionToRecord(selection, rpc.getAdapter());
}

function getCount(selection: ISelectionObject, callParams: IGetCountCallParams): Promise<TCount> {
    const data = getDataForCallWithSelection(selection, callParams);

    return callParams.rpc.call(callParams.command, data).then((dataSet) => {
        return dataSet.getRow().get('count') as number;
    });
}

export default {
    getCount
};
