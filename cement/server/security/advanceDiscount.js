import {AdvanceDiscount} from '../../imports/api/collections/advanceDiscount.js';

// Lib
import './_init.js';

AdvanceDiscount.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
AdvanceDiscount.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
AdvanceDiscount.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
