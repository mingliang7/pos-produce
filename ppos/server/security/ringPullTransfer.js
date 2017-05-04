import {RingPullTransfers} from '../../imports/api/collections/ringPullTransfer.js';

// Lib
import './_init.js';

RingPullTransfers.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
RingPullTransfers.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
RingPullTransfers.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
