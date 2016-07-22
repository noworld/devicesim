//Basic device script
importClass(Packages.red.arpanet.cputest.BusMessage);
importClass(Packages.red.arpanet.cputest.SignalType);

var desc = "GREBBY Brand 27C64 8K Flash ROM chip";
var chipSize = 8192;
var mem = new Array(chipSize);

var nextMessage = null;

function init() {
	return true;
}

function poll() {
	var sendMessage = nextMessage;
	
	nextMessage = null;
	
	return sendMessage;
}

function run(busMsg) {
	
	if(busMsg == null) {
		return true;
	}
	
	if(busMsg.getActiveSignals().contains(SignalType.READ)) {
		//Build the response with the requested memory location
		nextMessage = new BusMessage();
		nextMessage.setSource(thisDevice);
		nextMessage.getActiveSignals().add(SignalType.ACK);	
		nextMessage.setAddress(busMsg.getAddress());
		nextMessage.setData(mem[busMsg.getAddress() - enableAddress]);
	}
	
	return true;
}