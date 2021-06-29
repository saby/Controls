import {dropdownHistoryUtils} from 'Controls/dropdown';
import {default as HistorySourceMenu, getItems} from 'Controls-demo/dropdown_new/Button/HistoryId/historySourceMenu';

let historySource;

function overrideOrigSourceMethod(): void {
    dropdownHistoryUtils.getSource = () => {
        if (!historySource) {
            historySource = new HistorySourceMenu({});
        }
        return Promise.resolve(historySource);
    };
}

function resetHistory() {
    historySource = undefined;
}

export {getItems, overrideOrigSourceMethod, resetHistory};
