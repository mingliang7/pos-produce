import {ReceiveItems} from '../../imports/api/collections/receiveItem.js';

// Lib
import './_init.js';

ReceiveItems.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ReceiveItems.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ReceiveItems.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
