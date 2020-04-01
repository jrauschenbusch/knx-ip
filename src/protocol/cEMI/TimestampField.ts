const MINIMAL_LENGTH = 4;

export enum TimestampType {
    normal = 0x04,
    extended = 0x06
}

export class TimestampField {

    /**
     *
     * @param {number} type
     * @param {number} timestamp
     */
    readonly length: number;
    constructor(private type: TimestampType = TimestampType.normal, private timestamp: number = 0) {
        this.type = type;
        this.timestamp = timestamp;
        this.length = MINIMAL_LENGTH;
        if (type === TimestampType.extended) {
            this.length += 2;
        }
    }

    /**
     *
     * @param {Buffer} buffer
     * @param {number} offset=0
     * @returns {ControlField}
     */
    static createFromBuffer(buffer: Buffer, offset: number = 0): TimestampField {
        if (offset + 2 >= buffer.length) {
            throw new Error(`offset ${offset} out of buffer range ${buffer.length}\nbuffer: ${buffer.toString('hex')}`);
        }
        const type = buffer.readUInt8(offset++);
        const length = buffer.readUInt8(offset++);
        let timestamp: number;
        if (length > 2) {
            timestamp = buffer.readUInt8(offset++);
            timestamp = timestamp << 8 | buffer.readUInt8(offset++);
        }
        timestamp = timestamp << 8 | buffer.readUInt8(offset++);
        timestamp = timestamp << 8 | buffer.readUInt8(offset);
        return new TimestampField(type, timestamp);
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(this.length);
        buffer.writeUInt8(this.type, 0);
        buffer.writeUInt8(this.length, 1);
        let i = 2;
        if (this.type === TimestampType.extended) {
            buffer.writeUInt8(this.timestamp >> 24, i++);
            buffer.writeUInt8(this.timestamp >> 16, i++);
        }
        buffer.writeUInt8(this.timestamp >> 8, i++);
        buffer.writeUInt8(this.timestamp, i++);
        return buffer;
    }
}
