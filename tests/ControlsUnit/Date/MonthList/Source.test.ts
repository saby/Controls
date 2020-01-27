import MonthsSource from 'Controls/_calendar/MonthList/MonthsSource';
import {Query} from 'Types/source';
import monthListUtils from 'Controls/_calendar/MonthList/Utils';
import ITEM_TYPES from 'Controls/_calendar/MonthList/ItemTypes';

describe('Controls/_calendar/MonthList/MonthsSource', () => {

    describe('query', () => {
        const LIMIT = 2;
        [{
            options: { viewMode: 'month' },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2019, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 1)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: { viewMode: 'month', header: true },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2019, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.body
            }, {
                id: 'h' + monthListUtils.dateToId(new Date(2019, 1)),
                type: ITEM_TYPES.header
            }, {
                id: monthListUtils.dateToId(new Date(2019, 1)),
                type: ITEM_TYPES.body
            }, {
                id: 'h' + monthListUtils.dateToId(new Date(2019, 2)),
                type: ITEM_TYPES.header
            }]
        }, {
            options: { viewMode: 'month' },
            query: (new Query()).where({'id>=': monthListUtils.dateToId(new Date(2019, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 1)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 2)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: { viewMode: 'month', header: true },
            query: (new Query()).where({'id>=': 'h' + monthListUtils.dateToId(new Date(2019, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.body
            }, {
                id: 'h' + monthListUtils.dateToId(new Date(2019, 1)),
                type: ITEM_TYPES.header
            }, {
                id: monthListUtils.dateToId(new Date(2019, 1)),
                type: ITEM_TYPES.body
            }, {
                id: 'h' + monthListUtils.dateToId(new Date(2019, 2)),
                type: ITEM_TYPES.header
            }]
        }, {
            options: { viewMode: 'month' },
            query: (new Query()).where({'id<=': monthListUtils.dateToId(new Date(2019, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 10)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2018, 11)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: { viewMode: 'month', header: true },
            query: (new Query()).where({'id<=': monthListUtils.dateToId(new Date(2019, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 10)),
                type: ITEM_TYPES.body
            }, {
                id: 'h' + monthListUtils.dateToId(new Date(2018, 11)),
                type: ITEM_TYPES.header
            }, {
                id: monthListUtils.dateToId(new Date(2018, 11)),
                type: ITEM_TYPES.body
            }, {
                id: 'h' + monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.header
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 11)]],
                viewMode: 'month',
                stubTemplate: 'template'
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2018, 11))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 11)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.stub
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 11)]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id<=': monthListUtils.dateToId(new Date(2018, 11))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 9)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2018, 10)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 11)]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2018, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 0)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2018, 1)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 11)]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id>=': monthListUtils.dateToId(new Date(2018, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 1)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2018, 2)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 11)]],
                viewMode: 'month',
                stubTemplate: 'template'
            },
            query: (new Query()).where({'id<=': monthListUtils.dateToId(new Date(2018, 0))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2017, 11)),
                type: ITEM_TYPES.stub
            }]
        }, {
            options: {
                displayedRanges: [
                    [new Date(2018, 0), new Date(2018, 6)],
                    [new Date(2019, 0), new Date(2019, 6)]
                ],
                viewMode: 'month',
                stubTemplate: 'template'
            },
            limit: 3,
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2018, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 6)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2018, 7)),
                type: ITEM_TYPES.stub
            }, {
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 6)]],
                viewMode: 'month',
                stubTemplate: 'template'
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2017, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2017, 11)),
                type: ITEM_TYPES.stub
            }, {
                id: monthListUtils.dateToId(new Date(2018, 0)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2018, 0), new Date(2018, 6)]],
                viewMode: 'month',
                stubTemplate: 'template'
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2019, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 7)),
                type: ITEM_TYPES.stub
            }]
        }, {
            options: {
                displayedRanges: [[null, new Date(2018, 11)]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2017, 10))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2017, 10)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2017, 11)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[null, new Date(2018, 11)]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id>=': monthListUtils.dateToId(new Date(2017, 10))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2017, 11)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2017, 12)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[null, new Date(2018, 11)]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id<=': monthListUtils.dateToId(new Date(2017, 10))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2017, 8)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2017, 9)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2019, 0), null]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2019, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 6)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 7)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2019, 0), null]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id>=': monthListUtils.dateToId(new Date(2019, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 7)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 8)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2019, 0), null]],
                viewMode: 'month'
            },
            query: (new Query()).where({'id<=': monthListUtils.dateToId(new Date(2019, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 4)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 5)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [[new Date(2019, 0), new Date(2019, 3)]],
                viewMode: 'month',
                monthHeaderTemplate: {}
            },
            query: (new Query()).where({'id>=': monthListUtils.dateToId(new Date(2019, 2))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2019, 3)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [
                    [new Date(2018, 0), new Date(2018, 6)],
                    [new Date(2019, 0), new Date(2019, 6)]
                ],
                viewMode: 'month'
            },
            limit: 3,
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2018, 6))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 6)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.body
            }]
        }, {
            options: {
                displayedRanges: [
                    [new Date(2018, 0), new Date(2019, 0)]
                ]
            },
            query: (new Query()).where({'id~': monthListUtils.dateToId(new Date(2018, 3))}),
            resp: [{
                id: monthListUtils.dateToId(new Date(2018, 0)),
                type: ITEM_TYPES.body
            }, {
                id: monthListUtils.dateToId(new Date(2019, 0)),
                type: ITEM_TYPES.body
            }]
        }].forEach((test, i) => {
            it(`should return proper data ${i}`, () => {
                const source = new MonthsSource(test.options);

                return source.query(test.query.limit(test.limit || LIMIT)).then((resp) => {
                    resp = resp.getAll().getRawData();
                    assert.lengthOf(resp, test.resp.length);
                    resp.forEach((item, i) => {
                        assert.strictEqual(item.id, test.resp[i].id);
                        assert.strictEqual(item.type, test.resp[i].type);
                    });
                });
            });
        });
    });

});
