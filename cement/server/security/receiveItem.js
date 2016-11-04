import {ReceiveItems} from '../../imports/api/collections/receiveItem.js';

// Lib
import './_init.js';

ReceiveItems.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
ReceiveItems.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
ReceiveItems.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
