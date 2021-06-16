import { assert } from 'chai';

import Composer from 'Controls/_display/itemsStrategy/Composer';

describe('Controls/_display/itemsStrategy/Composer', () => {
    interface IStrategy {
        source: any;
    }

    function getStrategy<T = any>(): T {
        return function(options: object): void {
            Object.assign(this, options || {});
        } as any as T;
    }

    describe('.append()', () => {
        it('should append a strategy to the empty composer', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            composer.append(Strategy);
            assert.instanceOf(composer.getResult(), Strategy);
        });

        it('should append a strategy to the end', () => {
            const StrategyA = getStrategy();
            const StrategyB = getStrategy();
            const composer = new Composer();

            composer
                .append(StrategyA)
                .append(StrategyB);

            assert.instanceOf(composer.getResult(), StrategyB);
            assert.isUndefined(composer.getInstance<IStrategy>(StrategyA).source);
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyB).source, StrategyA);
        });

        it('should append a strategy after given', () => {
            const StrategyA = getStrategy();
            const StrategyB = getStrategy();
            const StrategyC = getStrategy();
            const composer = new Composer();

            composer
                .append(StrategyA)
                .append(StrategyB)
                .append(StrategyC, {}, StrategyA);

            assert.instanceOf(composer.getResult(), StrategyB);
            assert.isUndefined(composer.getInstance<IStrategy>(StrategyA).source);
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyC).source, StrategyA);
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyB).source, StrategyC);
        });
    });

    describe('.prepend()', () => {
        it('should prepend a strategy to the empty composer', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            composer.prepend(Strategy);
            assert.instanceOf(composer.getResult(), Strategy);
        });

        it('should prepend a strategy to the begin', () => {
            const StrategyA = getStrategy();
            const StrategyB = getStrategy();
            const composer = new Composer();

            composer
                .prepend(StrategyA)
                .prepend(StrategyB);

            assert.instanceOf(composer.getResult(), StrategyA);
            assert.isUndefined(composer.getInstance<IStrategy>(StrategyB).source);
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyA).source, StrategyB);
        });

        it('should prepend a strategy before given', () => {
            const StrategyA = getStrategy();
            const StrategyB = getStrategy();
            const StrategyC = getStrategy();
            const composer = new Composer();

            composer.prepend(StrategyA)
                    .prepend(StrategyB);

            const instanceB = composer.getInstance(StrategyB);

            composer.prepend(StrategyC, {}, StrategyA);

            assert.instanceOf(composer.getResult(), StrategyA);
            assert.isUndefined(composer.getInstance<IStrategy>(StrategyB).source);
            assert.strictEqual(composer.getInstance<IStrategy>(StrategyB), instanceB);
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyC).source, StrategyB);
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyA).source, StrategyC);
        });
    });

    describe('.remove()', () => {
        it('should return undefined for empty composer', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            assert.isUndefined(composer.remove(Strategy));
            assert.isNull(composer.getResult());
        });

        it('should return removed instance', () => {
            const StrategyA = getStrategy();
            const StrategyB = getStrategy();
            const StrategyC = getStrategy();
            const composer = new Composer();

            composer
                .append(StrategyA)
                .append(StrategyB)
                .append(StrategyC);

            assert.instanceOf(composer.remove(StrategyB), StrategyB);
            assert.instanceOf(composer.getResult(), StrategyC);
            assert.isUndefined(composer.getInstance<IStrategy>(StrategyA).source);
            assert.isUndefined(composer.getInstance(StrategyB));
            assert.instanceOf(composer.getInstance<IStrategy>(StrategyC).source, StrategyA);
        });

        it('should affect result', () => {
            const StrategyA = getStrategy();
            const StrategyB = getStrategy();
            const composer = new Composer();

            composer
                .append(StrategyA)
                .append(StrategyB);

            assert.instanceOf(composer.remove(StrategyB), StrategyB);
            assert.instanceOf(composer.getResult(), StrategyA);
        });
    });

    describe('.reset()', () => {
        it('should reset result', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            composer
                .append(Strategy)
                .reset();

            assert.isNull(composer.getResult());
        });
    });

    describe('.getInstance()', () => {
        it('should return an instance', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            composer.append(Strategy);
            assert.instanceOf(composer.getInstance(Strategy), Strategy);
        });

        it('should return undefined if strategy not composed', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            assert.isUndefined(composer.getInstance(Strategy));
        });
    });

    describe('.getResult()', () => {
        it('should return null by default', () => {
            const composer = new Composer();
            assert.isNull(composer.getResult());
        });

        it('should return instance of given stratgey', () => {
            const Strategy = getStrategy();
            const composer = new Composer();

            composer.append(Strategy);
            assert.instanceOf(composer.getResult(), Strategy);
        });
    });
});
