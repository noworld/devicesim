package red.arpanet.cputest;

import static red.arpanet.logging.Log.e;
import static red.arpanet.logging.Log.w;
import static red.arpanet.logging.Log.i;
import static red.arpanet.logging.Log.d;

import java.io.IOException;
import java.nio.charset.Charset;

import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import static red.arpanet.cputest.DeviceScriptValues.*;

public class Device extends Active {

	private static final Logger LOG = Logger.getLogger(Device.class);

	private static final Object[] EMPTY_ARGS = new Object[]{};
	private static final Charset CHAR_SET = Charset.defaultCharset();

	protected String name;
	protected Bus bus;
	protected String[] scripts;
	protected int enableAddress;
	protected int addressSize;

	public Device(DeviceConfig dc ) throws ScriptException {
		super();

		d(LOG,String.format("Creating device %s.", dc.getName()));

		this.name = dc.getName();
		this.scripts = dc.getScripts();
		this.enableAddress = dc.getEnableAddress();
		this.addressSize = dc.getAddressSize();

		initDevice();
	}

	protected void initDevice() {
		//Set a property on the engine
		//for accessing this java object
		engine.put(THIS_DEVICE.getName(), this);
		//Set the address range for the device enable
		engine.put(ENABLE_ADDRESS.getName(), this.enableAddress);
		engine.put(ADDRESS_SIZE.getName(), this.addressSize);

		//Check to make sure there are scripts available
		if(this.scripts != null && this.scripts.length > 0) {
			//Load each script in order
			for(int i = 0; i < this.scripts.length; i++) {
				try {
					//If the script is populated, then run it
					if(StringUtils.isNotBlank(this.scripts[i])) {
						//Eval the script
						String tempScript = IOUtils.toString(Device.class.getResourceAsStream(this.scripts[i]), CHAR_SET);
						engine.eval(tempScript);
					}
				} catch (IOException | ScriptException e) {
					e(LOG,String.format("Exception loading device script: %s, script: %s", this.name, this.scripts[i]),e);
				}
			}
			
			//Invoke the initialization function
			try {
				if(!(Boolean)func.invokeFunction(INIT.getName(), EMPTY_ARGS)) {
					w(LOG,String.format("Problem initializing device: %s", this.name));
				}
			} catch (NoSuchMethodException | ScriptException e) {
				e(LOG,String.format("Exception initializing device: %s", this.name),e);
			}
		}
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Bus getBus() {
		return bus;
	}

	public void setBus(Bus bus) {
		this.bus = bus;
	}

	public String[] getScripts() {
		return scripts;
	}

	public void setScripts(String[] scripts) {
		this.scripts = scripts;
	}

	public int getEnableAddress() {
		return enableAddress;
	}

	public void setEnableAddress(int enableAddress) {
		this.enableAddress = enableAddress;
	}

	public int getAddressSize() {
		return addressSize;
	}

	public void setAddressSize(int addressSize) {
		this.addressSize = addressSize;
	}

	public BusMessage poll() {

		BusMessage busMsg = null;

		d(LOG,String.format("Device %s polling!", name));

		try {						
			Object message = func.invokeFunction(POLL.getName(), EMPTY_ARGS);
			busMsg = message == null ? null : (BusMessage)message;
		} catch (ScriptException | NoSuchMethodException e) {
			e(LOG,String.format("Exception polling device %s!", this.name),e);
		}

		return busMsg;
	}

	public boolean enableDevice(BusMessage message) {

		if(message == null) {
			return false;
		}

		boolean match = false;

		try {		
			match = (Boolean)func.invokeFunction(ENABLE.getName(), message);
		} catch (ScriptException | NoSuchMethodException e) {
			e(LOG,String.format("Exception enabling device %s!", this.name),e);
			match = false;
		}

		if(match) {
			d(LOG,String.format("Device %s enabled!", name));
		}

		return match;
	}

	public boolean runDevice(BusMessage message) {

		boolean success = false;

		d(LOG,String.format("Device %s running!", name));

		try {
			success = (Boolean)func.invokeFunction(RUN.getName(), message);			
		} catch (ScriptException | NoSuchMethodException e) {
			e(LOG,String.format("Exception running device %s!", this.name),e);
			success = false;
		}

		return success;
	}
	
	public Object invokeFunc(String funcName, Object[] args) {
		
		Object result = null;

		d(LOG,String.format("Invoking arbitrary function %s on device %s!", funcName, this.name));

		try {
			result = func.invokeFunction(funcName, args);			
		} catch (ScriptException | NoSuchMethodException e) {
			w(LOG,String.format("Exception invoking arbitrary function %s on device %s!", funcName, this.name),e);
		}

		return result;
	}
	
	public Object readVar(String varName) {
		return engine.get(varName);
	}

}
