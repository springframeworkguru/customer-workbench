package com.s7fundops.customerworkbench;

import com.s7fundops.customerworkbench.bootstrap.DataUtil;
import org.junit.jupiter.api.Test;

/**
 * Created by jt, Spring Framework Guru.
 */
public class Utils {

    @Test
    void getJson() {

        System.out.println(DataUtil.randomInteractionAsJson());
    }

    @Test
    void testGetCSVHeader() {
        System.out.println(DataUtil.interactionCsvHeader());
    }

    @Test
    void testGetCSVRow() {
        System.out.println(DataUtil.randomInteractionAsCsv());
    }
}
