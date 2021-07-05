import {validateGridParts as originValidateGridParts, ERROR_MSG as ERRORS, IGridParts} from 'Controls/_grid/utils/ConfigValidation';
import {assert} from 'chai';

const validateGridParts = (options: IGridParts) => originValidateGridParts(options, 'throw');

describe('Controls/grid_clean/utils/ConfigValidation', () => {
    describe('header', () => {
        describe('Simplest header', () => {
            describe('valid', () => {
                it('Default', () => {
                    assert.doesNotThrow(() => {
                        assert.isTrue(validateGridParts({
                            columns: [{}],
                            header: [{}]
                        }));
                    });

                    assert.doesNotThrow(() => {
                        assert.isTrue(validateGridParts({
                            columns: [{}, {}],
                            header: [{}, {}]
                        }));
                    });
                });
            });

            describe('invalid', () => {
                it('less then columns', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}],
                            header: [{}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });

                it('more then columns', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}],
                            header: [{}, {}, {}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });
            });
        });

        describe('One row with column indexes', () => {
            describe('valid', () => {
                it('Default', () => {
                    assert.doesNotThrow(() => {
                        assert.isTrue(validateGridParts({
                            columns: [{}, {}],
                            header: [{startColumn: 1, endColumn: 2}, {startColumn: 2, endColumn: 3}]
                        }));
                    });

                    assert.doesNotThrow(() => {
                        assert.isTrue(validateGridParts({
                            columns: [{}, {}],
                            header: [{startColumn: 1, endColumn: 3}]
                        }));
                    });
                });
            });

            describe('invalid', () => {
                it('not all columns indexes setted', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}],
                            header: [{}, {}, {startColumn: 3, endColumn: 4}]
                        });
                    }, ERRORS.NOT_ALL_COLUMN_INDEXES_SETTED);
                });

                it('starts not from one', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}],
                            header: [{startColumn: 2, endColumn: 4}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });

                it('end is less then columns length', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}],
                            header: [{startColumn: 1, endColumn: 2}, {startColumn: 2, endColumn: 3}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);

                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}],
                            header: [{startColumn: 1, endColumn: 3}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });

                it('end is bigger then columns length', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}],
                            header: [{startColumn: 1, endColumn: 4}, {startColumn: 4, endColumn: 5}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });

                it('space between columns', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}],
                            header: [{startColumn: 1, endColumn: 2}, {startColumn: 3, endColumn: 4}]
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });
            });
        });

        describe('Multirow header', () => {
            describe('valid', () => {
                it('one column', () => {
                    const header = [
                        {startRow: 1, endRow: 2, startColumn: 1, endColumn: 2},
                        {startRow: 2, endRow: 3, startColumn: 1, endColumn: 2},
                        {startRow: 3, endRow: 4, startColumn: 1, endColumn: 2}
                    ];
                    assert.doesNotThrow(() => {
                        assert.isTrue(validateGridParts({
                            columns: [{}],
                            header
                        }));
                    });
                });
            });

            describe('invalid', () => {
                it('one column, gap', () => {
                    const header = [
                        {startRow: 1, endRow: 2, startColumn: 1, endColumn: 2},
                        {startRow: 3, endRow: 4, startColumn: 1, endColumn: 2}
                    ];
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}],
                            header
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });

                it('indexes setted not in pair', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}],
                            header: [
                                {startRow: 1, endRow: 2, startColumn: 1, endColumn: 2},
                                {startRow: 1, startColumn: 2, endColumn: 3},
                                {startRow: 2, endRow: 3, startColumn: 1, endColumn: 3}
                            ]
                        });
                    }, ERRORS.START_INDEX_REQUIRE_END_INDEX);
                });

                it('not all rows indexes setted', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}],
                            header: [
                                {startRow: 1, endRow: 2, startColumn: 1, endColumn: 2},
                                {startColumn: 2, endColumn: 3},
                                {startRow: 2, endRow: 3, startColumn: 1, endColumn: 3}
                            ]
                        });
                    }, ERRORS.NOT_ALL_ROW_INDEXES_SETTED);
                });

                it('not all columns indexes setted, but rows indexes are', () => {
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}],
                            header: [
                                {startRow: 1, endRow: 2},
                                {startRow: 1, endRow: 2},
                                {startRow: 2, endRow: 3}
                            ]
                        });
                    }, ERRORS.ROW_INDEX_SETTED_BUT_COLUMNS_INDEXES_NOT);
                });

                it('header rows are not the same width', () => {
                    /*
                    * +-------+-------+
                    * |       |   2   |   ?
                    * |   1   +-------+------+
                    * |       |   3   |   4  |  <- неверно
                    * +-------+-------+------+
                    */
                    const header = [
                        {startRow: 1, endRow: 3, startColumn: 1, endColumn: 2},
                        {startRow: 1, endRow: 2, startColumn: 2, endColumn: 3},
                        {startRow: 2, endRow: 3, startColumn: 2, endColumn: 3},
                        {startRow: 1, endRow: 2, startColumn: 3, endColumn: 4}
                    ];
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}],
                            header
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });

                it('cell overflows other cell', () => {
                    /*
                       * +--------+--------------------+
                       * |        |          2         |
                       * |        |--------------------+
                       * |    1   |          3         |
                       * |        | (должна быть тут,  |
                       * |        | но задана с первой |
                       * |        |    по 3 строку)    |
                       * +--------+--------------------+
                       */
                    const header = [
                        {startColumn: 1, endColumn: 2, startRow: 1, endRow: 3},
                        {startColumn: 2, endColumn: 3, startRow: 1, endRow: 2},
                        {startColumn: 2, endColumn: 3, startRow: 1, endRow: 3}
                    ];
                    assert.throws(() => {
                        validateGridParts({
                            columns: [{}, {}, {}, {}],
                            header
                        });
                    }, ERRORS.HEADER_CELL_COLLISION);
                });
            });
        });
    });

    describe('parts collaboration', () => {
        describe('valid', () => {
            it('columns', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}]
                    }));
                });
            });

            it('columns + header', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}],
                        header: [{}, {}]
                    }));
                });
            });

            it('columns + footer', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}],
                        footer: [{}, {}]
                    }));
                });
            });

            it('columns + emptyTemplateColumns', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}],
                        emptyTemplateColumns: [{}, {}]
                    }));
                });
            });

            it('all exist', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}],
                        header: [{}, {}],
                        emptyTemplateColumns: [{}, {}],
                        footer: [{}, {}]
                    }));
                });
            });

            it('columns + footer colspaned', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}],
                        footer: [{startColumn: 1, endColumn: 3}]
                    }));
                });
            });

            it('columns + emptyTemplateColumns colspaned', () => {
                assert.doesNotThrow(() => {
                    assert.isTrue(validateGridParts({
                        columns: [{}, {}],
                        emptyTemplateColumns: [{startColumn: 1, endColumn: 3}]
                    }));
                });
            });
        });

        describe('invalid', () => {
            it('no columns', () => {
                assert.throws(() => {
                    validateGridParts({});
                }, ERRORS.COLUMNS_ARE_REQUIRED);
            });

            it('columns + footer colspaned less', () => {
                assert.throws(() => {
                    validateGridParts({
                        columns: [{}, {}],
                        footer: [{startColumn: 1, endColumn: 2}]
                    });
                });
            });

            it('columns + emptyTemplateColumns colspaned less', () => {
                assert.throws(() => {
                    validateGridParts({
                        columns: [{}, {}],
                        emptyTemplateColumns: [{startColumn: 1, endColumn: 2}]
                    });
                });
            });

            it('columns + footer colspaned bigger', () => {
                assert.throws(() => {
                    validateGridParts({
                        columns: [{}, {}],
                        footer: [{startColumn: 1, endColumn: 4}]
                    });
                });
            });

            it('columns + emptyTemplateColumns colspaned bigger', () => {
                assert.throws(() => {
                    validateGridParts({
                        columns: [{}, {}],
                        emptyTemplateColumns: [{startColumn: 1, endColumn: 4}]
                    });
                });
            });
        });
    });
});
