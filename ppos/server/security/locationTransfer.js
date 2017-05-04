import {LocationTransfers} from '../../imports/api/collections/locationTransfer.js';

// Lib
import './_init.js';

LocationTransfers.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
LocationTransfers.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
LocationTransfers.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
