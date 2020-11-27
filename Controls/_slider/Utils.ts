import {Logger} from 'UI/Utils';
import {ISliderBaseOptions} from './Base';
import {ISliderRangeOptions} from './Range';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IInterval} from './interface/IInterval';

export interface IScaleData {
    value: number;
    position: number;
}

export interface ILineData {
    position: number;
    width: number;
}

export interface IPointData {
    name: string;
    position: number;
}

export interface IPositionedInterval {
    color: string;
    start: number;
    width: number;
}

export type IPointDataList = IPointData[];
const maxPercentValue = 100;
const stepDenominator = 2;
export default {
    _defaultLabelFormatter(value: number): number {
        // Округляем значение до 2х знаков после запятой
        // Потому что это js и 0.6 + 0.3 = 0.8999999999999999
        const valueFixed: string = value.toFixed(2);
        return parseFloat(valueFixed);
    },
    getRatio(pos: number, left: number, width: number): number {
        return (pos - left) / width;
    },
    calcValue(minValue: number, maxValue: number, ratio: number, perc: number): number {
        const rangeLength = maxValue - minValue;
        const val = minValue + Math.max(Math.min(ratio, 1), 0) * rangeLength;
        return parseFloat(val.toFixed(perc));
    },
    checkOptions(opts: ISliderBaseOptions | ISliderRangeOptions): void {
        if (opts.minValue >= opts.maxValue) {
            Logger.error('Slider: minValue must be less than maxValue.');
        }
        if (opts.scaleStep < 0) {
            Logger.error('Slider: scaleStep must positive.');
        }
    },
    getScaleData(minValue: number, maxValue: number, scaleStep: number,
                 formatter: Function = this._defaultLabelFormatter): IScaleData[] {
        const scaleData: IScaleData[] = [];

        if (scaleStep > 0) {
            const scaleRange = maxValue - minValue;
            scaleData.push({value: formatter(minValue), position: 0});
            for (let i = minValue + scaleStep; i <= maxValue - scaleStep / stepDenominator; i += scaleStep) {
                scaleData.push({value: formatter(i), position: (i - minValue) / scaleRange * maxPercentValue});
            }
            scaleData.push({value: formatter(maxValue), position: 100});
        }
        return scaleData;
    },
    getNativeEventPageX(event: SyntheticEvent<MouseEvent | TouchEvent>): number {
        let targetX = 0;
        if (event.type === 'mousedown' || event.type === 'mousemove') {
            targetX = event.nativeEvent.pageX;
        } else if (event.type === 'touchstart' || event.type === 'touchmove') {
            targetX = event.nativeEvent.touches[0].pageX;
        } else {
            Logger.error('Slider: Event type must be mousedown of touchstart.');
        }
        return targetX;
    },

    getNativeEventPageY(event: SyntheticEvent<MouseEvent | TouchEvent>): number {
        let targetY = 0;
        if (event.type === 'mousedown' || event.type === 'mousemove') {
            targetY = event.nativeEvent.pageY;
        } else if (event.type === 'touchstart' || event.type === 'touchmove') {
            targetY = event.nativeEvent.touches[0].pageY;
        } else {
            Logger.error('Slider: Event type must be mousedown of touchstart.');
        }
        return targetY;
    },

    convertIntervals(intervals: IInterval[] = [], startValue: number, endValue: number): IPositionedInterval[] {
        const ratio = maxPercentValue / (endValue - startValue);
        return intervals.map((interval) => {
            const start = Math.round((interval.start - startValue) * ratio);
            const end = Math.round((interval.end - startValue) * ratio);
            const intervalWidth = end - start;

            return {
                color: interval.color,
                start,
                width: intervalWidth
            };
        }).sort((intervalFirst, intervalSecond) => {
            if (intervalFirst.start < intervalSecond.start) {
                return -1;
            }
            if (intervalFirst.start > intervalSecond.start) {
                return 1;
            }

            return intervalFirst.width === intervalSecond.width ? 0 :
                intervalFirst.width > intervalSecond.width ? -1 : 1;
        });
    }
};
