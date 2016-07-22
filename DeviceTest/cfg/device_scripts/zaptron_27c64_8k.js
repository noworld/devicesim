//Basic device script
importClass(Packages.red.arpanet.cputest.BusMessage);
importClass(Packages.red.arpanet.cputest.SignalType);

var desc = "Zaptron 27C64 flash ROM chip.";

var chipSize = 8192;
var mem = new Array(chipSize);

var nextMessage = null;

function init() {
	return true;
}

function poll() {
	var busMsg = nextMessage;
	
	nextMessage = null;
	
	return busMsg;
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
