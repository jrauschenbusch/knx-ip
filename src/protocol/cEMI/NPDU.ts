'use strict';
import { CEMIConstants } from './CEMIConstants';
import { KNXDataBuffer } from '../KNXDataBuffer';

export class NPDU {

    set tpci(tpci: number) {
        if (isNaN(tpci) || (tpci < 0 && tpci > 0xFF)) {
            throw new Error('Invalid TPCI');
        }
        this._tpci = tpci;
    }

    get tpci(): number {
        return this._tpci;
    }

    set apci(apci: number) {
        if (isNaN(apci) || (apci < 0 && apci > 0xFF)) {
            throw new Error('Invalid APCI');
        }
        this._apci = apci;
    }

    get apci(): number {
        return this._apci;
    }

    get dataBuffer(): KNXDataBuffer {
        return this._data;
    }

    get dataValue(): Buffer {
        if (this._data == null) {
            const val = this.apci & 0x3F;
            return Buffer.alloc(1, val);
        }
        return this._data.value;
    }

    set data(data: KNXDataBuffer) {
        if (data == null) {
            this._data = null;
            return;
        }
        if (!(data instanceof KNXDataBuffer)) {
            throw new Error('Invalid data Buffer');
        }
        if (data.sixBits() && data.length === 1 && data.value.readUInt8(0) < 0x3F) {
            // merge data with apci if data is only one byte wide and small enough
            this.apci = (this.apci & 0xC0) | data.value.readUInt8(0);
            this._data = null;
            return;
        }
        this._data = data;
    }

    get length(): number {
        if (this._data === null) {
            return 3;
        }
        return 3 + this._data.length;
    }

    get action(): number {
        return ((this.apci & 0xC0) >> 6) | ((this.tpci & 0x3) << 2);
    }

    set action(action: number) {
        this.tpci = (action & 0xC) << 4;
        if (this.action === NPDU.GROUP_READ || this.action >= NPDU.INDIVIDUAL_WRITE) {
            this.apci = (action & 0x3) << 6;
        } else {
            this.apci = ((action & 0x3) << 6) | (this.apci & 0x3F);
        }
    }

    get isGroupRead(): boolean {
        return this.action === NPDU.GROUP_READ;
    }

    get isGroupWrite(): boolean {
        return this.action === NPDU.GROUP_WRITE;
    }

    get isGroupResponse(): boolean {
        return this.action === NPDU.GROUP_RESPONSE;
    }

    static get GROUP_READ(): number {
        return CEMIConstants.GROUP_READ;
    }

    static get GROUP_RESPONSE(): number {
        return CEMIConstants.GROUP_RESPONSE;
    }

    static get GROUP_WRITE(): number {
        return CEMIConstants.GROUP_WRITE;
    }

    static get INDIVIDUAL_WRITE(): number {
        return CEMIConstants.INDIVIDUAL_WRITE;
    }

    static get INDIVIDUAL_READ(): number {
        return CEMIConstants.INDIVIDUAL_READ;
    }

    static get INDIVIDUAL_RESPONSE(): number {
        return CEMIConstants.INDIVIDUAL_RESPONSE;
    }

    static get TPCI_UNUMBERED_PACKET(): number {
        return CEMIConstants.TPCI_UNUMBERED_PACKET;
    }
    constructor(private _tpci: number = 0x0, private _apci: number = 0x0, private _data: KNXDataBuffer = null) {
    }

    static createFromBuffer(buffer: Buffer, offset: number = 0): NPDU {
        if (offset > buffer.length) {
            throw new Error(`offset ${offset}  out of buffer range ${buffer.length}`);
        }
        const npduLength = buffer.readUInt8(offset++);
        const tpci = buffer.readUInt8(offset++);
        const apci = buffer.readUInt8(offset++);
        const data = npduLength > 1 ? buffer.slice(offset, offset + npduLength - 1) : null;
        return new NPDU(tpci, apci, data == null ? null : new KNXDataBuffer(data));
    }

    toBuffer(): Buffer {
        const length = this._data == null ? 1 : this._data.length + 1;
        const buffer = Buffer.alloc(3);
        buffer.writeUInt8(length, 0);
        buffer.writeUInt8(this.tpci, 1);
        buffer.writeUInt8(this.apci, 2);
        if (length === 1) {
            return buffer;
        }
        return Buffer.concat([buffer, this._data.value]);
    }
}
