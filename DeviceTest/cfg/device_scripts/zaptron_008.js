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

var a   = 0;	//Accumulator
var f   = 1;	//Flags
var x   = 2;	//X Register
var y   = 3;	//Y Register
var pc = 4;		//Program Counter
var sp = 5;		//Stack Pointer

/*
 * FLAGS
 * (MSB) RESERVED - RESERVED - OVERFLOW - CARRY - ZERO - NEGATIVE - RESERVED - RESERVED (LSB)   
 */
var vmask = 0x20;
var cmask = 0x10;
var zmask = 0x08;
var nmask = 0x04;


var regs = new Int8Array(6);
var instructionQueue = new Int8Array(1);
var cycleCounter = 0;
var requestedAddress = -1;
var opMsg;

function init() {
	d("Initializing Zaptron 008 CPU.");
	for(var i = 0; i < regs.length; i++) {
		regs[i] = 0x00;
	}	
	
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
	
	d("Value of accumulator: " + regs[a]);
	d("Value of flags: " + regs[f]);
	d("Value of x register: " + regs[x]);
	d("Value of y register: " + regs[y]);
	d("Value of stack pointer: " + regs[sp]);
	d("Value of program counter: " + regs[pc]);
	
	if(cycleCounter == 0) {
		d("CPU Cycle 0 - Begin New Cycle");
		busMsg.getActiveSignals().add(SignalType.M1);				
	} else if(cycleCounter == 1) {		
		d("CPU Cycle 1 - Fetch Instruction");
		busMsg.getActiveSignals().add(SignalType.FETCH);
		busMsg.getActiveSignals().add(SignalType.READ);
		busMsg.getActiveSignals().add(SignalType.MEMORY);		
		busMsg.setAddress(regs[pc]);
		requestedAddress = regs[pc]++;
	} else if(cycleCounter == 2) {;
		d("CPU Cycle 4 - Read Memory");
		
		if(opMsg !== undefined 
				&& opMsg.getActiveSignals().contains(SignalType.READ)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = undefined;
		}
			
	} else if(cycleCounter == 3) {
		d("CPU Cycle 5 - Write Memory");
		
		if(opMsg !== undefined 
				&& opMsg.getActiveSignals().contains(SignalType.WRITE)
				&& opMsg.getActiveSignals().contains(SignalType.MEMORY)) {
			
			busMsg = opMsg;
			opMsg = undefined;
		}
		
	} else if(cycleCounter == 4) {
		d("CPU Cycle 6 - Interrupt Listen");
		//Interrupt listen
		busMsg = null;
	}
	
	executeInstruction();
		
	if(cycleCounter++ > 4) {
		cycleCounter = 0;
	}

	if(regs[pc] > 0xFF) {
		regs[pc] = 0xFF;
	}

	return busMsg;
}

function run(busMsg) {
	
	if(busMsg === null) {
		return false;
	}
	
	d("Response source: " + busMsg.getSource().getName());
	d("Response address: " + busMsg.getAddress());
	d("Response data: " + busMsg.getData());
	
	//Put the next memory location on the instruction queue
	instructionQueue.push(busMsg.getData());
	
	return true;
}

