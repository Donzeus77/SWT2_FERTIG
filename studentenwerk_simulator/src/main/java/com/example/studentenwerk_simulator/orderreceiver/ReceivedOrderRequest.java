package com.example.studentenwerk_simulator.orderreceiver;

public class ReceivedOrderRequest {
    private Long menuItemId;
    private String studentName;

    public ReceivedOrderRequest() {}
    public ReceivedOrderRequest(Long menuItemId, String studentName) {
        this.menuItemId = menuItemId;
        this.studentName = studentName;
    }

    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
}
