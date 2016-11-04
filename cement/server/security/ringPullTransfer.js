import {RingPullTransfers} from '../../imports/api/collections/ringPullTransfer.js';

// Lib
import './_init.js';

RingPullTransfers.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
RingPullTransfers.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
RingPullTransfers.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
