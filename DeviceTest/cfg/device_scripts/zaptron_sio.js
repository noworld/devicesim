//Basic device script
importClass(Packages.red.arpanet.cputest.BusMessage);
importClass(Packages.red.arpanet.cputest.SignalType);

var desc = "Zaptron Serial I/O Chip";

var buf1 = new Array();
var buf2 = new Array();

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
		//Build the response with the requested buffer
		nextMessage = new BusMessage();
		nextMessage.setSource(thisDevice);
		nextMessage.getActiveSignals().add(SignalType.ACK);	
		nextMessage.setAddress(busMsg.getAddress());
		
		if(busMsg.getAddress() - enableAddress == 0) {
			nextMessage.setData(buf1.pop());
		} else if(busMsg.getAddress() - enableAddress == 1) {
			nextMessage.setData(buf2.pop());
		}
	
	} else if(busMsg.getActiveSignals().contains(SignalType.WRITE)) {
		//Write to the specified memory location

		if(busMsg.getAddress() - enableAddress == 0) {
			nextMessage.setData(buf1.push(busMsg.getData()));
		} else if(busMsg.getAddress() - enableAddress == 1) {
			nextMessage.setData(buf2.push(busMsg.getData()));
		}
		
		nextMessage = null;
	}
	
	return true;
}