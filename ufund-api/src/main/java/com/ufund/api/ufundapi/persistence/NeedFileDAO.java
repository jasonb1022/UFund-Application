package com.ufund.api.ufundapi.persistence;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Map;
import java.util.TreeMap;
import java.util.logging.Logger;
import java.util.function.*;

import java.lang.reflect.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ufund.api.ufundapi.model.Need;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;



/**
 * Implements the functionality for JSON file-based peristance for Needs
 * 
 * {@literal @}Component Spring annotation instantiates a single instance of this
 * class and injects the instance into other classes as needed
 * 
 * @author SWEN Faculty
 */
@Component
public class NeedFileDAO implements NeedDAO {
    private static final Logger LOG = Logger.getLogger(NeedFileDAO.class.getName());
    Map<Integer,Need> needs;   // Provides a local cache of the need objects
                                // so that we don't need to read from the file
                                // each time
    private ObjectMapper objectMapper;  // Provides conversion between Need
                                        // objects and JSON text format written
                                        // to the file
    private static int nextId;  // The next Id to assign to a new need
    private String filename;    // Filename to read from and write to

    /**
     * Creates a Need File Data Access Object
     * 
     * @param filename Filename to read from and write to
     * @param objectMapper Provides JSON Object to/from Java Object serialization and deserialization
     * 
     * @throws IOException when file cannot be accessed or read from
     */
    public NeedFileDAO(@Value("${needs.file}") String filename,ObjectMapper objectMapper) throws IOException {
        this.filename = filename;
        this.objectMapper = objectMapper;
        load();  // load the needs from the file
    }

    /**
     * Generates the next id for a new {@linkplain Need need}
     * 
     * @return The next id
     */
    private synchronized static int nextId() {
        int id = nextId;
        ++nextId;
        return id;
    }

    /**
     * Generates an array of {@linkplain Need needs} from the tree map
     * 
     * @return  The array of {@link Need needs}, may be empty
     */
    private Need[] getNeedsArray() {
        return getNeedsArray(null);
    }

    /**
     * Generates an array of {@linkplain Need needs} from the tree map for any
     * {@linkplain Need needs} that contains the text specified by containsText
     * <br>
     * If containsText is null, the array contains all of the {@linkplain Need needs}
     * in the tree map
     * 
     * @return  The array of {@link Need needs}, may be empty
     */
    private Need[] getNeedsArray(String containsText) { // if containsText == null, no filter
        
        //Create static mapping from query keys to Need methods
        final Map<String, Method> queryMap = new TreeMap<>();
        try {

            queryMap.put("type", Need.class.getMethod("getType"));
            queryMap.put("name", Need.class.getMethod("getName"));
            queryMap.put("cost", Need.class.getMethod("getCost"));
            queryMap.put("id", Need.class.getMethod("getId"));
            queryMap.put("quantity", Need.class.getMethod("getQuantity"));

            }
        catch (NoSuchMethodException e) {
            LOG.severe(e.getLocalizedMessage());
            }

        //If no filter is specified, return all Needs
        if (containsText == null) {
            LOG.info("\nPERFORMING UNFILTERED QUERY: No filter specified");
            containsText = "*";
            }

        //Create an empty list for the Needs that will be output
        ArrayList<Need> needArrayList = new ArrayList<>();

        //Iterate through all substrings separated by a comma delimiter
        for(String substr : containsText.split(",")) {
            
            //Make the current substring lowercase for case insensitivity
            String substrLower = substr.toLowerCase();

            //Check for an empty substring
            if (substrLower.isEmpty()) {
                LOG.info("\n\n(Got empty substring!)\nUSAGE: \n- NAME or\n- ?KEY=VALUE (exact match) or\n- ?KEY=VALUE* (for inexact match)\n\n");
                continue;
                }

            //Split the substring into a key and value
            String[] queryValues;
            String queryKey;
            String queryValue;
            Method queryMethod;

            //Create a flag to check if the string ends with an asterisk
            //If it does, then inexact matches will be allowed
            boolean allowInexactMatch;
            if (substrLower.endsWith("*")) {
                allowInexactMatch = true;
                substrLower = substrLower.substring(0,substrLower.length()-1);
                }
            else {
                allowInexactMatch = false;
                }

            //Check if NOT using a special query, then make a simple name query
            if (substr.charAt(0) != '?') {

                queryMethod = queryMap.get("name");
                queryValue = substrLower;

                //Log simple query attempt
                LOG.info("\nPERFORMING SIMPLE QUERY: Query key: name Query value: " + substrLower);

                }

            //Check for a special query that begins with the format "?KEY=VALUE"
            else {

                //Split the substring into a key and value
                queryValues = substrLower.substring(1).split("=");
                queryKey = queryValues[0].toLowerCase();
                queryValue = queryValues[1].toLowerCase();
                queryMethod = queryMap.get(queryKey);

                //Ensure query method is valid
                if (queryMethod == null) {
                    LOG.severe("\nERROR - Invalid query key: " + queryKey);
                    continue;
                    }

                //Log special query attempt
                LOG.info("\nPERFORMING QUERY: Query key: " + queryKey + " Query value: " + queryValue);

                }
                
            //Iterate through all Needs to compare their query values to the current substring
            for(Need need : needs.values()) {

                LOG.info("\n\tNEED: " + need);

                try {
                    
                    //Invoke the query method on the current Need
                    String needQueryValue;
                    try  {
                        Object queryResult = queryMethod.invoke(need);
                        needQueryValue = String.valueOf(queryResult).toLowerCase();
                        LOG.info("\n\t\tNEED QUERY VALUE: " + needQueryValue);
                        }
                    catch (ClassCastException e) {
                        LOG.severe("\nERROR - Failed to cast query value to String: " + e.getLocalizedMessage());
                        break;
                        }
                    
                    //Verify that the Need's query value matches the current substring
                    //If it does, add it to the output Needs list
                    if (
                        needQueryValue.equals(queryValue)                               //Exact match      
                        || (allowInexactMatch && needQueryValue.contains(queryValue))   //Inexact match
                        )
                        
                        needArrayList.add(need);

                    }
                catch (IllegalAccessException | InvocationTargetException e) {

                    LOG.severe(e.getLocalizedMessage());

                    }

                }

        }

        //Convert the Need list from an ArrayList to a standard array
        Need[] needArray = new Need[needArrayList.size()];
        needArrayList.toArray(needArray);

            //LOG.info("\n\nTEST: "+needArray.toString()+"\n\n");
            //LOG.info("\n\nTEST Alt: "+needArrayList.toString()+"\n\n");

        //Output the converted Need list
        return needArray;
        
    }

