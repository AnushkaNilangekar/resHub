package com._7.reshub.reshub.Models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QueryMatchesResponse {

    @JsonProperty("user_ids")
    private List<String> userIds;
    @JsonProperty("scores")
    private List<Float> scores;

    public QueryMatchesResponse(List<String> userIds, List<Float> scores) {
        this.userIds = userIds;
        this.scores = scores;
    }

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }

    public List<Float> getScores() {
        return scores;
    }

    public void setScores(List<Float> scores) {
        this.scores = scores;
    }
}