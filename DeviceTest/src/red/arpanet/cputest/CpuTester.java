package red.arpanet.cputest;

import java.util.Date;

import javax.script.ScriptException;

import org.apache.log4j.Logger;

import static red.arpanet.logging.Log.i;

public class CpuTester {
	
	private static final Logger LOG = Logger.getLogger(CpuTester.class);
	
	private static final long RUNTIME_MS = 4000L;
	
	public static void main(String[] args) {
		BusConfig bc = new BusConfig();
		bc.setSpeed(100L);
		
		DeviceConfig cpuConfig = new DeviceConfig();
		cpuConfig.setName("CPU 0");
		cpuConfig.setScripts(new String[]{"/devices/cpu/Zaptron/zaptron_80_enable.js",
			"/devices/cpu/Zaptron/zaptron_80.js"});
		
		DeviceConfig romConfig = new DeviceConfig();
		romConfig.setName("ROM 1");
		romConfig.setEnableAddress(0);
		romConfig.setAddressSize(8192);
		romConfig.setScripts(new String[]{"/device_enable.js",
			"/devices/mem/Zaptron/zaptron_27c64_8k.js"});
		
		DeviceConfig ramConfig = new DeviceConfig();
		ramConfig.setName("RAM 2");
		ramConfig.setEnableAddress(8192);
		ramConfig.setAddressSize(8192);
		ramConfig.setScripts(new String[]{"/device_enable.js",
			"/devices/mem/Grebby/grebby_GRS801_8k.js"});
		
		DeviceConfig serialConfig = new DeviceConfig();
		serialConfig.setName("SERIAL 3");
		serialConfig.setEnableAddress(16384);
		serialConfig.setAddressSize(2);
		serialConfig.setScripts(new String[]{"/device_enable.js",
			"/devices/support/Zaptron/zaptron_sio.js"});
		
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
