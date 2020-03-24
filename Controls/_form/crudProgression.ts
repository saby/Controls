import {BindingMixin, CrudEntityKey, ICrud, IDecorator} from 'Types/source';
import {ObservableMixin, Record} from 'Types/entity';

export function readWithAdditionalFields(
    source: ICrud | IDecorator | ObservableMixin | BindingMixin,
    key: CrudEntityKey,
    metaData?: unknown
): Promise<Record> {
    const targetSource = (source as IDecorator)['[Types/_source/IDecorator]'] ?
        (source as IDecorator).getOriginal() :
        source;

    const needAdditionalFiedls = metaData && (targetSource as ObservableMixin).subscribe &&
        (targetSource as BindingMixin).getBinding;

    let handler;
    if (needAdditionalFiedls) {
        const sourceBinding = (targetSource as BindingMixin).getBinding() || {};
        handler = (event, name, args) => {
            if (name === sourceBinding.read) {
                args.ДопПоля = metaData;
            }
        };
        (targetSource as ObservableMixin).subscribe('onBeforeProviderCall', handler);
    }

    const result = (targetSource as ICrud).read(key);

    if (needAdditionalFiedls) {
        (targetSource as ObservableMixin).unsubscribe('onBeforeProviderCall', handler);
    }

    return result;
}
