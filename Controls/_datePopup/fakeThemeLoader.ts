import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/fakeThemeLoader';
import 'css!Controls/datePopup';

class Header extends Control<IControlOptions> {
    // TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=33010df1-501e-4874-a02c-a5f45394a661
    protected _template: TemplateFunction = template;
}
export default Header;
