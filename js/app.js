//Address of the auction smart contract on the testnet of the aeternity blockchain
const contractAddress = 'ct_CxxTpqYdtqhzVjCtggeV4obBtwW6hLjsmTUhWzDXFS417Sqe6';

//Create variable for client so it can be used in different functions
var client = null;

// Properties
var properties = [];

// Length properties
var propertiesLength = 0;

function renderProperties() {
  	properties = properties.sort(function(a,b){return b.votes-a.votes})
  	console.log(properties);
  	var template = $('#template').html();
  	Mustache.parse(template);
  	var rendered = Mustache.render(template, {properties});
  	$('#propertyBody').html(rendered);
}

//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

//Create a asynchronous write call for our smart contract
async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
	loadingShow();

	// client = await Ae.Aepp();
	// propertiesLength = await callStatic('getPropertiesLength', []);

	// //Loop
	// for (let i = 1; i <= propertiesLength; i++) {
	//     //Make the call to the blockchain to get all relevant information
	//     const property = await callStatic('getProperty', [i]);

	//     //Create object
	//     propertyArray.push({
	//       propertyTitle: property.title,
	//       propertyUrl: property.url,
	//       index: i,
	//       limit: property.limit,
	//     })
	// }

	// // Render properties template
 //  	renderProperties();

  	// Loading Hide
  	loadingHide();
});

function loadingShow() {
    $('#loading').addClass('d-flex');
    $('#loading').removeClass('d-none');
}

function loadingHide() {
    $('#loading').removeClass('d-flex');
    $('#loading').addClass('d-none');
}