    /**
     * Saves the {@linkplain Need needs} from the map into the file as an array of JSON objects
     * 
     * @return true if the {@link Need needs} were written successfully
     * 
     * @throws IOException when file cannot be accessed or written to
     */
    private boolean save() throws IOException {
        Need[] needArray = getNeedsArray();

        // Serializes the Java Objects to JSON objects into the file
        // writeValue will thrown an IOException if there is an issue
        // with the file or reading from the file
        objectMapper.writeValue(new File(filename),needArray);
        return true;
    }

    /**
     * Loads {@linkplain Need needs} from the JSON file into the map
     * <br>
     * Also sets next id to one more than the greatest id found in the file
     * 
     * @return true if the file was read successfully
     * 
     * @throws IOException when file cannot be accessed or read from
     */
    private boolean load() throws IOException {
        needs = new TreeMap<>();
        nextId = 0;

        // Deserializes the JSON objects from the file into an array of needs
        // readValue will throw an IOException if there's an issue with the file
        // or reading from the file
        Need[] needArray = objectMapper.readValue(new File(filename),Need[].class);

        // Add each need to the tree map and keep track of the greatest id
        for (Need need : needArray) {
            needs.put(need.getId(),need);
            if (need.getId() > nextId)
                nextId = need.getId();
        }
        // Make the next id one greater than the maximum from the file
        ++nextId;
        return true;
    }

    /**
    ** {@inheritDoc}
     */
    @Override
    public Need[] getNeeds() {
        synchronized(needs) {
            return getNeedsArray();
        }
    }

    /**
    ** {@inheritDoc}
     */
    @Override
    public Need[] findNeeds(String containsText) {
        synchronized(needs) {
            return getNeedsArray(containsText);
        }
    }

    /**
    ** {@inheritDoc}
     */
    @Override
    public Need getNeed(int id) {
        synchronized(needs) {
            if (needs.containsKey(id))
                return needs.get(id);
            else
                return null;
        }
    }

    /**
    ** {@inheritDoc}
     */
    @Override
    public Need createNeed(Need need) throws IOException {
        synchronized(needs) {
            // We create a new need object because the id field is immutable
            // and we need to assign the next unique id
            
            //Need newNeed = new Need(nextId(),need.getName());     //<-- Old Constructor [EX]
            Need newNeed = new Need(
                nextId(),
                need.getCost(),
                need.getQuantity(),
                need.getType(),
                need.getName()
            );
            needs.put(newNeed.getId(),newNeed);
            
            save(); // may throw an IOException
            return newNeed;
        }
    }

    /**
    ** {@inheritDoc}
     */
    @Override
    public Need updateNeed(Need need) throws IOException {
        synchronized(needs) {
            if (needs.containsKey(need.getId()) == false)
                return null;  // need does not exist

            needs.put(need.getId(),need);
            save(); // may throw an IOException
            return need;
        }
    }

    /**
    ** {@inheritDoc}
     */
    @Override
    public boolean deleteNeed(int id) throws IOException {
        synchronized(needs) {
            if (needs.containsKey(id)) {
                needs.remove(id);
                return save();
            }
            else
                return false;
        }
    }
}
