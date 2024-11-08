package gr.netmechanics.carrental.entity.booking;

import java.time.LocalDate;

public class Customer {
    private String lastname;

    private String firstname;

    private String email;

    private String gender;

    private LocalDate birthDate;

    private String telephone;

    private String street;

    private String city;

    private String region;

    private String country;

    private String countryCode;

    private String postalCode;

    private String idNumber;

    private String drivingLicenseNumber;

    // getters & setters

    public String getFullName() {
        // lastname firstname
    }

    public String getAddressLocation() {
        // city, region, country, postalCode
    }
}