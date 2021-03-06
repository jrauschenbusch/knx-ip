import { DataPoint } from './DataPoint';
import { DPTS } from '../DataPointTypes/DataPointTypeFactory';
import { KNXAddress } from '../protocol/KNXAddress';

export class Trigger extends DataPoint {
    constructor(ga: KNXAddress) {
        super(ga, DPTS.DPTTrigger);
    }
}
