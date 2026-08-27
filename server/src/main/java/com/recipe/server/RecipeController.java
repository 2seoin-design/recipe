package com.recipe.server;

import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

/**
 * 식약처 "조리식품의 레시피 DB"(COOKRCP01) 프록시.
 * 브라우저가 공공데이터 API를 직접 호출하면 CORS로 막히고 인증키도 노출되므로
 * 이 서버가 대신 호출해 프론트가 쓰기 쉬운 형태로 정리해 돌려준다.
 */
@RestController
public class RecipeController {

    private final RestClient restClient = RestClient.create();

    @Value("${foodsafety.api-key}")
    private String apiKey;

    @GetMapping("/api/recipes")
    public ResponseEntity<?> getRecipes(
            @RequestParam(defaultValue = "1") int start,
            @RequestParam(defaultValue = "50") int end
    ) {
        String url = "http://openapi.foodsafetykorea.go.kr/api/%s/COOKRCP01/json/%d/%d"
                .formatted(apiKey, start, end);

        JsonNode root;
        try {
            root = restClient.get().uri(url).retrieve().body(JsonNode.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new ErrorBody("식약처 레시피 API 호출에 실패했습니다: " + e.getMessage()));
        }

        JsonNode service = root == null ? null : root.get("COOKRCP01");
        JsonNode rows = service == null ? null : service.get("row");
        if (rows == null || !rows.isArray()) {
            String message = service != null && service.get("RESULT") != null
                    ? service.get("RESULT").path("MSG").asText("알 수 없는 오류")
                    : "레시피 목록을 받지 못했습니다";
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorBody(message));
        }

        List<RecipeDto> recipes = new ArrayList<>();
        for (JsonNode row : rows) {
            List<String> steps = new ArrayList<>();
            for (int i = 1; i <= 20; i++) {
                String key = "MANUAL%02d".formatted(i);
                String text = row.path(key).asText("").trim();
                if (!text.isEmpty()) {
                    // 원본 데이터의 각 단계 끝에 알파벳 한 글자가 잘못 붙어오는 경우가 있어 제거한다.
                    steps.add(text.replaceAll("\\.[a-zA-Z]$", "."));
                }
            }
            String image = row.path("ATT_FILE_NO_MAIN").asText("");
            if (image.isEmpty()) {
                image = row.path("ATT_FILE_NO_MK").asText("");
            }
            recipes.add(new RecipeDto(
                    row.path("RCP_SEQ").asText(""),
                    row.path("RCP_NM").asText(""),
                    image,
                    row.path("RCP_PARTS_DTLS").asText(""),
                    steps
            ));
        }
        return ResponseEntity.ok(recipes);
    }

    private record ErrorBody(String message) {
    }
}
