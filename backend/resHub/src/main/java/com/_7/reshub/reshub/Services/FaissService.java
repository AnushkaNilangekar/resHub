package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Models.QueryMatchesResponse;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FaissService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${faiss.api.url}")
    private String BASE_URL;

    public String doAddUserVector(int userId, List<Float> vector) {
        Map<String, Object> payload = Map.of(
            "user_id", userId,
            "vector", vector
        );
        return restTemplate.postForObject(BASE_URL + "/add_user_vector", payload, String.class);
    }

    public String doSyncAllUserVectors(Map<String, Object> payload) {
        return restTemplate.postForObject(BASE_URL + "/load_all_user_vectors", payload, String.class);
    }

    public QueryMatchesResponse doQueryMatches(List<Double> vector, int topK) {
        Map<String, Object> payload = Map.of(
            "vector", vector,
            "top_k", topK
        );
        return restTemplate.postForObject(BASE_URL + "/query_matches", payload, QueryMatchesResponse.class);
    }
}
