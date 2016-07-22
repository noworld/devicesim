importPackage(Packages.red.arpanet.cputest);
importClass(Packages.red.arpanet.cputest.BusMessage);
importClass(Packages.red.arpanet.cputest.SignalType);

/* *
 * 
 * Zaptron 80 (tm) 8-Bit CPU
 * 
 * Cycle:
 *  - T0 - M1
 *  - T1 - Fetch PC
 *  - T2 - Refresh
 *  - T3 - Refresh
 *  - T4 - Memory Read
 *  - T5 - Memory Write
 *  - T6 - Check Interrupt
 * */

var a, f, b, c, x, y, pc = 0, sp = 0;

var cycleCounter = 0;
var refresh = 32768;
var requestedAddress = -1;

function init() {
	return true();
}

function poll() {

	busMsg = new BusMessage();
	busMsg.setSource(thisDevice);
	requestedAddress = -1;
	
	if(cycleCounter == 0) {
		busMsg.getActiveSignals().add(SignalType.M1);				
	} else if(cycleCounter == 1) {		
		busMsg.getActiveSignals().add(SignalType.M1);
		busMsg.getActiveSignals().add(SignalType.FETCH);
		busMsg.getActiveSignals().add(SignalType.READ);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(pc);
		requestedAddress = pc;
	} else if(cycleCounter == 2 || cycleCounter == 3) {		
		busMsg.getActiveSignals().add(SignalType.REFRESH);
		busMsg.getActiveSignals().add(SignalType.WRITE);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(refresh);
		
		if(cycleCounter == 3) {
			refresh++;
		}
	} else if(cycleCounter == 4) {;
		busMsg.getActiveSignals().add(SignalType.READ);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(a);
		requestedAddress = a;
	} else if(cycleCounter == 5) {
		busMsg.getActiveSignals().add(SignalType.WERITE);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(b);
	} else if(cycleCounter == 6) {
		//Interrupt listen
		return null;
	}
	
	cycleCounter++;
	if(cycleCounter > 6) {
		cycleCounter = 0;
	}
	
	pc++;
	if(pc > 65535) {
		pc = 0;
	}
	
	refresh++;
	if(refresh > 65535) {
		pc = 0;
	}
	
	return new busMsg;
}

function run(var busMsg) {
	
	if(busMsg == null) {
		return false;
	}
	
	parseMessage(busMessage.getData());
	
	return true;
}

function parseMessage(data) {
	print('Parsing response message...\\n');
}