package com.example.mensa_app_backend.adapter;

import com.example.mensa_app_backend.menu.MenuItem;
import java.util.List;

public interface MensaAPI {
    boolean authenticate(int nameHash, int pwHash);
    List<MenuItem> getAllMenuItems();
    List<MenuItem> getFilteredMenuItems(boolean[] filter);
}
