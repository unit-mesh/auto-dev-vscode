package demo;

import java.util.ArrayList;
import java.util.List;

public class Sample {
    // sample filed
    private String name;

    // sample constructor
    public Sample(String name) {
        this.name = name;
    }

    // sample method
    public String getName() {
        return name;
    }

    //gettter and setter

    public void setName(String name) {
        this.name = name;
    }

    public static void main(String[] args) {
        List<Sample> list = new ArrayList<>();
        list.add(new Sample("A"));
        list.add(new Sample("B"));
        list.add(new Sample("C"));

        for (Sample sample : list) {
            System.out.println(sample.getName());
        }
    }
}