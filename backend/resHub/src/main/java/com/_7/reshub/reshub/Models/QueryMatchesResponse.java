package com._7.reshub.reshub.Models;
import java.util.List;

public class QueryMatchesResponse {
    private List<Integer> ids;
    private List<Float> scores;

    public List<Integer> getIds() {
        return ids;
    }

    public List<Float> getScores() {
        return scores;
    }

    public void setIds(List<Integer> ids) {
        this.ids = ids;
    }

    public void setScores(List<Float> scores) {
        this.scores = scores;
    }
}