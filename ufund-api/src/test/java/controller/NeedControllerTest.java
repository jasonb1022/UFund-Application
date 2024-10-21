package controller;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.event.annotation.BeforeTestMethod;

import java.io.File;
import java.io.IOException;

import org.apache.catalina.connector.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.ufund.api.ufundapi.model.Need;
import com.ufund.api.ufundapi.persistence.NeedDAO;
import com.ufund.api.ufundapi.persistence.NeedFileDAO;
import com.ufund.api.ufundapi.controller.NeedController;

import com.fasterxml.jackson.databind.ObjectMapper;

@Tag("Controller-tier")
public class NeedControllerTest {

    NeedController needController;
    NeedDAO needFileDAO;
    ObjectMapper mockObjectMapper;
    Need[] testNeeds;


    // create/inject mocket object mapper for each test
    @BeforeEach
    public void setupNeedFileDAO() throws IOException {
        mockObjectMapper = mock(ObjectMapper.class);

        // return need array when reading from file

        testNeeds = new Need[3];
        testNeeds[0] = new Need(99, 10.00, 21, "White", "Rice");
        testNeeds[1] = new Need(100, 10.00, 21, "Fried", "Rice");
        testNeeds[2] = new Need(101, 10.00, 21, "Fried", "Rice");

        when(
            mockObjectMapper.readValue(new File("doesnt_matter.txt"),Need[].class)
            ).thenReturn(testNeeds);
        needFileDAO = new NeedFileDAO("doesnt_matter.txt",mockObjectMapper);

        needController = new NeedController(needFileDAO);

    }
    
    //Test getting ALL Needs
    @Test
    public void testGetNeeds() {

        assertEquals(
            HttpStatus.OK,
            needController.getNeeds().getStatusCode()
            );

        }

    //Test getting a SPECIFIC Need (from its ID)
    @Test
    public void testGetNeed() {

        //Get Need that should exist...
        assertEquals(
            HttpStatus.OK,
            needController.getNeed(99).getStatusCode()
            );

        //Get Need that shouldn't exist...
        assertEquals(
            HttpStatus.NOT_FOUND,
            needController.getNeed(12345).getStatusCode()
            );

        }

    //Test creating a new Need
    @Test
    public void testNewNeed() {

        int _needTestID = 102;
        Need _needTest = new Need(_needTestID, 100.00, 3, "Fried", "Rice");

        //Verify that the new Need is created successfully
        assertEquals(
            HttpStatus.CREATED,
            needController.createNeed(_needTest).getStatusCode()
            );

        //Verify that the new Need can be fetched
        assertEquals(
            HttpStatus.OK,
            needController.getNeed(_needTestID).getStatusCode()
            );

        //Verify that duplicate Needs cannot be created
        Need _needTestDuplicate = new Need(_needTestID, 100.00, 3, "Fried", "Rice");
        assertEquals(
            HttpStatus.CONFLICT,
            needController.createNeed(_needTestDuplicate).getStatusCode()
            );

        //Verify that unacceptable (null) Needs cannot be created
        assertEquals(
            HttpStatus.INTERNAL_SERVER_ERROR,
            needController.createNeed(null).getStatusCode()
            );

        }
    
    //Test searching for Needs
    @Test
    public void testSearchNeeds() {

        //Invoke
        ResponseEntity<Need[]> response = needController.searchNeeds("Rice");

        //Verify
        assertEquals(
            HttpStatus.OK,
            response.getStatusCode()
            );

        Need[] responseNeeds = response.getBody();
        assertEquals(
            3,
            responseNeeds.length
            );

        }

    //Test updating Needs
    @Test
    public void testUpdateNeed() {
        
        String nameOriginal = "Rice";
        String nameModified = "Chicken";

        int _needTestID = 102;

        Need _needTestOriginal = new Need(_needTestID, 100.00, 3, "Fried", nameOriginal);
        Need _needTestModified = new Need(_needTestID, 100.00, 3, "Fried", nameModified);

        //Create Original Need
        assertEquals(
            HttpStatus.CREATED,
            needController.createNeed(_needTestOriginal).getStatusCode()
            );

        ResponseEntity<Need> responseFetchCreated = needController.getNeed(_needTestID);
        assertEquals(
            HttpStatus.OK,
            responseFetchCreated.getStatusCode()
            );
        String originalNameFetched =responseFetchCreated.getBody().getName();

        //Invoke
        needController.updateNeed(_needTestModified);

        //Verify
        ResponseEntity<Need> response = needController.getNeed(_needTestID);
        assertEquals(
            HttpStatus.OK,
            response.getStatusCode()
            );

        //Modified name is different from the original name
        String modifiedNameFetched = response.getBody().getName();
        assertNotEquals(
            originalNameFetched,
            modifiedNameFetched
            );

        //Name has been modified internally
        assertEquals(
            nameModified,
            modifiedNameFetched
            );

        }

    }