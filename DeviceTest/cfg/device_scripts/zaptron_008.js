importClass(Packages.red.arpanet.cputest.BusMessage);
importClass(Packages.red.arpanet.cputest.SignalType);

var desc = "Zaptron x008 Microcomputer Brain - Buy a computer for the price of a compact car!";

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
 *  */

var a=0, f= new Int8(), x=0, y=0, pc = 0, sp = 0;

//TODO: Use signed bytes instead of variables
//TODO: Convert to true 8-bit
var accum = 0;
var flags = 1;
var xreg = 2;
var yreg = 3;
var pcounter = 4;
var stackp = 5;
var registers = new Int8Array(6);

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
	
	d("Value of accumulator: " + a + "");
	
	if(cycleCounter == 0) {
		d("CPU Cycle 0 - Begin New Cycle");
		busMsg.getActiveSignals().add(SignalType.M1);				
	} else if(cycleCounter == 1) {		
		d("CPU Cycle 1 - Fetch Instruction");
		busMsg.getActiveSignals().add(SignalType.FETCH);
		busMsg.getActiveSignals().add(SignalType.READ);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(pc);
		requestedAddress = pc++;
	} else if(cycleCounter == 2 || cycleCounter == 3) {
		d("CPU Cycle " + cycleCounter + " - Refresh");
		busMsg.getActiveSignals().add(SignalType.REFRESH);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(refresh);
		
		if(cycleCounter == 3) {
			refresh++;
		}
	} else if(cycleCounter == 4) {;
		d("CPU Cycle 4 - Read Memory");
		
		if(opMsg !== undefined 
				&& opMsg.getActiveSignals().contains(SignalType.READ)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = undefined;
		}
			
	} else if(cycleCounter == 5) {
		d("CPU Cycle 5 - Write Memory");
		
		if(opMsg !== undefined 
				&& opMsg.getActiveSignals().contains(SignalType.WRITE)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = undefined;
		}
		
	} else if(cycleCounter == 6) {
		d("CPU Cycle 6 - Interrupt Listen");
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
	
	d("Response source: " + busMsg.getSource().getName() + "");
	d("Response address: " + busMsg.getAddress() + "");
	d("Response data: " + busMsg.getData() + "");
	
	return true;
}

function executeInstruction() {

	d("Executing instruction cycle. Queue size is: " + instructionQueue.length + ".");
	
	if(instructionQueue.length > 0) {
		
		d("Head of queue is: " + instructionQueue[0] + ""); 
		
		var func = executionUnit[instructionQueue[0]];
		if(func != undefined) {
			func();
		} else {
			//Head of queue is not a valid instruction
			instructionQueue = [];
		}
		
	}
}

/* *
 * 
 *	TODO: Separate the execution unit out into
 *	a static object to optimize performance?
 *
 *  *  Instruction Set
 *  
 *  LDA n		- Load accumulator with data from memory location n
 *   
 *  Lnm 		- Load register n with contents of register m
 *  				+ valid values of n: a, x, y
 *  				+ valid values of n: a, x, y
 *  				+ When n is A:
 *  					m may be S for "stack pointer"
 *  					m may be P for "Program Counter"
 *  					
 *  INn			- Increment register n
 *  				+ valid values of n: a, x, y
 *  
 *  DCn			- Decrement register n
 *  				+ valid values of n: a, x, y
 *  
 *  ADn			- Adds the value of register n to the accumulator
 *  				+ valid values of n: a, x, y
 *  
 *  ADM x		- Adds the value stored at memory location x
 *  				to the accumulator 
 *  
 *  SUn			- Subtracts the value of register n from the accumulator
 *  				+ valid values of n: x, y
 *  
 *  SUM x		- Subtracts the value stored at memory location x
 *  				from the accumulator
 *  
 * 
 * */

var executionUnit = {
	//No Operation
	"NOP" : Nop,
	//Load group
	"LDA" : Lda,
	"LAF" : Laf,
	"LAX" : Lax,
	"LAY" : Lay,
	"LAP" : Lap,
	"LAS" : Las,
	"LXA" : Lxa,
	"LXY" : Lxy,
	"LYA" : Lya,
	"LYX" : Lyx,
	
	//Increment/Decrement
	"INA" : Ina,
	"INX" : Inx,
	"INX" : Inx,
	"DCA" : Dca,
	"DCX" : Dcx,
	"DCY" : Dcy,
	
	//Add/Subtract
	"ADA" : Ada,
	"ADX" : Adx,
	"ADY" : Ady,
	"ADM" : Adm,
	"SUX" : Sux,
	"SUY" : Suy,
	"SUM" : Sum,
};

function Nop() {
	d("Instruction is Nop.");
	instructionQueue = [];
}

