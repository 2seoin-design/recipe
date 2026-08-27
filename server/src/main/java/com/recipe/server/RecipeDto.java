package com.recipe.server;

import java.util.List;

public record RecipeDto(
        String id,
        String name,
        String imageUrl,
        String ingredientsText,
        List<String> steps
) {
}
