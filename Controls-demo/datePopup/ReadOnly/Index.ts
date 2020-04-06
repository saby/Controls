import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/datePopup/ReadOnly/Template');
import 'css!Controls-demo/Controls-demo';

class Single extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    protected _startValue = new Date(2019, 0, 1);
    protected _endValue = new Date(2019, 0, 16);

    protected _afterMount() {
        // _displayedDate изменяем напрямую, т.к если startValue endValue не заданы, отображается текущая дата, день выделяется кругляшком,
        // что будет мешать в регрессионном тестировании.
        this._children.datePopup1._displayedDate = this._startValue;
        this._children.datePopup2._displayedDate = this._startValue;
    }
}
export default Single;
