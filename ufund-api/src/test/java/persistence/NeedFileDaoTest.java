package persistence;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.ufund.api.ufundapi.model.Need;
import com.ufund.api.ufundapi.persistence.*;

@Tag("Persistence-tier")
public class NeedFileDaoTest {
    NeedFileDAO needFileDAO;
    Need[] testNeeds;
    ObjectMapper mockObjectMapper;

    // create/inject mocket object mapper for each test
    @BeforeEach
    public void setupNeedFileDAO() throws IOException {
        mockObjectMapper = mock(ObjectMapper.class);
        testNeeds = new Need[3];
        testNeeds[0] = new Need(99, 10.00, 21, "Fried", "Rice");
        testNeeds[1] = new Need(100, 10.00, 21, "Fried", "Rice");
        testNeeds[2] = new Need(101, 10.00, 21, "Fried", "Rice");

        // return need array when reading from file
        when(mockObjectMapper
            .readValue(new File("doesnt_matter.txt"),Need[].class))
                .thenReturn(testNeeds);
        needFileDAO = new NeedFileDAO("doesnt_matter.txt",mockObjectMapper);
    }

    // test getNeeds
    @Test
    public void testGetNeeds() {
        // Invoke
        Need[] needs = needFileDAO.getNeeds();

        // Analyze
        assertNotNull(needs);
        assertEquals(3, needs.length);
        assertEquals(99, needs[0].getId());
        assertEquals(100, needs[1].getId());
        assertEquals(101, needs[2].getId());
    }

    // test findNeeds
    @Test
    public void testFindNeeds() {
        // Invoke
        Need[] needs = needFileDAO.findNeeds("Rice");

        // Analyze
        assertNotNull(needs);
        assertEquals(3, needs.length);
        assertEquals(99, needs[0].getId());
        assertEquals(100, needs[1].getId());
        assertEquals(101, needs[2].getId());
    }

    // test getNeed
    @Test
    public void testGetNeed() {
        // Invoke
        Need need = needFileDAO.getNeed(99);

        // Analyze
        assertNotNull(need);
        assertEquals(99, need.getId());
    }

    // test updateNeed
    @Test
    public void testUpdateNeed() {
        // Setup
        Need need = new Need(99, 10.00, 21, "Fried", "Rice");

        // Invoke
        assertDoesNotThrow(() -> needFileDAO.updateNeed(need));

        // Analyze
        Need updatedNeed = needFileDAO.getNeed(99);
        assertNotNull(updatedNeed);
        assertEquals(99, updatedNeed.getId());
    }

    // test deleteNeed
    @Test
    public void testDeleteNeed() {
        // Invoke
        boolean result = assertDoesNotThrow(() -> needFileDAO.deleteNeed(99),
                            "Unexpected exception thrown");

        // Analyze
        assertEquals(true, result);
        assertNull(needFileDAO.getNeed(99));
    }

    // test createNeed
    @Test
    public void testCreateNeed() {
        // Setup
        Need need = new Need(102, 10.00, 21, "Fried", "Rice");

        // Invoke
        Need result = assertDoesNotThrow(() -> needFileDAO.createNeed(need),
                                "Unexpected exception thrown");

        // Analyze
        assertNotNull(result);
        Need actual = needFileDAO.getNeed(102);
        assertEquals(102, actual.getId());
        assertEquals(10.00, actual.getCost());
        assertEquals(21, actual.getQuantity());
        assertEquals("Fried", actual.getType());
        assertEquals("Rice", actual.getName());
    }

    // test saveException
    @Test
    public void testSaveException() throws IOException{
        doThrow(new IOException())
            .when(mockObjectMapper)
                .writeValue(any(File.class),any(Need[].class));

        Need need = new Need(102, 10.00, 21, "Fried", "Rice");

        assertThrows(IOException.class,
                        () -> needFileDAO.createNeed(need),
                        "IOException not thrown");
    }

    // test getNeedNotFound
    @Test
    public void testGetNeedNotFound() {
        // Invoke
        Need need = needFileDAO.getNeed(98);

        // Analyze
        assertEquals(need,null);
    }

    // test deleteNeedNotFound
    @Test
    public void testDeleteNeedNotFound() {
        // Invoke
        boolean result = assertDoesNotThrow(() -> needFileDAO.deleteNeed(98),
                            "Unexpected exception thrown");

        // Analyze
        assertEquals(false, result);
    }

    // test updateNeedNotFound
    @Test
    public void testUpdateNeedNotFound() {
        // Setup
        Need need = new Need(98, 10.00, 21, "Fried", "Rice");

        // Invoke
        Need result = assertDoesNotThrow(() -> needFileDAO.updateNeed(need),
                            "Unexpected exception thrown");

        // Analyze
        assertNull(result);
    }

    // test test constructor exception
    @Test
    public void testConstructorException() throws IOException {
        // Setup
        ObjectMapper objectMapper = mock(ObjectMapper.class);
        when(objectMapper
            .readValue(new File("doesnt_matter.txt"),Need[].class))
                .thenThrow(new IOException());

        // Invoke
        assertThrows(IOException.class,
                        () -> new NeedFileDAO("doesnt_matter.txt",objectMapper),
                        "IOException not thrown");
    }
}
