import {TimeInterval} from 'Types/entity';

/**
 * Интерфейс для поля ввода временного интервала с маской.
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for TimeInterval input mask.
 * @public
 * @author Красильников А.С.
 */
interface ITimeInterval {
    readonly _options: {
        /**
         * @cfg {String} Формат ввода временного интервала.
         * @variant 'HH:MM'
         * @variant 'HHH:MM'
         * @variant 'HHHH:MM'
         * @variant 'HH:MM:SS'
         * @variant 'HHH:MM:SS'
         * @variant 'HHHH:MM:SS'
         * @remark
         * Разрешенные символы маски:
         * 
         * * H - часы.
         * * M - минуты.
         * * S - секунды.
         * * ":" - разделитель.
         * 
         * Если какая-то часть TimeInterval отсутствует, она будет автоматически дописана.
         * Например, для маски 'HH:mm:ss' - введенное значение '1 : 1: 1' будет преобразовано к значению '01:01:01'.
         */

        /*
         * @cfg {String} TimeInterval.
         * @variant 'HH:MM'
         * @variant 'HHH:MM'
         * @variant 'HHHH:MM'
         * @variant 'HH:MM:SS'
         * @variant 'HHH:MM:SS'
         * @variant 'HHHH:MM:SS'
         * @remark
         * Allowed mask chars:
         * 
         * * H - hours.
         * * M - minutes.
         * * S - seconds.
         * * ":" - delimiters.
         * 
         * If some part of the TimeInterval is missing, they will be autocompleted.
         * For example, for mask 'HH:mm:ss' - input of '1 : 1: 1' will be transformed to '01:01:01' value.
         */
        mask: 'HH:MM' | 'HHH:MM' | 'HHHH:MM' | 'HH:MM:SS' | 'HHH:MM:SS' | 'HHHH:MM:SS';

        /**
         * @cfg {Types/entity:applied.TimeInterval} Значение поля.
         * @demo Controls-demo/Input/TimeInterval/Base/Index
         */
        value: TimeInterval;
    };
}

export default ITimeInterval;
