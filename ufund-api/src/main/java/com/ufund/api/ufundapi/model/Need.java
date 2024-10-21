package com.ufund.api.ufundapi.model;

import java.util.logging.Logger;

import com.fasterxml.jackson.annotation.JsonProperty;
/**
 * Represents a Need entity
 * 
 * @author SWEN Faculty
 */
public class Need {
    private static final Logger LOG = Logger.getLogger(Need.class.getName());

    // Package private for tests
    public static final String STRING_FORMAT = "Need [id=%d, cost=%.2f, quantity=%d, type=%s, name=%s]";

    @JsonProperty("id") private int id;
    @JsonProperty("cost") private double cost;
    @JsonProperty("quantity") private int quantity;
    @JsonProperty("type") private String type;
    @JsonProperty("name") private String name;
    
    /**
     * Create a need with the given id and name
     * @param id The id of the need
     * @param cost The cost of the need
     * @param quantity The quantity of the need
     * @param type The type of the need
     * @param name The name of the need
     * 
     * {@literal @}JsonProperty is used in serialization and deserialization
     * of the JSON object to the Java object in mapping the fields.  If a field
     * is not provided in the JSON object, the Java field gets the default Java
     * value, i.e. 0 for int
     */
    public Need(
        @JsonProperty("id") int id,
        @JsonProperty("cost") double cost,
        @JsonProperty("quantity") int quantity,
        @JsonProperty("type") String type,
        @JsonProperty("name") String name
        ) {
        this.id = id;
        this.cost = cost;
        this.quantity = quantity;
        this.type = type;
        this.name = name;
    }

    /**
     * Retrieves the id of the need
     * @return The cost of the need
     */
    public int getId() {
        return id;
    }

    /**
     * Retrieves the cost of the need
     * @return The cost of the need
     */
    public double getCost() {
        return cost;
    }

    /*
     * Retrieves the quantity of the need
     * @return The quantity of the need
     */
    public int getQuantity() {
        return quantity;
    }

    /*
     * Retrieves the type of the need
     * @return The type of the need
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the name of the need - necessary for JSON object to Java object deserialization
     * @param name The name of the need
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retrieves the name of the need
     * @return The name of the need
     */
    public String getName() {
        return name;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return String.format(
            STRING_FORMAT,
            id, cost, quantity, type, name
            );
    }
    
}