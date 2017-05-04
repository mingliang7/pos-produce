import {AdvanceDiscount} from '../../imports/api/collections/advanceDiscount.js';

// Lib
import './_init.js';

AdvanceDiscount.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
AdvanceDiscount.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
AdvanceDiscount.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
