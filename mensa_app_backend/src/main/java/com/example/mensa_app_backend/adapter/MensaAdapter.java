package com.example.mensa_app_backend.adapter;

import com.example.mensa_app_backend.menu.MenuItem;
import java.util.List;

public class MensaAdapter implements MensaAPI {

    @Override
    public boolean authenticate(int nameHash, int pwHash) {
        return false;
    }

    @Override
    public List<MenuItem> getAllMenuItems() {
        return List.of();
    }

    @Override
    public List<MenuItem> getFilteredMenuItems(boolean[] filter) {
        return List.of();
    }
}