function Lda() {
	d("Instruction is LDA. Queue size is: " + instructionQueue.length + ".");

	//On the second fetch, we have a full
	//LDA instruction and we can fetch the
	//memory location
	if(instructionQueue.length == 2) {
		d("Creating LDA memory fetch.");
		opMsg = new BusMessage();
		opMsg.setSource(thisDevice);
		opMsg.setAddress(instructionQueue[1]);
		opMsg.getActiveSignals().add(SignalType.READ);
		opMsg.getActiveSignals().add(SignalType.MEMORY);
	} else if(instructionQueue.length > 2){
		d("Saving retrieved value to accumulator.");
		a = instructionQueue[2];
		instructionQueue = [];
	}
}

function Laf() {
	d("Instruction is LAF. Queue size is: " + instructionQueue.length + ".");
	
	d("Loading accumulator with contents of flags register.");
	
	a = f;
	
	instructionQueue = [];
}

function Lax() {
	d("Instruction is LAX. Queue size is: " + instructionQueue.length + ".");
	
	d("Loading accumulator with contents of x register.");
	
	a = x;
	
	instructionQueue = [];
}

function Lay() {
	d("Instruction is LAY. Queue size is: " + instructionQueue.length + ".");
	
	d("Loading accumulator with contents of y register.");
	
	a = y;
	
	instructionQueue = [];
}

function Lap() {
	d("Instruction is LAP. Queue size is: " + instructionQueue.length + ".");
	
	d("Loading accumulator with contents of program counter register.");
	
	a = pc;
	
	instructionQueue = [];
}

function Las() {
	d("Instruction is LAS. Queue size is: " + instructionQueue.length + ".");
	
	d("Loading accumulator with contents of stack pointer register.");
	
	a = sp;
	
	instructionQueue = [];
}

function Lxa() {
	d("Instruction is LXA. Queue size is: " + instructionQueue.length + ".");
	
	d("Loading register x with contents of accumulator.");
	
	x = a;
	
	instructionQueue = [];
}

function Lxy() {
	
	d("Loading register x with contents of y register.");
	
	x = y;
	
	instructionQueue = [];
}

function Lya() {
	
	d("Loading register y with contents of accumulator.");
	
	y = a;
	
	instructionQueue = [];
}

function Lyx() {
	
	d("Loading register y with contents of x register.");
	
	y = x;
	
	instructionQueue = [];
}

function Ina() {

	d("Incrementing the accumulator.");
	
	a++;
	
	instructionQueue = [];
}

function Inx() {
	
	d("Incrementing the x register.");
	
	x++;
	
	instructionQueue = [];
}

function Iny() {
	
	d("Incrementing the y register.");
	
	y++;
	
	instructionQueue = [];
}

function Dca() {
	
	d("Decrementing the accumulator.");
	
	a--;
	
	instructionQueue = [];
}

function Dcx() {
	
	d("Decrementing the x register.");
	
	x--;
	
	instructionQueue = [];
}

function Dcy() {
	
	d("Decrementing the y register.");
	
	y--;
	
	instructionQueue = [];
}

function Ada() {
	
	d("Adding the value of the accumulator to the... accumulator?");
	
	a += a;
	
	instructionQueue = [];
}

function Adx() {
	
	d("Adding the value of the x register to the accumulator.");
	
	a += x;
	
	instructionQueue = [];
}

function Ady() {
	
	d("Adding the value of the y register to the accumulator.");
	
	a += y;
	
	instructionQueue = [];
}

function Adm() {

	d("Adding the value of memory location to the accumulator.");

	//On the second fetch, we have a full
	//LDA instruction and we can fetch the
	//memory location
	if(instructionQueue.length == 2) {
		d("Creating ADM memory fetch.");
		opMsg = new BusMessage();
		opMsg.setSource(thisDevice);
		opMsg.setAddress(instructionQueue[1]);
		opMsg.getActiveSignals().add(SignalType.READ);
		opMsg.getActiveSignals().add(SignalType.MEMORY);
	} else if(instructionQueue.length > 2){
		d("Adding retrieved value to accumulator.");
		a += instructionQueue[2];
		instructionQueue = [];
	}
}

function Sux() {
	
	d("Subtracting the value of the x register from the accumulator.");
	
	a -= x;
	
	instructionQueue = [];
}

function Suy() {
	
	d("Subtracting the value of the y register from the accumulator.");
	
	a -= y;
	
	instructionQueue = [];
}

function Sum() {

	d("Subtracting the value of memory location from the accumulator.");

	//On the second fetch, we have a full
	//LDA instruction and we can fetch the
	//memory location
	if(instructionQueue.length == 2) {
		d("Creating SUM memory fetch.");
		opMsg = new BusMessage();
		opMsg.setSource(thisDevice);
		opMsg.setAddress(instructionQueue[1]);
		opMsg.getActiveSignals().add(SignalType.READ);
		opMsg.getActiveSignals().add(SignalType.MEMORY);
	} else if(instructionQueue.length > 2){
		d("Subtracting retrieved value from accumulator.");
		a -= instructionQueue[2];
		instructionQueue = [];
	}
}