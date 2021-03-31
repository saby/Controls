import {constants} from 'Env/Env';

type TMode = 'months' | 'days';

export default function keyDownHandler(keyCode: number, item: Date, mode: TMode): Date | null {
        const daysInWeek = 7;
        const monthsInQuarter = 3;
        const year = item.getFullYear();
        let month;
        let day;
        if (mode === 'months') {
            // В режиме 'Месяца' дни не меняются
            day = 1;
        } else {
            // В режиме 'Дни' месяца не меняются
            month = item.getMonth();
        }
        const currentMonth = item.getMonth();
        const currentDay = item.getDate();

        switch (keyCode) {
            case constants.key.up:
                if (mode === 'months') {
                    month = currentMonth - monthsInQuarter;
                } else {
                    day = currentDay - daysInWeek;
                }
                break;
            case constants.key.down:
                if (mode === 'months') {
                    month = currentMonth + monthsInQuarter;
                } else {
                    day = currentDay + daysInWeek;
                }
                break;
            case constants.key.left:
                if (mode === 'months') {
                    month = currentMonth - 1;
                } else {
                    day = currentDay - 1;
                }
                break;
            case constants.key.right:
                if (mode === 'months') {
                    month = currentMonth + 1;
                } else {
                    day = currentDay + 1;
                }
                break;
        }
        if (typeof day === 'number' && typeof month === 'number') {
            return new Date(year, month, day);
        }
        return null;
}
