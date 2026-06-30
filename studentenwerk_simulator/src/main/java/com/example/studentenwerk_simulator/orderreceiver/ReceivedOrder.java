package com.example.studentenwerk_simulator.orderreceiver;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "received_order")
public class ReceivedOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long menuItemId;
    private String studentName;
    private String status;

    protected ReceivedOrder() {}

    public ReceivedOrder(Long id, Long menuItemId, String studentName, String status) {
        this.id = id;
        this.menuItemId = menuItemId;
        this.studentName = studentName;
        this.status = status;
    }

    public ReceivedOrder(Long menuItemId, String studentName, String status) {
        this.menuItemId = menuItemId;
        this.studentName = studentName;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
