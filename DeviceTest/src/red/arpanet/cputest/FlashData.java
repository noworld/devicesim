package red.arpanet.cputest;

public class FlashData {

	protected boolean display = false;
	protected int[] data;
	
	public FlashData() {
		
	}
	
	public FlashData(int[] data) {
		this.data = data;
	}

	public int[] getData() {
		return data;
	}

	public void setData(int[] data) {
		this.data = data;
	}

	public boolean getDisplay() {
		return display;
	}

	public void setDisplay(boolean display) {
		this.display = display;
	}
	
}
