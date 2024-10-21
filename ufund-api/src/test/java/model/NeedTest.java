package model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.ufund.api.ufundapi.model.Need;

@Tag("Model-tier")
public class NeedTest {
    // test need constructor, getId, getCost, getQuantity, getType, getName 
    @Test
    public void testCtor() {
        // Setup
        int expected_id = 9;
        double expected_cost = 10.00;
        int expected_quantity = 21;
        String expected_type = "Fried";
        String expected_name = "Rice";

        // Invoke
        Need need = new Need(expected_id, expected_cost, expected_quantity, expected_type, expected_name);

        // Analyze
        assertEquals(expected_id, need.getId());
        assertEquals(expected_cost, need.getCost());
        assertEquals(expected_quantity, need.getQuantity());
        assertEquals(expected_type, need.getType());
        assertEquals(expected_name, need.getName());
    }

    // test setName
    @Test
    public void testName() {
        // Setup
        int id = 9;
        double cost = 10.00;
        int quantity = 21;
        String type = "Fried";
        String name = "Rice";
        Need need = new Need(id, cost, quantity, type, name);

        String expected_name = "Fried Rice";

        // Invoke
        need.setName(expected_name);

        // Analyze
        assertEquals(expected_name, need.getName());
    }

    // test toString
    @Test
    public void testToString() {
        // Setup
        int id = 9;
        double cost = 10.00;
        int quantity = 21;
        String type = "Fried";
        String name = "Rice";
        String expected_string = String.format(Need.STRING_FORMAT, id, cost, quantity, type, name);
        Need need = new Need(id, cost, quantity, type, name);

        // Invoke
        String actual_string = need.toString();

        // Analyze
        assertEquals(expected_string, actual_string);
    }
}
