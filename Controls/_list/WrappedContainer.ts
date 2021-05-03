import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_list/WrappedContainer';
import Container from 'Controls/_list/Container';

export default class WrappedContainer extends Control {
    _template: TemplateFunction = template;
    protected _innerTemplate: typeof Container = Container;
}
