export type Listener<ParamType> = (param: ParamType) => void;

export interface EventEmitter<ParamType> {
    listen(listener: Listener<ParamType>): void;
    ignore(listener: Listener<ParamType>): void;
}

export class EventHub<ParamType = void> implements EventEmitter<ParamType> {
    #listeners = new Set<Listener<ParamType>>();

    listen(listener: Listener<ParamType>): void {
        this.#listeners.add(listener);
    }

    ignore(listener: Listener<ParamType>): void {
        this.#listeners.delete(listener);
    }

    emit(param: ParamType): void {
        for (const listener of this.#listeners) {
            listener(param);
        }
    }
}
