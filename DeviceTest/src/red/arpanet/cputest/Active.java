package red.arpanet.cputest;

import static red.arpanet.logging.Log.d;
import static red.arpanet.logging.Log.e;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.log4j.Logger;

public abstract class Active {
	
	private static final Logger LOG = Logger.getLogger(Active.class);
	
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
		} catch (ScriptException e) {
			e(LOG,"Exception starting Javascript engine.",e);
		}
	}
	
	public abstract BusMessage poll();
	
}
