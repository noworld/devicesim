package red.arpanet.cputest;

import java.util.Date;

import javax.script.ScriptException;

import org.apache.log4j.Logger;

import static red.arpanet.logging.Log.i;

public class CpuTester {
	
	private static final Logger LOG = Logger.getLogger(CpuTester.class);
	
	private static final long RUNTIME_MS = 1000L;
	
	public static void main(String[] args) {
		BusConfig bc = new BusConfig();
		bc.setSpeed(100L);
		
		DeviceConfig cpuConfig = new DeviceConfig();
		cpuConfig.setName("CPU 0");
		cpuConfig.setInitScript("var a, f, b, c, x, y, pc = 0, sp = 0;");
		cpuConfig.setRunScript("print('device 1 run\\n'); runResult = true;");
		cpuConfig.setEnableScript("enableResult = false;");
		cpuConfig.setPollScript("print('Requesting address ' + pc + '\\n'); "
				+ " busMsg = new BusMessage();"
				+ " busMsg.setSource(thisDevice);"
				+ " busMsg.setAddress(pc++);"
				+ " busMsg.setData('Data test!');"
				+ " pollResult = true;");		
		
		DeviceConfig romConfig = new DeviceConfig();
		romConfig.setName("ROM 1");
		romConfig.setRunScript("print('Device ROM 1 executed!\\n'); runResult = true;");
		romConfig.setEnableScript("enableResult = busMsg.getAddress() == 1;");
		romConfig.setPollScript("pollResult = false;");
		
		DeviceConfig ramConfig = new DeviceConfig();
		ramConfig.setName("RAM 2");
		ramConfig.setRunScript("print('device RAM 2 run\\n'); runResult = true;");
		ramConfig.setEnableScript("enableResult = busMsg.getAddress() == 2;");
		ramConfig.setPollScript("pollResult = false;");
		
		DeviceConfig serialConfig = new DeviceConfig();
		serialConfig.setName("SERIAL 3");
		serialConfig.setRunScript("print('device SERIAL 3 run\\n'); runResult = true;");
		serialConfig.setEnableScript("enableResult = busMsg.getAddress() == 3;");
		serialConfig.setPollScript("pollResult = false;");
		
		Bus b = new Bus(bc);
		Device cpu = null;
		Device rom = null;
		Device ram = null;
		Device serial = null;
		try {
			cpu = new Device(cpuConfig);
			rom = new Device(romConfig);
			ram = new Device(ramConfig);
			serial = new Device(serialConfig);
		} catch (ScriptException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		b.addDevice(cpu);
		b.addDevice(rom);
		b.addDevice(ram);
		b.addDevice(serial);
		
		Thread t = new Thread(b);
		
		t.start();

		i(LOG,"STARTED");
		Long time = (new Date()).getTime();
		
		while((time + RUNTIME_MS) > (new Date()).getTime()) {

		}
		
		b.stop();
		i(LOG,"STOPPED");
		
	}

}
