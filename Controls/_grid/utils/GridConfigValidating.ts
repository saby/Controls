import { TColumns } from '../display/interface/IColumn';
// import { THeader } from '../display/interface/IHeaderCell';
// import { TFooter } from '../display/interface/IFooter';
import { GridLayoutUtil } from 'Controls/display';
import {Logger} from 'UI/Utils';

export const COLUMNS = {
    validateWidths: (columns: TColumns, logType: 'error' | 'warn' | false = 'error'): boolean => {
        return columns.reduce((acc, column) => {
            if (!column.width || GridLayoutUtil.isValidWidthValue(column.width)) {
                return acc && true;
            } else {
                if (logType) {
                    Logger[logType]('Error in Controls/grid:View: invalid column width value.\n' +
                        'Please set valid value following the instructions https://wi.sbis.ru/docs/js/Controls/grid/IColumn/options/width\n\n' +
                        `columns = [\n\t{\n\t\twidth: '${column.width}',\n\t\t...\n\t},\n\t...\n]\n`, this);
                }
                return false;
            }
        }, true);
    }
};
//
// export interface IGridParts {
//     header: THeader;
//     columns: TColumns;
//     footer: TFooter;
// }
//
// export const GRID = {
//     isMatchToGridLayout({header, columns, footer}: IGridParts): boolean {
//         return true;
//     }
// };

export default {
    COLUMNS
}
