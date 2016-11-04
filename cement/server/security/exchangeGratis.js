import {ExchangeGratis} from '../../imports/api/collections/exchangeGratis.js';

// Lib
import './_init.js';

ExchangeGratis.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
ExchangeGratis.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
ExchangeGratis.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
