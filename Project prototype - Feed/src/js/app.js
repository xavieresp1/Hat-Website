App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load hats.
    $.getJSON('../hats.json', function(data) {
      var hatsRow = $('#hatsRow');
      var hatTemplate = $('#hatTemplate');

      for (i = 0; i < data.length; i ++) {
        hatTemplate.find('.panel-title').text(data[i].name);
        hatTemplate.find('img').attr('src', data[i].img);
        hatTemplate.find('.brand').text(data[i].brand);
        hatTemplate.find('.yearMade').text(data[i].yearMade);
        hatTemplate.find('.reviews').text(data[i].reviews);
        hatTemplate.find('.btn-buy').attr('data-id', data[i].id);

        hatsRow.append(hatTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Transaction.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var TransactionArtifact = data;
      App.contracts.Transaction = TruffleContract(TransactionArtifact);
    
      // Set the provider for our contract
      App.contracts.Transaction.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the bought hats
      return App.markbought();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
  },

  markbought: function() {
    var TransactionInstance;

App.contracts.Transaction.deployed().then(function(instance) {
  TransactionInstance = instance;

  return TransactionInstance.getbuyers.call();
}).then(function(buyers) {
  for (i = 0; i < buyers.length; i++) {
    if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
      $('.panel-hat').eq(i).find('button').text('Success').attr('disabled', true);
    }
  }
}).catch(function(err) {
  console.log(err.message);
});
  },

  handleBuy: function(event) {
    event.preventDefault();

    var hatId = parseInt($(event.target).data('id'));

    var TransactionInstance;

web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];

  App.contracts.Transaction.deployed().then(function(instance) {
    TransactionInstance = instance;

    // Execute adopt as a transaction by sending account
    return TransactionInstance.buy(hatId, {from: account});
  }).then(function(result) {
    return App.markbought();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
