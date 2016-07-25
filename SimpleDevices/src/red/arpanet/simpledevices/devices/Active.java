package red.arpanet.simpledevices.devices;

import static red.arpanet.logging.Log.d;
import static red.arpanet.logging.Log.e;
import static red.arpanet.logging.Log.w;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.log4j.Logger;

public abstract class Active {

	private static final Logger LOG = Logger.getLogger(Active.class);

	private static final String NASHORN_CLASS_NAME = "jdk.nashorn.api.scripting.NashornScriptEngine";
	private static final String NASHORN_COMPAT_SCRIPT = "load(\"nashorn:mozilla_compat.js\");";
	private static final String DEFAULT_NAME = "DEFAULT_ACTIVE";

	protected String name = DEFAULT_NAME;
	protected final ScriptEngine engine;
	protected final Invocable func;

	public Active() {
		//create a script engine manager
		ScriptEngineManager factory = new ScriptEngineManager();
		// create a JavaScript engine
		engine = factory.getEngineByName("JavaScript");
		func = (Invocable)engine;
		// evaluate JavaScript code from String
		try {
			engine.eval("print('SCRIPT ENGINE ACTIVATED\\n')");

			d(LOG, engine.getClass().getName());

			if(engine.getClass().getName().equals(NASHORN_CLASS_NAME)) {
				engine.eval(NASHORN_COMPAT_SCRIPT);
			}

		} catch (ScriptException e) {
			e(LOG,"Exception starting Javascript engine.",e);
		}
	}
	
	public Object runScript(String script) {
		Object result = null;
		try {
			result = engine.eval(script);
		} catch (ScriptException e) {
			e(LOG,String.format("Exception running script on device %s!", this.name),e);
			d(LOG, String.format("Script contents: \n%s", script));
		}

		return result;
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
	
	public void setVar(String varName, Object value) {
		engine.put(varName, value);
	}

	public Object getVar(String varName) {
		return engine.get(varName);
	}

	public abstract void poll();

}
