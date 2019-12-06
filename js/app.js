const contractSource = `
payable contract Auction =
  // Offer
  record offer = 
    { address   : address,
      amount    : int }

  // Property
  record property =
    { url            : string,
      title          : string,
      description    : string,
      latitude       : string, 
      longitude      : string, 
      limit          : int,
      minOffer       : int,
      available      : bool,
      offers     : map(address, offer) }

  record state = 
    { properties       : map(int, property),
      propertiesLength : int }

  // Init
  entrypoint init() = { properties = {}, propertiesLength = 0 }

  // Get Property
  entrypoint getProperty(propertyId: int) : property = 
    state.properties[propertyId]

  // Get Properties
  entrypoint getProperties() = 
    state.properties

  // Properties Length
  entrypoint getPropertiesLength() = state.propertiesLength

  // Create Property
  stateful entrypoint createProperty(url': string, title': string, description': string,
                                    latitude': string, longitude': string,
                                    limit': int, minOffer': int) =
    // Parse values
    let property = 
      { url = url',
        title = title',
        description = description', 
        latitude = latitude', 
        longitude = longitude', 
        limit = limit',
        minOffer = minOffer',
        available = true,
        offers = {} }
        
    let propertyId = getPropertiesLength()
    let newLength = propertyId + 1
    
    // save meeting in blockchain
    put(state{ properties[propertyId] = property, propertiesLength = newLength })

  // Auction Property
  payable stateful entrypoint auctionProperty(propertyId: int) =
    let property = getProperty(propertyId)
  
    // Validate available
    if (!property.available) abort("Property auction is finished!")
    
    // Validate min amount offer
    if (Call.value < property.minOffer) abort("The offer is less than the minimum!")
    
    let updatedLimit = property.limit - 1

    let offers = property.offers

    let offer =
      { address = Call.caller,
        amount = Call.value }
    
    let updatedOffers = offers{ [Call.caller] = offer }
    
    let updatedOffer = property{ offers = updatedOffers, limit = updatedLimit }
    
    let updatedOffers = state.properties{ [propertyId] = updatedOffer }
    
    // update state
    put(state{ properties = updatedOffers })
`;

//Address of the auction smart contract on the testnet of the aeternity blockchain
const contractAddress = 'ct_2gfQtqXXrzkKpd6iCqJTn8S2qiYEA6sfdy3GQFQouaZV85gf2t';

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

	client = await Ae.Aepp();
	propertiesLength = await callStatic('getPropertiesLength', []);

	//Loop
	for (let i = 1; i <= propertiesLength; i++) {
	    //Make the call to the blockchain to get all relevant information
	    const property = await callStatic('getProperty', [i]);

	    //Create object
	    propertyArray.push({
	      propertyTitle: property.title,
	      propertyUrl: property.url,
	      index: i,
	      limit: property.limit,
	    })
	}

	// Render properties template
  	renderProperties();

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