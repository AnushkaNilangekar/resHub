package com._7.reshub.reshub.Schedulers;

import com._7.reshub.reshub.Services.ProfileService;
import com._7.reshub.reshub.Services.FaissService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Component
public class FaissScheduler {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private FaissService faissService;

    @Scheduled(fixedRate = 300_000) // every 5 minutes
    public void refreshFaissIndex() {
        Map<String, List<Double>> data = profileService.getUserIdsAndVectors();
        syncAllUserVectorsInBulk(data);
    }

    private void syncAllUserVectorsInBulk(Map<String, List<Double>> userVectors) {
        List<Map<String, Object>> userVectorList = userVectors.entrySet().stream().map(entry -> {
            String userIdStr = entry.getKey();
            List<Float> vector = entry.getValue().stream()
                    .map(Double::floatValue)
                    .toList();

            Map<String, Object> userEntry = new HashMap<>();
            userEntry.put("user_id", userIdStr);
            userEntry.put("vector", vector);
            return userEntry;
        }).toList();

        Map<String, Object> payload = Map.of("user_vectors", userVectorList);

        try {
            faissService.doSyncAllUserVectors(payload);
            System.out.println("\nSuccessfully refreshed user vectors in FAISS.\n");
        } catch (Exception e) {
            System.err.println("Failed to bulk sync FAISS index: " + e.getMessage());
        }
    }
}
