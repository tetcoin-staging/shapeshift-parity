var JP = JSON.parse;
var JS = JSON.stringify;

function CreateXmlHttp(){
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlhttp;
}

function AjaxRequest(xmlhttp, apiEp, data, cb) {
  if(cb === undefined){
    cb = data;
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        var parsedResponse = JP(xmlhttp.responseText);
        cb.apply(null, [parsedResponse]);
      } else {
        cb.apply(null, [new Error('Request Failed')])
      }
    }
  };

  var url='https://shapeshift.io/'+apiEp.path;
  var type = apiEp.method;

  xmlhttp.open(apiEp.method, url, true);
  if(type.toUpperCase() === 'POST') {
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JS(data));
  } else if(type.toUpperCase() === 'GET') {
    xmlhttp.send();
  }
}

var endPoints = {
  Rate : { path : 'rate', method : 'GET' }
  , DepositLimit : { path : 'limit', method : 'GET' }
  , MarketInfo : { path : 'marketinfo', method : 'GET' }
  , RecentTxList : { path : 'recenttx', method : 'GET' }
  , StatusOfDepositToAddress : { path : 'txStat', method : 'GET' }
  , TimeRemainingFixedAmountTx : { path : 'timeremaining', method : 'GET' }
  , GetCoins : { path : 'getcoins', method : 'GET' }
  , GetTxListWithKey : { path : 'txbyapikey', method : 'GET' }
  , GetTxToAddressWithKey : { path : 'txbyaddress', method : 'GET' }
  , ValidateAddress : { path : 'validateAddress', method : 'GET' }
  , NormalTx : { path : 'shift', method : 'POST'}
  , RequestEmailReceipt : { path : 'mail', method : 'POST'}
  , FixedAmountTx : { path: 'sendamount', method : 'POST'}
  , QuoteSendExactPrice : { path: 'sendamount', method : 'POST'}
  , CancelPendingTx : { path: 'cancelpending', method : 'POST'}
};

function coinPairer(coin1, coin2){
  var pair = null;

  if(coin1 === undefined && coin2 === undefined) return '';
  if(typeof(coin1) === 'function') return '';
  if(typeof(coin2) === 'function') return coin1.toLowerCase();
  if(coin1 === undefined) return pair;
  if(coin2 === undefined) return coin1.toLowerCase();
  return coin1.toLowerCase()+'_'+coin2.toLowerCase();
}

function getArgsAdder(endPoint, args){
  var clone = {
    path : endPoint.path,
    method : endPoint.method
  };
  if(args !== undefined && args[0] !== null){
    for(var i = 0; i < args.length; i++) {
      clone.path = clone.path + '/' + args[i];
    }
  }

  return clone;
}

function cbProtector(cb, data){
  if(cb === undefined) return;
  if(typeof(cb) === 'function') cb(data);
}

function ShapeShiftApi(publicApiKey) { this.apiPubKey = publicApiKey; }

var SS=ShapeShiftApi.prototype;

