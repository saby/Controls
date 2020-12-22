import {Memory} from 'Types/source';
import Deferred = require('Core/Deferred');
import formatter = require('Types/formatter');
import {Base as dateUtils} from 'Controls/dateUtils';

class DateLitePopupSource extends Memory {
    private _$keyProperty: string = 'id';

    public query(query) {
        let
            offset = query.getOffset(),
            where = query.getWhere(),
            limit = query.getLimit() || 1,
            executor;

        executor = (function() {
            let adapter = this.getAdapter().forTable(),
                items = [],
                monthEqual = where['id~'],
                monthGt = where['id>='],
                monthLt = where['id<='],
                month = monthEqual || monthGt || monthLt,
                deferred = new Deferred();

            if (month) {
                month = formatter.dateFromSql(month);
            } else {
                month = dateUtils.getStartOfMonth(new Date());
            }

            month.setMonth(month.getMonth() + offset);

            if (monthLt) {
                month.setMonth(month.getMonth() - limit);
            } else if (monthGt) {
                month.setMonth(month.getMonth() + 1);
            }

            for (let i = 0; i < limit; i++) {
                items.push({
                    id: formatter.dateToSql(month, formatter.TO_SQL_MODE.DATE),
                    extData: i % 2
                });
                month.setMonth(month.getMonth() + 1);
            }

            this._each(
                items,
                function(item) {
                    adapter.add(item);
                }
            );
            items = this._prepareQueryResult({
                items: adapter.getData(),
                total: monthEqual ? { before: true, after: true } : true
            });

            setTimeout(function() {
                deferred.callback(items);
            }, 300);

            return deferred;
        }).bind(this);

        if (this._loadAdditionalDependencies) {
            return this._loadAdditionalDependencies().addCallback(executor);
        } else {
            return Deferred.success(executor());
        }
    }
}

export default DateLitePopupSource;
