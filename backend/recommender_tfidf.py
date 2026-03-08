# %%
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

with open("../data/products.json", "r", encoding="utf-8") as f:
    products = json.load(f)
for p in products:
    ingred_str = p["clean_ingreds"].replace("'", '"')
    try:
        p["clean_ingreds"] = json.loads(ingred_str)
    except json.JSONDecodeError:
        p["clean_ingreds"] = []

# %%
for p in products:
    price_str = str(p.get("price", "0")).replace("£", "").strip()
    try:
        p["price"] = float(price_str)
    except:
        p["price"] = 0.0

# %%
with open("../data/users.json", "r", encoding="utf-8") as f:
    users = json.load(f)

severity_cols = ["Acne_Severity", "Dryness_Severity", "Pigmentation_Severity", "Aging_Severity", "Sensitivity_Severity"]
for u in users:
    for col in severity_cols:
        u[col] = float(u.get(col, 0))

# %%
ingredient_set = set()
for p in products:
    for ing in p["clean_ingreds"]:
        ing_clean = ing.lower().strip()
        ingredient_set.add(ing_clean)

all_ingredients = sorted(list(ingredient_set))

with open("../data/all_ingredients.txt", "w", encoding="utf-8") as f:
    for ing in all_ingredients:
        f.write(ing + "\n")

# %%
active_ingredients = {

# acne
"salicylic acid",
"benzoyl peroxide",
"niacinamide",
"azelaic acid",
"sulfur",
"zinc",

# hydration
"hyaluronic acid",
"glycerin",
"ceramide",
"ceramide np",
"ceramide ap",
"ceramide eop",
"squalane",
"panthenol",
"beta-glucan",

# pigmentation
"ascorbic acid",
"vitamin c",
"alpha-arbutin",
"kojic acid",
"niacinamide",

# anti-aging
"retinol",
"bakuchiol",
"peptides",
"adenosine",

# soothing
"allantoin",
"centella asiatica",
"green tea",
"chamomile",
"colloidal oatmeal",
"aloe vera",

# exfoliants
"glycolic acid",
"lactic acid",
"mandelic acid"
}

# %%
concern_to_ingredients = {

    "Acne_Severity": [
        "salicylic acid",
        "benzoyl peroxide",
        "niacinamide",
        "azelaic acid",
        "sulfur",
        "zinc"
    ],

    "Dryness_Severity": [
        "hyaluronic acid",
        "glycerin",
        "ceramide",
        "ceramide np",
        "squalane",
        "panthenol"
    ],

    "Pigmentation_Severity": [
        "ascorbic acid",
        "vitamin c",
        "alpha-arbutin",
        "kojic acid",
        "niacinamide"
    ],

    "Aging_Severity": [
        "retinol",
        "bakuchiol",
        "peptides",
        "adenosine"
    ],

    "Sensitivity_Severity": [
        "allantoin",
        "centella asiatica",
        "green tea",
        "chamomile",
        "colloidal oatmeal",
        "aloe vera",
        "panthenol"
    ]
}

# %%
products_texts = [" ".join(p["clean_ingreds"]) for p in products]

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(products_texts)

# %%
def score_rule_based(product, user):
    score = 0
    for concern, ingredients in concern_to_ingredients.items():
        severity = user.get(concern, 0)
        for ing in product["active_ingredients"]:
            if ing in ingredients:
                score += severity
    return score

# %%
for p in products:
    p["active_ingredients"] = [ing.lower().strip() 
                               for ing in p.get("clean_ingreds", []) 
                               if ing.lower().strip() in active_ingredients]

# %%
def rec_hybrid(user, products, top_n=8, alpha=0.5, beta = 0.1):
    query = []
    for concern, ingredients in concern_to_ingredients.items():
        severity = user.get(concern, 0)
        if severity > 1:
            query.extend(ingredients)
    query_text = " ".join(query)
    query_vec = vectorizer.transform([query_text])

    similarities = cosine_similarity(query_vec, tfidf_matrix)
    scores = similarities.flatten()

    scored_products = []
    budget = user.get("budget", float("inf"))

    for i, p in enumerate(products):
        rule_score = score_rule_based(p, user)
        hybrid_score = alpha * rule_score + (1 - alpha) * scores[i]

        price = p.get("price",0)
        if price > budget:
            hybrid_score -= beta * (price - budget)

        if hybrid_score > 0:
            scored_products.append((p, hybrid_score))
    
    scored_products.sort(key=lambda x: x[1], reverse=True)
    return scored_products[:top_n]

# %%
# if __name__ == "__main__":
#     user = users[0]
#     recs = rec_hybrid(user, products, top_n=8, alpha=0.7)

    for product, score in recs:

        print("Product:", product["product_name"])
        print("Type:", product["product_type"])
        print("Price:", product["price"])
        print("Active Ingredients:", product["active_ingredients"])
        print("Score:", score)
        print("URL:", product["product_url"])
        print("-----------")


