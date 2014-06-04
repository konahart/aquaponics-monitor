import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Random;

public class CreateData {

	private static Random rand = new Random();
	private static int YEARS = 3;
	private static int START_YEAR = 2012;
	private static final String[] MONTHS = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
	/**
	 *ph                  4    6     8      10
	 *water temp          30   60    90     120
	 *nitrogen            60   120   180    240
	 *air temp            0    50    100    150
	 *dissolved oxygen    0    30    60     90
	 */
	public static void main(String[] args) {
		PrintWriter pw = null;
		try {
			pw = new PrintWriter(new FileWriter("dummyData.csv"));
			pw.print("date,ph,waterTemp,nitrogen,airTemp,dissolvedOxygen");
			pw.println();
			for (int i = 0; i < YEARS; i++) {
				for (int j = 0; j < MONTHS.length; j++ ) {
					int ph = rand.nextInt(3) + 6; // btw 6 and 8
					int waterTemp = rand.nextInt(31) + 60; // btw 60 and 90
					int nitrogen = rand.nextInt(62) + 120; // btw 120 and 181
					int airTemp = rand.nextInt(52) + 49; // btw 49 and 100
					int disoOx = rand.nextInt(33) + 29; // btw 29 and 61
					pw.print(MONTHS[j] + " " + (START_YEAR + i) + "," + ph + "," + waterTemp + "," + nitrogen + "," + airTemp + "," + disoOx);
					pw.println();
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		pw.close();
	}

}
