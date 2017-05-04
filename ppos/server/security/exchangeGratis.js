import {ExchangeGratis} from '../../imports/api/collections/exchangeGratis.js';

// Lib
import './_init.js';

ExchangeGratis.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
ExchangeGratis.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
ExchangeGratis.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
