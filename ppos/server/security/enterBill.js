import {EnterBills} from '../../imports/api/collections/enterBill.js';

// Lib
import './_init.js';

EnterBills.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
EnterBills.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
EnterBills.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
