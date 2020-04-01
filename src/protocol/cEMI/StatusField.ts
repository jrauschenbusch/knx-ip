const STATUS_LENGTH = 3;

export enum OnOff {
    off = 0,
    on
}

export class StatusField {

    get sequenceNumber(): number {
        return (this.status & 0x07);
    }

    get lost(): OnOff {
        return (this.status & 0x08) >> 3;
    }

    get bitError(): OnOff {
        return (this.status & 0x40) >> 6;
    }

    get parityError(): OnOff {
        return (this.status & 0x20) >> 5;
    }

    get frameError(): OnOff {
        return (this.status & 0x80) >> 7;
    }

    /**
     *
     * @param {number} status
     */
    readonly length: number;
    constructor(private type: number = 0x03, private status: number = 0x00) {
        this.type = type;
        this.status = status;
        this.length = STATUS_LENGTH;
    }

    /**
     *
     * @param {Buffer} buffer
     * @param {number} offset=0
     * @returns {ControlField}
     */
    static createFromBuffer(buffer: Buffer, offset: number = 0): StatusField {
        if (offset + STATUS_LENGTH >= buffer.length) {
            throw new Error(`offset ${offset} out of buffer range ${buffer.length}\nbuffer: ${buffer.toString('hex')}`);
        }
        const typeId = buffer.readUInt8(offset++);
        offset += 2;
        const status = buffer.readUInt8(offset);
        return new StatusField(typeId, status);
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(this.length);
        buffer.writeUInt8(this.type, 0);
        buffer.writeUInt8(0x01, 1);
        buffer.writeUInt8(this.status, 2);
        return buffer;
    }
}
