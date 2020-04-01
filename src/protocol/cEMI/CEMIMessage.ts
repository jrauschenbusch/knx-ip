
import { KNXDataBuffer } from '../KNXDataBuffer';
import { ControlField } from './ControlField';
import { KNXAddress } from '../KNXAddress';
import { NPDU } from './NPDU';

export class CEMIMessage {

    constructor(
        readonly msgCode: number,
        readonly length: number,
        readonly additionalInfo: KNXDataBuffer = null,
        readonly control: ControlField,
        readonly srcAddress: KNXAddress,
        readonly dstAddress: KNXAddress,
        readonly npdu: NPDU) {
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(2);
        buffer.writeUInt8(this.msgCode, 0);
        const len = this.additionalInfo == null ? 0 : this.additionalInfo.length;
        buffer.writeUInt8(len, 1);
        if (this.additionalInfo) {
            return Buffer.concat([buffer, this.additionalInfo.value]);
        }
        return buffer;
    }

    protected static GetLength(additionalInfo: KNXDataBuffer,
        control: ControlField,
        srcAddress: KNXAddress,
        dstAddress: KNXAddress,
        npdu: NPDU): number {

        const msgCodeLength = 1;
        const additionalInfoLengthFieldLength = 1;
        const additionalInfoLength = additionalInfo == null ? 0 : additionalInfo.length;
        const npduLength = npdu == null ? 0 : npdu.length;

        let length = msgCodeLength;
        length += additionalInfoLengthFieldLength;
        length += additionalInfoLength;
        length += control.length;
        length += srcAddress.length;
        length += dstAddress.length;
        length += npduLength;

        return length;
    }
}
