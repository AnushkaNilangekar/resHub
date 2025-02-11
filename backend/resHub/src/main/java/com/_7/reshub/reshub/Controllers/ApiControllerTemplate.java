package com._7.reshub.reshub.Controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ApiControllerTemplate
{
    @GetMapping("/sum")
    public ResponseEntity<Map<String, Integer>> getSum(@RequestParam int a, @RequestParam int b) {
        Map<String, Integer> response = new HashMap<>();
        response.put("sum", a + b);
        
        return ResponseEntity.ok(response);
    }
}