import Application from 'Controls/Application';
import * as template from 'wml!Controls/Application/BootstrapPage';
import {TemplateFunction} from 'UI/Base';

/**
 * Контрол-заглушка на время массовой замены
 * Полностью повторяет функционал Controls/Application, за исключением шаблона
 * В шаблоне строится только контент без UI/HTML
 */

export default class ApplicationTemp extends Application {
   protected _template: TemplateFunction = template;
}
