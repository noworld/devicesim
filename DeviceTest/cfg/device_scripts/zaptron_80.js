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

var cycleCounter = 0;
var refresh = 32768;
var requestedAddress = -1;
var opMsg;
var currentInstruction;
var operand1;
var operand2;

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
	
	if(cycleCounter == 0) {
		print("CPU Cycle 0 - Begin New Cycle\n");
		busMsg.getActiveSignals().add(SignalType.M1);				
	} else if(cycleCounter == 1) {		
		print("CPU Cycle 1 - Fetch Instruction\n");
		busMsg.getActiveSignals().add(SignalType.FETCH);
		busMsg.getActiveSignals().add(SignalType.READ);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(pc);
		requestedAddress = pc++;
	} else if(cycleCounter == 2 || cycleCounter == 3) {
		print("CPU Cycle " + cycleCounter + " - Refresh\n");
		busMsg.getActiveSignals().add(SignalType.REFRESH);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(refresh);
		
		if(cycleCounter == 3) {
			refresh++;
		}
	} else if(cycleCounter == 4) {;
		print("CPU Cycle 4 - Read Memory\n");
		
		if(opMsg !== null 
				&& opMsg.getActiveSignals().contains(SignalType.READ)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = null;
		}
			
	} else if(cycleCounter == 5) {
		print("CPU Cycle 5 - Write Memory\n");
		
		if(opMsg !== null 
				&& opMsg.getActiveSignals().contains(SignalType.WRITE)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = null;
		}
		
	} else if(cycleCounter == 6) {
		print("CPU Cycle 6 - Interrupt Listen\n");
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
	
	parseMessage(busMsg.getData());
	
	print("Response source: " + busMsg.getSource().getName() + "\n");
	print("Response address: " + busMsg.getAddress() + "\n");
	print("Response data: " + busMsg.getData() + "\n");
	
	return true;
}

function parseMessage(data) {
	print('Parsing response message...\n');
	
	//If we have a new instruction
	if(currentInstruction === "") {
		currentInstruction = data;
	} else if(operand1 === "") {
		operand1 = data;
	} else if(operand2 === "") {
		operand2 = data;
	}	

}

function executeInstruction() {

	if(currentInstruction === "LDA") {
		//if we have a full LDA instruction
		if(operand1 !=== "") {
			opMsg = new BusMessage();
			opMsg.setSource(thisDevice);
			opMsg.setAddress(operand1);
			opMsg.getActiveSignals().add(SignalType.READ);
			opMsg.getActiveSignals().add(SignalType.MEMORY);
		}
	}
}