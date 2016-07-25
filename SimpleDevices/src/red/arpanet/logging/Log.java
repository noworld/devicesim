package red.arpanet.logging;

import org.apache.log4j.Logger;

public class Log {
	
	public static void t(Logger l, String msg) {
		if(l.isTraceEnabled()) {
			l.trace(msg);	
		}
	}
	
	public static void t(Logger l, String msg, Throwable t) {
		if(l.isTraceEnabled()) {
			l.trace(msg, t);
		}
	}
	
	public static void d(Logger l, String msg) {
		if(l.isDebugEnabled()) {
			l.debug(msg);
		}
	}
	
	public static void d(Logger l, String msg, Throwable t) {
		if(l.isDebugEnabled()) {
			l.debug(msg, t);
		}
	}
	
	public static void i(Logger l, String msg) {
		if(l.isInfoEnabled()) {
			l.info(msg);
		}
	}
	
	public static void i(Logger l, String msg, Throwable t) {
		if(l.isInfoEnabled()) {
			l.info(msg, t);
		}
	}
	
	public static void w(Logger l, String msg) {
		l.warn(msg);
	}
	
	public static void w(Logger l, String msg, Throwable t) {
		l.warn(msg, t);
	}
	
	public static void w(Logger l, Throwable t) {
		l.warn(t);
	}
	
	public static void e(Logger l, String msg) {
		l.error(msg);
	}
	
	public static void e(Logger l, String msg, Throwable t) {
		l.error(msg, t);
	}
	
	public static void e(Logger l, Throwable t) {
		l.error(t);
	}
	
	public static void f(Logger l, String msg) {
		l.fatal(msg);
	}
	
	public static void f(Logger l, String msg, Throwable t) {
		l.fatal(msg, t);
	}
	
	public static void f(Logger l, Throwable t) {
		l.fatal(t);
	}

}
