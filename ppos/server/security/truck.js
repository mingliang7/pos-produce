import {Truck} from '../../imports/api/collections/truck.js';

// Lib
import './_init.js';

Truck.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Truck.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Truck.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
