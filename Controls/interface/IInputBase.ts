import {IInputPlaceholder, IInputTag} from 'Controls/interface';
// TODO: https://online.sbis.ru/opendoc.html?guid=8bd3ee01-5821-4782-8a62-847980a4eacd
type IInputBase =
    IInputTag & IInputPlaceholder & {
    readonly _options: {
        textAlign: 'left' | 'right' | 'center';
        style: 'info' | 'invalid' | 'danger' | 'success' | 'warning' | 'primary';
        // TODO: https://online.sbis.ru/opendoc.html?guid=1183a619-2f46-4c78-a2bc-09d41095e744
        autoComplete: 'on' | 'off' | 'username' | 'current-password';
        value: string | null;
    }
};

export default IInputBase;
