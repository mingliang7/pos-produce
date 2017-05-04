import {TransferMoney} from '../../imports/api/collections/transferMoney.js';

// Lib
import './_init.js';

TransferMoney.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
TransferMoney.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
TransferMoney.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
