import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';

export interface IMoreOptions {
    moreMeta?: MoreRecordSet | unknown;
}

type MoreRecord = Record<{
    id: string|number,
    navResult: unknown
}>;
type MoreRecordSet = RecordSet<MoreRecord>;

type TKey = string|number;

class More {
    protected more: MoreRecordSet = null;

    constructor(options?: IMoreOptions = {}) {
        this.more = this.resolveMore(options.moreMeta);
    }

    private resolveMore(moreMeta?: unknown): MoreRecordSet {
        let moreResult;

        if (moreMeta !== undefined) {
            if (moreMeta.each) {
                moreResult = moreMeta;
            } else {
                moreResult = new RecordSet({
                    keyProperty: 'id',
                    rawData: [{
                        id: null,
                        nav_result: moreMeta
                    }]
                });
            }
        }

        return moreResult;
    }

    getMoreMeta(key?: TKey): unknown {
        let moreResult: unknown;
        let moreIndex: number;

        if (this.more) {
            if (key !== undefined) {
                moreIndex = this.more.getIndexByValue('id', key);
            } else {
                moreIndex = 0;
            }

            if (moreIndex !== -1) {
                moreResult = this.more.at(moreIndex).get('nav_result');
            }
        }

        return moreResult;
    }

    setMoreMeta(moreMeta: MoreRecordSet|unknown, key?: TKey): void {
        if (key) {
            const more = this._getMoreByKey(key);

            if (more) {
                more.set('nav_result', moreMeta);
            } else {
                this.more.add(new Record({
                    rawData: {
                        id: key,
                        nav_result: moreMeta
                    },
                    adapter: this.more.getAdapter()
                }));
            }
        } else {
            this.more = this.resolveMore(moreMeta);
        }
    }

    private _getMoreByKey(key: TKey): MoreRecord|void {
        const moreIndex = this.more.getIndexByValue('id', key);
        let moreRec;

        if (moreIndex !== -1) {
            moreRec = this.more.at(moreIndex);
        }

        return moreRec;
    }
}

export default More;
