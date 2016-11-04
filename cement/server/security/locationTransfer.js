import {LocationTransfers} from '../../imports/api/collections/locationTransfer.js';

// Lib
import './_init.js';

LocationTransfers.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
LocationTransfers.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
LocationTransfers.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
