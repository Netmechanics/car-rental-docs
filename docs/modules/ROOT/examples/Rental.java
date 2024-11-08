package gr.netmechanics.carrental.entity.booking;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Rental {
    private String code;

    private String paymentTrxId;

    private Customer customer;

    private String status;

    private Integer passengers;

    private String flightNumber;

    private String hotelName;

    private PickDropDetail pickup;

    private PickDropDetail dropOff;

    private Long vehicleId;

    private Long vehicleItemId;

    private String vehicleName;

    private String vehicleGroupName;

    private BigDecimal vehicleCost;

    private Long insuranceId;

    private String insuranceTitle;

    private BigDecimal insuranceCost;

    private String insuranceCostType;

    private List<RentalExtra> extras = new ArrayList<>();

    private BigDecimal extrasCost;

    private String couponCode;

    private BigDecimal couponDiscount;

    private Long paymentMethodId;

    private String paymentMethodCode;

    private String paymentMethodTitle;

    private BigDecimal paymentMethodCost;

    private BigDecimal totalPrice;

    private BigDecimal paidInAdvance;

    private Double advancePercent;

    private BigDecimal toBePaid;

    private String comments;

    // getters & setters
}