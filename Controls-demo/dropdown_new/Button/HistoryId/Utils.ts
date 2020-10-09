import {dropdownHistoryUtils} from 'Controls/dropdown';
import {default as HistorySourceMenu, getItems} from 'Controls-demo/dropdown_new/Button/HistoryId/historySourceMenu';

let historySource;
dropdownHistoryUtils.getSource = () => {
    if (!historySource) {
        historySource = new HistorySourceMenu({});
    }
    return Promise.resolve(historySource);
};

export {getItems};