SS.GetRate = function(coin1, coin2, cb) {
  var pair = coinPairer(coin1, coin2);
  var apiEp = getArgsAdder(endPoints.Rate, pair);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

SS.GetDepositLimit = function(coin1, coin2, cb) {
  var pair = coinPairer(coin1, coin2);
  var apiEp = getArgsAdder(endPoints.DepositLimit, [pair]);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

SS.GetMarketInfo = function(coin1, coin2, cb) {
  var pair = coinPairer(coin1, coin2);
  if(typeof(coin1) === 'function') cb = coin1;
  if(typeof(coin2) === 'function') cb = coin2;
  var apiEp = getArgsAdder(endPoints.MarketInfo, [pair]);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

SS.GetRecentTxList = function(max, cb) {
  if(typeof(max) === 'function') cb = max;
  var apiEp = getArgsAdder(endPoints.RecentTxList, [max]);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

SS.GetStatusOfDepositToAddress = function(address, cb){
  if(address === undefined) throw new Error('no address provided');
  var apiEp = getArgsAdder(endPoints.StatusOfDepositToAddress, [address]);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

SS.GetTimeRemainingFxiedAmountTx = function(address, cb){
  if(address === undefined) throw new Error('no address provided');
  var apiEp = getArgsAdder(endPoints.TimeRemainingFixedAmountTx, [address]);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);

  });
};

SS.GetCoins = function(cb) {
  var apiEp = getArgsAdder(endPoints.GetCoins);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

SS.GetTxListWithKey = function() {
  //TODO do we care about exposing private api key functions?
};

SS.GetTxToAddressWithKey = function() {
  //TODO do we care about exposing private api key functions?
};

SS.ValidateAdddress = function(address, coinSymbol, cb) {
  if(address === undefined) throw new Error('no address provided');
  if(coinSymbol === undefined) throw new Error('no coin symbol provided');
  var apiEp = getArgsAdder(endPoints.ValidateAddress, [address, coinSymbol]);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, function(response) {
    cbProtector(cb, response);
  });
};

function NormalTxValidate(data, ss) {
  if(data.withdrawal === undefined) throw new Error('no withdrawal address');
  if(data.pair === undefined) throw new Error('no pair given');
  //TODO check if valid pair
  //TODO check if any other data in there is valid
  if(ss.apiKey) data.apiKey = ss.apiPubKey;
  return data;
}

SS.CreateNormalTx = function(withdrawalAddress, coin1, coin2){
  var NormalTx = {
    withdrawal : withdrawalAddress,
    pair: coinPairer(coin1, coin2)
  };
  return NormalTx;
};
SS.NormalTx = function(data, cb) {
  data = NormalTxValidate(data, this);
  var apiEp = getArgsAdder(endPoints.NormalTx, []);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, data, function(response) {
    cbProtector(cb, response);
  });
};

function RequestEmailValidate(data, ss) {
  if(data.email === undefined) throw new Error('no email given');
  if(data.txid === undefined) throw new Error('no txid given');
  //TODO check if valid pair
  //TODO check if any other data in there is valid

  data.apiPubKey = ss.apiPubKey;
  return data;
}

SS.RequestEmailReceipt = function(data, cb) {
  //TODO validateData(data);
  data = RequestEmailValidate(data, this);
  var apiEp = getArgsAdder(endPoints.RequestEmailReceipt);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, data, function(response) {
    cbProtector(cb, response);
  });
};

function FixedAmountValidate(data, ss) {
  if(data.withdrawal === undefined) throw new Error('no withdrawal address');
  if(data.pair === undefined) throw new Error('no pair given');
  if(data.amount === undefined) throw new Error('no amount given');
  //TODO check if valid pair
  //TODO check if any other data in there is valid

  data.apiPubKey = ss.apiPubKey;
  return data;
}

SS.CreateFixedTx = function(amount, withdrawalAddress, coin1, coin2){
  var NormalTx = {
    amount : amount,
    withdrawal : withdrawalAddress,
    pair: coinPairer(coin1, coin2)
  };
  return NormalTx;
};

SS.FixedAmountTx = function(data, cb) {
  //TODO validateData(data);
  data = FixedAmountValidate(data, this);
  var apiEp = getArgsAdder(endPoints.FixedAmountTx);
  var xmlhttp = CreateXmlHttp();
  console.log(data);
  AjaxRequest(xmlhttp, apiEp, data, function(response) {
    cbProtector(cb, response);
  });
};

function QuoteSendValidate(data, ss) {
  if(data.pair === undefined) throw new Error('no pair given');
  if(data.amount === undefined) throw new Error('no amount given');
  //ss.GetMarketInfo(data.pair, function(mkinfo){
  //TODO implement check of min of the market
  //});
  if(ss.apiKey) data.apiKey = ss.apiPubKey;
  return data;
}

SS.QuoteSendExactPrice = function(data, cb) {
  //TODO validateData(data);
  data = QuoteSendValidate(data, this);
  var apiEp = getArgsAdder(endPoints.QuoteSendExactPrice);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, data, function(response) {
    cbProtector(cb, response);
  });
};

function CancelPendingValidate(data, ss) {
  if(typeof(data) === 'object') return data;
  if(data.address === undefined) throw new Error('no address given');
  if(typeof(data) === 'String') {
    var address = data;
    data = { address : address }
  }
  if(ss.apiKey) data.apiKey = ss.apiPubKey;
  return data;
}

SS.CancelPendingTx = function(data, cb) {
  data = CancelPendingValidate(data, this);
  var apiEp = getArgsAdder(endPoints.CancelPendingTx);
  var xmlhttp = CreateXmlHttp();
  AjaxRequest(xmlhttp, apiEp, data, function(response) {
    cbProtector(cb, response);
  });
};

export default {
  ShapeShiftApi
}


// var PUBLIC_API_KEY = '08ef330fe264f674ddd4943a5156cfb1ea06f10b95d5db54781afa3d8b108100874083d53b28afa5ce58bf3e834158a3114db725bce5b49da9454ef036753599'
// var SSA = new ShapeShift.ShapeShiftApi(PUBLIC_API_KEY);




