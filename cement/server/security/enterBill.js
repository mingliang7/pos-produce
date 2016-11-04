import {EnterBills} from '../../imports/api/collections/enterBill.js';

// Lib
import './_init.js';

EnterBills.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
EnterBills.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
EnterBills.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
