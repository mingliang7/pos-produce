import {Truck} from '../../imports/api/collections/truck.js';

// Lib
import './_init.js';

Truck.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Truck.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Truck.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