function executeInstruction() {

	d("Executing instruction cycle. Queue size is: " + instructionQueue.length + ".");
	
	//Is there an instruction available to execute?
	if(instructionQueue.length > 0) {
		
		d("Head of queue is: " + instructionQueue[0] + ""); 
		
		//Translate opcode to mnemonic
		var mnemonic = mnemonicMap[instructionQueue[0]];
		//Get function for specified mnemonic
		var func = executionUnit[mnemonic];
		
		//Make sure we ha a valid function
		if(func != undefined) {
			//If so, call it
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
 *  LDn 		- Load accumulator with data from memory location pointed to 
 *  				by register n
 *  				+ valid values of n: x, y, s (for "stack pointer")
 *   
 *  Lnm 		- Load register n with contents of register m
 *  				+ valid values of n: a, x, y
 *  				+ when n is A:
 *  					m may be S for "Stack Pointer"
 *  					m may be P for "Program Counter"
 *  				+ when n is S:
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

var mnemonicMap = {
		//No Operation
		0x00 : "NOP",
		
		//Load group
		0x01 : "LDA",
		0x02 : "LDX",
		0x03 : "LDY",
		0x04 : "LDS",
		0x05 : "LAF",
		0x06 : "LAX",
		0x07 : "LAY",
		0x08 : "LAP",
		0x09 : "LAS",
		0x0A : "LXA",
		0x0B : "LXY",
		0x0C : "LYA",
		0x0D : "LYX",
		0x60 : "LSA",
		0x61 : "LSX",
		0x62 : "LSY",
		0x63 : "LSP",
		0x64 : "EXX", //Exchange contents of accumulator and Y register
		0x65 : "EXY", //Exchange contents of accumulator and x register
		0x66 : "EXS", //Exchange contents of accumulator and stack pointer
		
		//Store
		0x10 : "STA",	
		0x11 : "STX",
		0x12 : "STY",
		0x13 : "SAX",
		0x14 : "SAY", 
		0x15 : "STS", //Store to stack
		
		//Increment/Decrement
		0x16 : "INA",
		0x17 : "INX",
		0x18 : "INY",
		0x18 : "INS",
		0x19 : "DCA",
		0x1A : "DCX",
		0x1B : "DCY",
		0x18 : "INS",
		
		//Add/Subtract
		0x1C : "ADA",
		0x1D : "ADX",
		0x1E : "ADY",
		0X22 : "SUA",
		0x20 : "SUX",
		0x21 : "SUY",

		
		//Bitwise Operations
		//And
		0X23 : "NDA",
		0X24 : "NDX",
		0X25 : "NDY",
		0X26 : "NAX",
		0X27 : "NAY",
		0X28 : "NIX",
		0X29 : "NIY",
		//Xor
		0X2A : "XRA",
		0X2B : "XRX",
		0X2C : "XRY",
		0X2D : "XAX",
		0X2E : "XAY",
		0X2F : "XIX",
		0X30 : "XIY",
		//Or
		0X31 : "ORA",
		0X32 : "ORX",
		0X33 : "ORY",
		0X34 : "OAX",
		0X35 : "OAY",
		0X36 : "OIX",
		0X37 : "OIY",
		//Compare
		0X38 : "CPA",
		0X39 : "CPX",
		0X3A : "CPY",
		0X3B : "CAX",
		0X3C : "CAY",
		0X3D : "CIX",
		0X3E : "CIY",
		//Roate
		0X3F : "RLA",
		0X40 : "RRA",
		0X41 : "RLX",
		0X42 : "RRX",
		0X43 : "RLY",
		0X44 : "RRY",	
		0X45 : "RLC",
		0X46 : "RRC",
		
		//Program Control
		0x70 : "JMP", //Jump
		0x71 : "BRA", //Branch to subroutine
		0x72 : "RTS", //Retrun from subroutine
		0x73 : "JSZ", //Jump if zero set
		0x74 : "JCZ", //Jump if zero clear
		0x75 : "JSC", //Jump if carry set
		0x76 : "JCC", //Jump if carry clear
		0x77 : "JSV", //Jump if overflow set
		0x78 : "JCV", //Jump if overflow clear
		0x79 : "JMI", //Jump if result was negative
		0X80 : "BSZ", //Branch if zero set
		0X81 : "BCZ", //Branch if zero clear
		0X82 : "BSC", //Branch if carry set
		0X83 : "BCC", //Branch if carry clear
		0X84 : "BSV", //Branch if overflow set
		0X85 : "BCV", //Branch if overflow clear
		0X86 : "BMI", //Branch if result was negative
		0x7A : "CCF", //Clear carry flag
		0x7B : "CVF", //Clear overflow flag
		0x7C : "CCF", //Clear zero flag
		0x7D : "CNF", //Clear negative
		
		//Device Input/Output
		0X47 : "INA",
		0X48 : "INX",
		0X49 : "INY",
		0X4A : "OUA",
		0X4B : "OUX",
		0X4C : "OUY",
		
		//Processor control
		0X50 : "RST",
		0X51 : "HLT",
		0X52 : "IRQ",
		0X53 : "IRX",
		0X54 : "IRY"
	};

//var executionUnit = {
//	//No Operation
//	"NOP" : Nop,
//	
//	//Load group
//	"LDA" : Lda,
//	"LDX" : Ldx,
//	"LDY" : Ldy,
//	"LDS" : Lds,
//	"LAF" : Laf,
//	"LAX" : Lax,
//	"LAY" : Lay,
//	"LAP" : Lap,
//	"LAS" : Las,
//	"LXA" : Lxa,
//	"LXY" : Lxy,
//	"LYA" : Lya,
//	"LYX" : Lyx,
//	"LSA" : Lsa,
//	"LSX" : Lsx,
//	"LSY" : Lsy,
//	"LSP" : Lsp,
//	
//	//Store
//	"STA" : Sta,	
//	"STX" : Stx,
//	"STY" : Sty,
//	"SAX" : Sax,
//	"SAY" : Say,
//	"STS" : Sas,
//	
//	//Increment/Decrement
//	"INA" : Ina,
//	"INX" : Inx,
//	"INX" : Inx,
//	"DCA" : Dca,
//	"DCX" : Dcx,
//	"DCY" : Dcy,
//	
//	//Add/Subtract
//	"ADA" : Ada,
//	"ADX" : Adx,
//	"ADY" : Ady,
//	"ADM" : Adm,
//	"SUX" : Sux,
//	"SUY" : Suy,
//	"SUM" : Sum,
//	
//	//Bitwise Operations
//	//And
//	"NDA" : Nda,
//	"NDX" : Ndx,
//	"NDY" : Ndy,
//	"NAX" : Nax,
//	"NAY" : Nay,
//	"NIX" : Nix,
//	"NIY" : Niy,
//	//Xor
//	"XRA" : Xra,
//	"XRX" : Xrx,
//	"XRY" : Xry,
//	"XAX" : Xax,
//	"XAY" : Xay,
//	"XIX" : Xix,
//	"XIY" : Xiy,
//	//Or
//	"ORA" : Ora,
//	"ORX" : Orx,
//	"ORY" : Ory,
//	"OAX" : Oax,
//	"OAY" : Oay,
//	"OIX" : Oix,
//	"OIY" : Oiy,
//	//Compare
//	"CPA" : Cpa,
//	"CPX" : Cpx,
//	"CPY" : Cpy,
//	"CAX" : Cax,
//	"CAY" : Cay,
//	"CIX" : Cix,
//	"CIY" : Ciy,
//	//Roate
//	"RLA" : Rla,
//	"RRA" : Rra,
//	"RLX" : Rlx,
//	"RRX" : Rrx,
//	"RLY" : Rly,
//	"RRY" : Rry,	
//	"RLC" : Rlc,
//	"RRC" : Rrc,
//	
//	//Program Control
//	"JMP" : Jmp, //Jump
//	"BRA" : Jsr, //Branch to subroutine
//	"RTS" : Rts, //Return from subroutine
//	"JSZ" : Jsz, //Jump if zero set
//	"JCZ" : Jcz, //Jump if zero clear
//	"JSC" : Jsc, //Jump if carry set
//	"JCC" : Jcc, //Jump if carry clear
//	"JSV" : Jsv, //Jump if overflow set
//	"JCV" : Jcv, //Jump if overflow clear
//	"JMI" : Jmi, //Jump if result was negative
//	"BSZ" : Bsz, //Branch if zero set
//	"BCZ" : Bcz, //Branch if zero clear
//	"BSC" : Bsc, //Branch if carry set
//	"BCC" : Bcc, //Branch if carry clear
//	"BSV" : Bsv, //Branch if overflow set
//	"BCV" : Bcv, //Branch if overflow clear
//	"BMI" : Bmi, //Branch if result was negative
//	"CCF" : Ccf, //Clear carry flag
//	"CVF" : Cvf, //Clear overflow flag
//	"CCF" : Czf, //Clear zero flag
//	"CNF" : Czf, //Clear negative flag
//	
//	//Device Input/Output
//	"INA" : Ina,
//	"INX" : Inx,
//	"INY" : Iny,
//	"OUA" : Oua,
//	"OUX" : Oux,
//	"OUY" : Ouy,
//	
//	//Processor control
//	"RST" : Rst,
//	"HLT" : Hlt,
//	"IRQ" : Irq,
//	"IRX" : Irx,
//	"IRY" : Iry
//	
//};

var executionUnit = {
//No Operation
"NOP" : Nop,

//Load group
"LDA" : Lda,
"LDX" : Ldx,
"LDY" : Ldy,
"LDS" : Lds,
"LAF" : Laf,
"LAX" : Lax,
"LAY" : Lay,
"LAP" : Lap,
"LAS" : Las,
"LXA" : Lxa,
"LXY" : Lxy,
"LYA" : Lya,
"LYX" : Lyx,
//"LSA" : Lsa,
//"LSX" : Lsx,
//"LSY" : Lsy,
//"LSP" : Lsp,

//Store
"STA" : Sta,	
"STX" : Stx,
"STY" : Sty,
"STS" : Sts,

//Increment/Decrement
"INA" : Ina,
"INX" : Inx,
"INY" : Iny,
"INS" : Ins,
"DCA" : Dca,
"DCX" : Dcx,
"DCY" : Dcy,
"DCS" : Dcs,

//Add/Subtract
"ADA" : Ada,
"ADX" : Adx,
"ADY" : Ady,
"SUX" : Sux,
"SUY" : Suy,

};

function Nop() {
	d("Instruction is NOP.");
	instructionQueue = [];
}

function Lda() {
	
	d("Loading accumulator with contents of memory from immediate address.");
	
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
		regs[a] = instructionQueue[2];
		instructionQueue = [];
	}
}

function Ldx() {

	d("Loading accumulator with contents of memory pointed to by x register.");

	d("Creating LDX memory fetch.");
	opMsg = new BusMessage();
	opMsg.setSource(thisDevice);
	opMsg.setAddress(regs[x]);
	opMsg.getActiveSignals().add(SignalType.READ);
	opMsg.getActiveSignals().add(SignalType.MEMORY);
	
	instructionQueue = [];
}

function Ldy() {

	d("Loading accumulator with contents of memort pointed to by y register.");
	
	d("Creating LDY memory fetch.");
	opMsg = new BusMessage();
	opMsg.setSource(thisDevice);
	opMsg.setAddress(regs[y]);
	opMsg.getActiveSignals().add(SignalType.READ);
	opMsg.getActiveSignals().add(SignalType.MEMORY);
	
	instructionQueue = [];
}

function Lds() {

	d("Loading accumulator with contents of memort pointed to by stack pointer.");
	
	d("Creating LDS memory fetch.");
	opMsg = new BusMessage();
	opMsg.setSource(thisDevice);
	opMsg.setAddress(regs[sp]);
	opMsg.getActiveSignals().add(SignalType.READ);
	opMsg.getActiveSignals().add(SignalType.MEMORY);
	
	instructionQueue = [];
}


function Laf() {

	d("Loading accumulator with contents of flags register.");
	
	regs[a] = regs[f];
	
	instructionQueue = [];
}

function Lax() {

	d("Loading accumulator with contents of x register.");
	
	regs[a] = regs[x];
	
	instructionQueue = [];
}

function Lay() {

	d("Loading accumulator with contents of y register.");
	
	regs[a] = regs[y];
	
	instructionQueue = [];
}

function Lap() {

	d("Loading accumulator with contents of program counter register.");
	
	regs[a] = regs[pc];
	
	instructionQueue = [];
}

function Las() {

	d("Loading accumulator with contents of stack pointer register.");
	
	regs[a] = regs[sp];
	
	instructionQueue = [];
}

function Lxa() {
	
	d("Loading register x with contents of accumulator.");
	
	regs[x] = regs[a];
	
	instructionQueue = [];
}

function Lxy() {
	
	d("Loading register x with contents of y register.");
	
	regs[x] = regs[y];
	
	instructionQueue = [];
}

function Lya() {
	
	d("Loading register y with contents of accumulator.");
	
	regs[y] = regs[a];
	
	instructionQueue = [];
}

function Lyx() {
	
	d("Loading register y with contents of x register.");
	
	regs[y] = regs[x];
	
	instructionQueue = [];
}

function Lsa() {
	
	d("Loading stack pointer with contents of accumulator.");
	
	regs[sp] = regs[a];
	
	instructionQueue = [];
}

function Sta() {
	
	d("Storing accumulator contents to immediate address location.");
	
	//On the second fetch, we have a full
	//STA instruction and we can fetch the
	//memory location
	if(instructionQueue.length > 1) {
		d("Saving accumulator to memory.");
		opMsg = new BusMessage();
		opMsg.setSource(thisDevice);
		opMsg.setAddress(instructionQueue[1]);
		opMsg.setData(regs[a]);
		opMsg.getActiveSignals().add(SignalType.WRITE);
		opMsg.getActiveSignals().add(SignalType.MEMORY);
		
		instructionQueue = [];
	}
	
}

function Stx() {
	
	d("Storing accumulator contents to address pointed to by x register.");
	
	//On the second fetch, we have a full
	//STX instruction and we can fetch the
	//memory location
	d("Saving accumulator to memory.");
	opMsg = new BusMessage();
	opMsg.setSource(thisDevice);
	opMsg.setAddress(regs[x]);
	opMsg.setData(regs[a]);
	opMsg.getActiveSignals().add(SignalType.WRITE);
	opMsg.getActiveSignals().add(SignalType.MEMORY);

	instructionQueue = [];
	
}

function Sty() {
	
	d("Storing accumulator contents to address pointed to by y register.");
	
	//On the second fetch, we have a full
	//STY instruction and we can fetch the
	//memory location
	d("Saving accumulator to memory.");
	opMsg = new BusMessage();
	opMsg.setSource(thisDevice);
	opMsg.setAddress(regs[y]);
	opMsg.setData(regs[a]);
	opMsg.getActiveSignals().add(SignalType.WRITE);
	opMsg.getActiveSignals().add(SignalType.MEMORY);

	instructionQueue = [];
	
}

function Sts() {
	
	d("Storing accumulator contents to address pointed to by stack pointer.");
	
	//On the second fetch, we have a full
	//STS instruction and we can fetch the
	//memory location
	d("Saving accumulator to memory.");
	opMsg = new BusMessage();
	opMsg.setSource(thisDevice);
	opMsg.setAddress(regs[sp]);
	opMsg.setData(regs[a]);
	opMsg.getActiveSignals().add(SignalType.WRITE);
	opMsg.getActiveSignals().add(SignalType.MEMORY);

	instructionQueue = [];
	
}

function Ina() {

	d("Incrementing the accumulator.");
	
	regs[a]++;
	
	//Handle overflow
	if(regs[a] > 0xFF) {
		regs[a] -= 0xFF
		regs[f] = regs[f] | vmask;
	}
	
	instructionQueue = [];
}

function Inx() {
	
	d("Incrementing the x register.");
	
	regs[x]++;
	
	if(regs[x] > 0xFF) {
		regs[x] -= 0xFF
		regs[f] = regs[f] | vmask;
	}
	
	instructionQueue = [];
}

function Iny() {
	
	d("Incrementing the y register.");
	
	regs[y]++;
	
	if(regs[y] > 0xFF) {
		regs[y] -= 0xFF
		regs[f] = regs[f] | vmask;
	}
	
	instructionQueue = [];
}

function Ins() {
	
	d("Incrementing the stack pointer.");
	
	regs[sp]++;
	
	if(regs[sp] > 0xFF) {
		regs[sp] -= 0xFF
		regs[f] = regs[f] | vmask;
	}
	
	instructionQueue = [];
}

function Dca() {
	
	d("Decrementing the accumulator.");
	
	regs[a]--;
	
	instructionQueue = [];
}

function Dcx() {
	
	d("Decrementing the x register.");
	
	regs[x]--;
	
	instructionQueue = [];
}

function Dcy() {
	
	d("Decrementing the y register.");
	
	regs[y]--;
	
	instructionQueue = [];
}

function Dcs() {
	
	d("Decrementing the stack pointer.");
	
	regs[sp]--;
	
	instructionQueue = [];
}

function Ada() {
	
	d("Adding contents of memory from immediate address to the accumulator.");
	
	//On the second fetch, we have a full
	//LDA instruction and we can fetch the
	//memory location
	if(instructionQueue.length == 2) {
		d("Creating ADA memory fetch.");
		opMsg = new BusMessage();
		opMsg.setSource(thisDevice);
		opMsg.setAddress(instructionQueue[1]);
		opMsg.getActiveSignals().add(SignalType.READ);
		opMsg.getActiveSignals().add(SignalType.MEMORY);
	} else if(instructionQueue.length > 2){
		d("Adding retrieved value to accumulator.");
		regs[a] += instructionQueue[2];
		instructionQueue = [];
	}
}

function Adx() {
	
	d("Adding the value of the x register to the accumulator.");
	
	regs[a] += regs[x];
	
	instructionQueue = [];
}

function Ady() {
	
	d("Adding the value of the y register to the accumulator.");
	
	regs[a] += regs[y];
	
	instructionQueue = [];
}

function Sux() {
	
	d("Subtracting the value of the x register from the accumulator.");
	
	regs[a] -= regs[x];
	
	instructionQueue = [];
}

function Suy() {
	
	d("Subtracting the value of the y register from the accumulator.");
	
	regs[a] -= regs[y];
	
	instructionQueue = [];
}

function Sua() {

	d("Subtracting the immediate value of memory location from the accumulator.");

	//On the second fetch, we have a full
	//SUA instruction and we can fetch the
	//memory location
	if(instructionQueue.length == 2) {
		d("Creating SUA memory fetch.");
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