angular.module('kpk.controllers').controller('sales', function($scope, $q, $location, $http, $routeParams, validate, connect, appstate, messenger, appcache) {
 
  //FIXME Global vs. item based prices are a hack
  //TODO Pass default debtor and inventory parameters to sale modules
  var dependencies = {}, invoice = {}, inventory = [], selectedInventory = {};
  var recoverCache = new appcache('sale');
  var session = $scope.session = { 
    tablock : -1
  }

  dependencies.sale = {
    query : '/max/id/sale'
  };

  dependencies.inventory = {
    required: true,
    query: { tables: {"inventory" : {columns: ["id", "code", "text", "price"]}}}
  };

  //Temporary seller ID, should happen on the server
  dependencies.seller = {
    query : 'user_session'
  };
  
  recoverCache.fetch('session').then(processRecover); 
  validate.process(dependencies).then(sales);

  function sales(model) {
    //Expose model to scope
    $scope.model = model;

   
    $scope.inventory = inventory = model.inventory.data;
  }

  function initialiseSaleDetails(selectedDebtor) {
    console.log(selectedDebtor);
    if(!selectedDebtor) return messenger.danger('No invoice debtor selected');
   
    // Release previous session items - if they exist
    if(invoice.items) {
      invoice.items.forEach(function (item, index) {
        if(item.code) {
          removeInvoiceItem(index);
        }
      });
    }

    buildInvoice(selectedDebtor);
   
    console.log('invoice', invoice);
    // Patient Groups

    // dependencies.priceList = {
    //   query : {
    //     tables : {
    //       assignation_patient : {columns : ['patient_group_id', 'patient_id']},
    //       patient_group : {columns : ['note']},
    //       price_list : {columns : ['id', 'name', 'title', 'discount', 'note']}
    //     },
    //     join : [
    //       'assignation_patient.patient_group_id=patient_group.id',
    //       'patient_group.price_list_id=price_list.id'
    //     ],
    //     where : [
    //       'assignation_patient.patient_id=' + selectedDebtor.id
    //     ]
    //   }
    // };
     
   
    dependencies.priceList = {
      query : {
        tables : {
          price_list: { columns : ['id', 'title'] },
          price_list_item : { columns : ['value', 'is_discount', 'is_global', 'description'] }
        },
        join : ['price_list_item.price_list_id=price_list.id'],
        where : ['price_list.id=' + selectedDebtor.price_list_id]
      }
    };
    validate.refresh(dependencies, ['priceList']).then(processPriceList);
  }

  function buildInvoice(selectedDebtor) {
    invoice = {
      debtor : selectedDebtor,
      id : createId($scope.model.sale.data.max),
      date : getDate(),
      items: []
    };

    invoice.note = formatNote(invoice);
    addInvoiceItem(); //Default invoice item
  
    $scope.invoice = invoice;
  }
 
  function processPriceList(model) {
    var priceLists = model.priceList.data;

    invoice.priceList = priceLists.sort(function (a, b) { (a.item_order===b.item_order) ? 0 : (a.item_order > b.item_order ? 1 : -1); });
    invoice.applyGlobal = [];

    invoice.priceList.forEach(function (listItem) {
      console.log('g', listItem.is_global, listItem);
      if (listItem.is_global) {
        invoice.applyGlobal.push(listItem);
        console.log(invoice.applyGlobal);
      }
    });
  }

  //Patient Groups
  // function processPriceList(model) {
  //   var selectedPriceList, priceLists = model.priceList.data;
  //   
  //   //naive implementation of resolving multiple price lists
  //   selectedPriceList = priceLists.sort(function(a, b) { return a.discount < b.discount; })[0];
  //   if(selectedPriceList) invoice.priceList = selectedPriceList;
  // }
  
  //TODO split inventory management into a seperate controller
  function addInvoiceItem() {
    invoice.items.push(new InvoiceItem());
  }
 
  //TODO rename legacy (previous) reference from inventoryReference
  function updateInvoiceItem(invoiceItem, inventoryReference) {
    if(invoiceItem.inventoryReference) {
      $scope.model.inventory.post(invoiceItem.inventoryReference);
      $scope.model.inventory.recalculateIndex();
    }

    invoiceItem.set(inventoryReference);
    invoiceItem.inventoryReference = inventoryReference;
 
    //Remove ability to selec the option again
    $scope.model.inventory.remove(inventoryReference.id);
    $scope.model.inventory.recalculateIndex();
  }

  function removeInvoiceItem(index) {
    var selectedItem = invoice.items[index];

    if(selectedItem.inventoryReference) {
      $scope.model.inventory.post(selectedItem.inventoryReference);
      $scope.model.inventory.recalculateIndex();
    }
    invoice.items.splice(index, 1);
  }

  function submitInvoice() {
    var invoiceRequest = packageInvoiceRequest();
  
    if(!validSaleProperties(invoiceRequest)) return;
    $http.post('sale/', invoiceRequest).then(handleSaleResponse);
  }

  function packageInvoiceRequest() {
    var requestContainer = {}, netDiscountPrice, totalCost;
   
    //Seller ID will be inserted on the server
    requestContainer.sale = {
      enterprise_id : appstate.get('enterprise').id,
      cost : calculateTotal(),
      currency_id : appstate.get('enterprise').currency_id,
      debitor_id : invoice.debtor.debitor_id,
      invoice_date : invoice.date,
      note : invoice.note
    };

    //Patient Groups
    // if(invoice.priceList) {
    //    //TODO Hacky
    //   netDiscountPrice = (calculateTotal(false) < invoice.priceList.discount) ? calculateTotal(false) : invoice.priceList.discount;
    //   requestContainer.sale.discount = netDiscountPrice;
    // }

    requestContainer.saleItems = [];
  
    invoice.items.forEach(function(saleItem) {
      var formatSaleItem;
      formatSaleItem = {
        inventory_id : saleItem.inventoryId,
        quantity : saleItem.quantity,
        inventory_price : saleItem.inventoryReference.price,
        transaction_price : saleItem.price,
        credit : Number((saleItem.price * saleItem.quantity).toFixed(4)),
        debit : 0
      };

      requestContainer.saleItems.push(formatSaleItem);
    });
   
    // Patient Groups
    // if(invoice.priceList) {
    //   //TODO Placeholder discount item select, this should be in enterprise settings
    //   var formatDiscountItem, enterpriseDiscountId=12;
    //   formatDiscountItem = {
    //     inventory_id : enterpriseDiscountId,
    //     quantity : 1,
    //     transaction_price : netDiscountPrice,
    //     debit : netDiscountPrice,
    //     credit : 0, //FIXME default values because parser cannot insert records with different columns
    //     inventory_price : 0
    //   };
   
      invoice.applyGlobal.forEach(function (listItem) {
        var applyCost, formatListItem, enterpriseDiscountId=1453; // FIXME Derive this from enterprise
        formatDiscountItem = {
          inventory_id : enterpriseDiscountId,
          quantity : 1,
          transaction_price : listItem.currentValue,
          debit : 0,
          credit : 0,
          inventory_price : 0
        };

        (listItem.is_discount) ?
          formatDiscountItem.debit = listItem.currentValue :
          formatDiscountItem.credit = listItem.currentValue;

        requestContainer.saleItems.push(formatDiscountItem);
    });
    return requestContainer;
  }

  function handleSaleResponse(result) {
    $location.path('/invoice/sale/' + result.data.saleId);
  }

  function validSaleProperties(saleRequest) {
    var sale = saleRequest.sale, saleItems = saleRequest.saleItems;
    var validItems;

    //Check sale item properties
    if(saleItems.length===0) {
      messenger.danger("[Invalid Sale] No sale items found");
      return false;
    }

    invalidItems = saleItems.some(function(saleItem) {
      for(property in saleItem) {
        if(angular.isUndefined(saleItem[property]) || saleItem[property]===null) return true;
      }
      if(isNaN(Number(saleItem.quantity))) return true;
      if(isNaN(Number(saleItem.transaction_price))) return true;
      return false;
    });
  
    if(invalidItems) {
      messenger.danger("[Invalid Sale] Sale items contain null values");
      return false;
    }
    return true;
  }

  //Utility methods
  //Guess transaction ID, this will not be used writing the transaction to the database
  function createId(current) {
    var defaultId = 1;
    return (current + 1) || defaultId;
  }

  function getDate() {
    //Format the current date according to RFC3339
    var currentDate = new Date();
    return currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + ('0' + currentDate.getDate()).slice(-2);
  }
 
  function formatNote(invoice) {
    var noteDebtor = invoice.debtor || "";
    return "PI/" + invoice.id + "/" + invoice.date + "/" + noteDebtor.name;
  }

  //TODO Refactor code
  function calculateTotal(includeDiscount) {
    var total = 0;
    includeDiscount = angular.isDefined(includeDiscount) ? includeDiscount : true;
  
    if(!invoice.items) return;
    invoice.items.forEach(function(item) {
      if(item.quantity && item.price) {
        //FIXME this could probably be calculated less somewhere else (only when they change)

        total += (item.quantity * item.price);

        total = Number(total.toFixed(4));
      }
    });
   
    invoice.applyGlobal.forEach(function (listItem) {
      listItem.currentValue = Number(((total * listItem.value) / 100).toFixed(4));

      total += listItem.currentValue;
      total = Number(total.toFixed(4));
    });
    console.log(total);
    return total;
  }

  $scope.isPayable = function() {
    if($scope.invoice.payable=="true") return true;
    return false;
  };

  $scope.itemsInInv = function() {
    if($scope.inventory.length>0) return true;
    return false;
  };

  //TODO clean up invoice item set properties
  function InvoiceItem() {
    var self = this;

    function set(inventoryReference) {
      var defaultPrice = inventoryReference.price;
     
      self.quantity = self.quantity || 1;
      self.code = inventoryReference.code;
      self.text = inventoryReference.text;

      // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
      self.price = Number(inventoryReference.price.toFixed(4));
      self.inventoryId = inventoryReference.id;
      self.note = "";
     

      // Temporary price list logic
      if(invoice.priceList) {
        invoice.priceList.forEach(function (list) {

          if(!list.is_global) {
            if(list.is_discount) {
              console.log('[DEBUG] Applying price list discount ', list.description, list.value);
              self.price -= Math.round((defaultPrice * list.value) / 100);
             
              // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
              self.price = Number(self.price.toFixed(4));
            } else {
              console.log('[DEBUG] Applying price list charge ', list.description, defaultPrice, list.value);
              var applyList = (defaultPrice * list.value) / 100;
              console.log(self.price, applyList);
              self.price += applyList;
             
              // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
              self.price = Number(self.price.toFixed(4));
              console.log(self.price);
            }
          }
        });
      }

      self.isSet = true;
    }

    this.quantity = 0,
    this.code = null,
    this.inventoryId = null,
    this.price = null,
    this.text = null,
    this.note = null,
    this.set = set;

    return this;
  }

  function processRecover(session) { 
    if(!session) return;

    console.log('loaded recovered session', session);
  }

  function toggleTablock() { 
    (session.tablock===0) ? session.tablock = -1 : session.tablock = 0;
  }

  $scope.initialiseSaleDetails = initialiseSaleDetails;
  $scope.addInvoiceItem = addInvoiceItem;
  $scope.updateInvoiceItem = updateInvoiceItem;
  $scope.removeInvoiceItem = removeInvoiceItem;
  $scope.submitInvoice = submitInvoice;
  $scope.calculateTotal = calculateTotal;
  $scope.toggleTablock = toggleTablock;
});
