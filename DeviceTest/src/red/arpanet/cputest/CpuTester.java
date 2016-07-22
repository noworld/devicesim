package red.arpanet.cputest;

import static red.arpanet.logging.Log.i;

import java.util.Date;

import javax.script.ScriptException;

import org.apache.log4j.Logger;

public class CpuTester {

	private static final Logger LOG = Logger.getLogger(CpuTester.class);

	private static final long RUNTIME_MS = 2000L;

	private static final String[] ROM = new String[]{
			"LDA","2","30","LXA","INA","x","x","x","x","x",
			"x","x","x","x","x","x","x","x","x","x",
			"LAF","x","x","x","x","x","x","x","x","30",
			"This","is","a","test","x","x","x","x","x","x"};

	public static void main(String[] args) {
		BusConfig bc = new BusConfig();
		bc.setSpeed(100L);

		DeviceConfig cpuConfig = new DeviceConfig();
		cpuConfig.setName("CPU 0");
		cpuConfig.setScripts(new String[]{"/device_scripts/util.js",
				"/device_scripts/zaptron_008.js"});

		DeviceConfig romConfig = new DeviceConfig();
		romConfig.setName("ROM 1");
		romConfig.setEnableAddress(0);
		romConfig.setAddressSize(8192);
		romConfig.setScripts(new String[]{"/device_scripts/device_enable.js",
				"/device_scripts/zaptron_27c64_8k.js",
		"/device_scripts/flash_chip.js"});

		DeviceConfig ramConfig = new DeviceConfig();
		ramConfig.setName("RAM 2");
		ramConfig.setEnableAddress(8192);
		ramConfig.setAddressSize(8192);
		ramConfig.setScripts(new String[]{"/device_scripts/device_enable.js",
		"/device_scripts/grebby_GRS801_8k.js"});

		DeviceConfig serialConfig = new DeviceConfig();
		serialConfig.setName("SERIAL 3");
		serialConfig.setEnableAddress(16384);
		serialConfig.setAddressSize(2);
		serialConfig.setScripts(new String[]{"/device_scripts/device_enable.js",
		"/device_scripts/zaptron_sio.js"});

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

		try {
			
			FlashData fd = new FlashData(ROM);
			rom.invokeFunc(DeviceScriptValues.FLASH_CHIP.getName(), new Object[]{fd});
			rom.invokeFunc(DeviceScriptValues.VERIFY_FLASH.getName(), new Object[]{fd});
			Thread t = new Thread(b);
			
			t.start();

			i(LOG,"STARTED");
			Long time = (new Date()).getTime();

			while((time + RUNTIME_MS) > (new Date()).getTime()) {

			}
		} finally {
			b.stop();
			i(LOG,"STOPPED");
			i(LOG,"PC: " + Double.valueOf(cpu.readVar("pc").toString()).intValue());
		}

	}

}
