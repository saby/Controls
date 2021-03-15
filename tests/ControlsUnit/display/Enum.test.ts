import { assert } from 'chai';

import { Enum as EnumDisplay } from 'Controls/display';
import { Enum as EnumType } from 'Types/collection';

describe('Controls/_display/Enum', () => {
    let dict: string[];
    let localeDict: string[];
    let collection: EnumType<string>;
    let display: EnumDisplay<string>;
    let holeyDict: {
       [key: string]: string;
    };
    let holeyCollection: EnumType<string>;
    let holeyDisplay: EnumDisplay<string>;

    beforeEach(() => {
        dict = ['one', 'two', 'three'];
        localeDict = ['uno', 'dos', 'tres'];
        holeyDict = {1: 'one', 4: 'two', 6: 'three'};

        collection = new EnumType({
            dictionary: dict
        });

        holeyCollection = new EnumType({
            dictionary: holeyDict
        });

        display = new EnumDisplay({
            collection
        });

        holeyDisplay = new EnumDisplay({
            collection: holeyCollection
        });
    });

    afterEach(() => {
        dict = undefined;

        display.destroy();
        display = undefined;

        collection.destroy();
        collection = undefined;
    });

    describe('.constructor()', () => {
        it('should throw an error for not IEnum', () => {
            let display;

            assert.throws(() => {
                display = new EnumDisplay({
                    collection: [] as any
                });
            });
            assert.throws(() => {
                display = new EnumDisplay({
                    collection: {} as any
                });
            });
            assert.throws(() => {
                display = new EnumDisplay({
                    collection: null
                });
            });
            assert.throws(() => {
                display = new EnumDisplay();
            });

            assert.isUndefined(display);
        });
    });

    describe('.each()', () => {
        it('should return original values', () => {
            const collection = new EnumType({
                dictionary: dict
            });
            const display = new EnumDisplay({
                collection
            });

            display.each((item, index) => {
                assert.strictEqual(item.getContents(), dict[index]);
            });
        });

        it('should return localized values', () => {
            const collection = new EnumType({
                dictionary: dict,
                localeDictionary: localeDict
            });
            const display = new EnumDisplay({
                collection
            });

            display.each((item, index) => {
                assert.strictEqual(item.getContents(), localeDict[index]);
            });
        });
    });

    describe('.getIndexBySourceItem()', () => {
        it('should return value index', () => {
            for (let index = 0; index < dict.length; index++) {
                assert.equal(display.getIndexBySourceItem(dict[index]), index);
            }
        });

        it('should return localized value index', () => {
            const collection = new EnumType({
                dictionary: dict,
                localeDictionary: localeDict
            });
            const display = new EnumDisplay({
                collection
            });

            for (let index = 0; index < localeDict.length; index++) {
                assert.equal(display.getIndexBySourceItem(localeDict[index]), index);
            }
        });
    });

    describe('.getSourceIndexByItem()', () => {
        it('should return localized value index', () => {
            const collection = new EnumType({
                dictionary: dict,
                localeDictionary: localeDict
            });
            const display = new EnumDisplay({
                collection
            });
            const item = display.at(0);

            assert.equal(display.getSourceIndexByItem(item), 0);
        });

        it('should return right source index if enum have holes', () => {
            const item = holeyDisplay.at(1);
            assert.equal(holeyDisplay.getSourceIndexByItem(item), 4);
        });
    });

    describe('.getIndexBySourceIndex()', () => {
        it('should return right source index if enum have holes', () => {
            assert.equal(holeyDisplay.getIndexBySourceIndex(4), 1);
        });
    });
});
