import {TransferMoney} from '../../imports/api/collections/transferMoney.js';

// Lib
import './_init.js';

TransferMoney.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
TransferMoney.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
TransferMoney.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
