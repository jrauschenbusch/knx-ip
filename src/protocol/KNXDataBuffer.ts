'use strict';

import { DataPoint } from '../DataPoints/DataPoint';
import { StatusField } from './cEMI/StatusField';
import { TimestampField } from './cEMI/TimestampField';

export class KNXDataBuffer {
    /**
     *
     * @param {Buffer} data
     * @param {DataPoint} info=null
     */
    constructor(private _data: Buffer, private _info?: DataPoint) {
    }

    get length(): number {
        return this._data == null ? 0 : this._data.length;
    }

    get value(): Buffer {
        return this._data;
    }

    get info(): DataPoint | null {
        return this._info;
    }

    get status(): StatusField {
        return StatusField.createFromBuffer(this._data, 0);
    }

    get timestamp(): TimestampField {
        return TimestampField.createFromBuffer(this._data, 3);
    }

    sixBits(): boolean {
        if (this.info == null) { return true; }
        return this.info.type.type === '1';
    }
}
