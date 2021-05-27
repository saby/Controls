import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Input/AutoComplete/AutoComplete';

class TextAlignments extends Control<IControlOptions> {
    protected _autoCompletes: string[] = [
        "on", "off", "username",
        "current-password", "name",
        "given-name", "additional-name",
        "family-name", "email", "new-password",
        "one-time-code", "organization-title",
        "organization", "street-address",
        "country", "country-name", "postal-code",
        "cc-name", "cc-given-name", "cc-additional-name",
        "cc-family-name", "cc-number", "cc-exp",
        "language", "bday", "sex", "tel", "url"
    ];
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default TextAlignments;
