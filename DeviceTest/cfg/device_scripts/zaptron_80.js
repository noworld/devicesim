importClass(Packages.red.arpanet.cputest.BusMessage);
importClass(Packages.red.arpanet.cputest.SignalType);

var desc = "Zaptron 80 CPU - Better than the Zaptron 79!";

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
 *  
 *  Instruction Set
 *  
 *  LDA n - Load accumulator with data from memory location n 
 * */

var a=0, f=0, b=0, c=0, x=0, y=0, pc = 0, sp = 0;

var instructionQueue = new Array();
var cycleCounter = 0;
var refresh = 32768;
var requestedAddress = -1;
var opMsg;

function init() {
	return true;
}

function enable(busMsg) {
	if(busMsg === null) {
		return false;
	}
	
	return busMsg.getAddress() == requestedAddress;
}

function poll() {

	busMsg = new BusMessage();
	busMsg.setSource(thisDevice);
	requestedAddress = -1;	
	
	print("Value of accumulator: " + a);
	
	if(cycleCounter == 0) {
		print("CPU Cycle 0 - Begin New Cycle");
		busMsg.getActiveSignals().add(SignalType.M1);				
	} else if(cycleCounter == 1) {		
		print("CPU Cycle 1 - Fetch Instruction");
		busMsg.getActiveSignals().add(SignalType.FETCH);
		busMsg.getActiveSignals().add(SignalType.READ);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(pc);
		requestedAddress = pc++;
	} else if(cycleCounter == 2 || cycleCounter == 3) {
		print("CPU Cycle " + cycleCounter + " - Refresh");
		busMsg.getActiveSignals().add(SignalType.REFRESH);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(refresh);
		
		if(cycleCounter == 3) {
			refresh++;
		}
	} else if(cycleCounter == 4) {;
		print("CPU Cycle 4 - Read Memory");
		
		if(opMsg !== undefined 
				&& opMsg.getActiveSignals().contains(SignalType.READ)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = undefined;
		}
			
	} else if(cycleCounter == 5) {
		print("CPU Cycle 5 - Write Memory");
		
		if(opMsg !== undefined 
				&& opMsg.getActiveSignals().contains(SignalType.WRITE)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = undefined;
		}
		
	} else if(cycleCounter == 6) {
		print("CPU Cycle 6 - Interrupt Listen");
		//Interrupt listen
		busMsg = null;
	}
	
	executeInstruction();
		
	if(cycleCounter++ > 6) {
		cycleCounter = 0;
	}

	if(pc > 65535) {
		pc = 0;
	}

	if(refresh > 65535) {
		refresh = 0;
	}
	
	return busMsg;
}

function run(busMsg) {
	
	if(busMsg === null) {
		return false;
	}
	
	instructionQueue.push(busMsg.getData());
	
	print("Response source: " + busMsg.getSource().getName() + "");
	print("Response address: " + busMsg.getAddress() + "");
	print("Response data: " + busMsg.getData() + "");
	
	return true;
}

function executeInstruction() {

	print("Executing instruction cycle. Queue size is: " + instructionQueue.length + ".");
	
	if(instructionQueue.length > 0) {
		
		print("Head of queue is: " + instructionQueue[0] + ""); 
		
		if(instructionQueue[0] == "LDA") {
			print("Instruction is LDA. Queue size is: " + instructionQueue.length + ".");

			//On the second fetch, we have a full
			//LDA instruction and we can fetch the
			//memory location
			if(instructionQueue.length == 2) {
				print("Creating LDA memory fetch.");
				opMsg = new BusMessage();
				opMsg.setSource(thisDevice);
				opMsg.setAddress(instructionQueue[1]);
				opMsg.getActiveSignals().add(SignalType.READ);
				opMsg.getActiveSignals().add(SignalType.MEMORY);
			} else if(instructionQueue.length > 2){
				print("Saving retrieved value to accumulator.");
				a = instructionQueue[2];
				instructionQueue = [];
			}
		}
	}
}