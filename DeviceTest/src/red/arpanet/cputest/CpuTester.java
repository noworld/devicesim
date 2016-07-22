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
		cpuConfig.setEnableScript("/devices/cpu/Zaptron/zaptron_80_enable.js");
		cpuConfig.setRunSript("/devices/cpu/Zaptron/zaptron_80.js");
		
		DeviceConfig romConfig = new DeviceConfig();
		romConfig.setName("ROM 1");
		romConfig.setEnableAddress(1);
		romConfig.setEnableScript("deviceEnable.js");
		romConfig.setRunSript("/devices/mem/Zaptron/zaptron_27c64_8k.js");
		
		DeviceConfig ramConfig = new DeviceConfig();
		ramConfig.setName("RAM 2");
		romConfig.setEnableAddress(2);
		ramConfig.setEnableScript("deviceEnable.js");
		ramConfig.setRunSript("/devices/cpu/Zaptron/grebby_GRS801_8k.js");
		
		DeviceConfig serialConfig = new DeviceConfig();
		serialConfig.setName("SERIAL 3");
		romConfig.setEnableAddress(3);
		ramConfig.setEnableScript("deviceEnable.js");
		serialConfig.setRunSript("/devices/cpu/Zaptron/zaptron_80.js");
		
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
