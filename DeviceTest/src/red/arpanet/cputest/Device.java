package red.arpanet.cputest;

import static red.arpanet.logging.Log.e;
import static red.arpanet.logging.Log.w;
import static red.arpanet.logging.Log.i;

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

	protected String name;
	protected Bus bus;
	protected String runScript;
	protected String enableScript;
	protected BusMessage busMsg = null;

	public Device(DeviceConfig dc ) throws ScriptException {
		super();

		Charset charSet = Charset.defaultCharset();

		this.name = dc.getName();

		try {
			if(StringUtils.isNotBlank(dc.getRunSript())) {

				this.runScript = IOUtils.toString(Device.class.getResourceAsStream(dc.getRunSript()), charSet);

				if(StringUtils.isNotBlank(this.runScript)) {				
					engine.put(THIS_DEVICE.getName(), this);
					engine.eval(this.runScript);
					if(!(Boolean)func.invokeFunction(ENABLE.getName(), EMPTY_ARGS)) {
						w(LOG,String.format("Problem running init script for device: %s, script: %s", dc.getName(), dc.getRunSript()));
					}
				}
				
				this.enableScript = IOUtils.toString(Device.class.getResourceAsStream(dc.getEnableScript()), charSet);
				
				if(StringUtils.isNotBlank(this.enableScript)) {				
					engine.eval(this.enableScript);
					if(dc.getEnableAddress() >= 0) {
						engine.put(ENABLE_ADDRESS.getName(), dc.getEnableAddress());
					}
				}
			}
		} catch (IOException | NoSuchMethodException e) {
			e(LOG,String.format("Exception initializing device: %s, script: %s", dc.getName(), dc.getRunSript()),e);
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

	public String getRunScript() {
		return runScript;
	}

	public void setRunScript(String script) {
		this.runScript = script;
	}

	public String getEnableScript() {
		return enableScript;
	}

	public void setEnableScript(String enableScript) {
		this.enableScript = enableScript;
	}

	public BusMessage poll() {

		BusMessage busMsg = null;

		i(LOG,String.format("Device %s polling!", name));

		try {						
			Object message = func.invokeFunction(RUN.getName(), EMPTY_ARGS);
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
			i(LOG,String.format("Device %s enabled!", name));
		}

		return match;
	}

	public boolean runDevice(BusMessage message) {

		boolean success = false;

		i(LOG,String.format("Device %s running!", name));

		try {
			success = (Boolean)func.invokeFunction(RUN.getName(), message);			
		} catch (ScriptException | NoSuchMethodException e) {
			e(LOG,String.format("Exception running device %s!", this.name),e);
			success = false;
		}

		return success;
	}

}
