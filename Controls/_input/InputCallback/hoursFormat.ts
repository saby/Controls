import {ICallback, ICallbackData, IFieldData} from 'Controls/_input/interface/IValue';
import {TimeInterval} from 'Types/entity';

/**
 * Ограничивает ввод времени с 0:00 до 24:00.
 * @remark
 * Использовать нужно как значение опции inputCallback в {@link Controls.input:TimeInterval поле ввода интервала}
 * c {@link Controls.input:TimeInterval#mask} маской HH:MM.
 * @demo Controls-demo/Input/InputCallback/Index
 */
const hoursFormat: ICallback<TimeInterval> = (data: ICallbackData<TimeInterval>): IFieldData => {
    const hours = Math.min(data.value.getTotalHours(), 24);
    const minutes = hours === 24 ? 0 : data.value.getMinutes();
    return {
        displayValue: `${toFormat(hours)}:${toFormat(minutes)}`,
        position: data.position
    };
};

function toFormat(original: number): string {
    return original < 10 ? `0${original}` : original.toString();
}

export default hoursFormat;
