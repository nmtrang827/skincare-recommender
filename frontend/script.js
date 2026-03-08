async function getRecommendations() {
    function cap(val) {
        val = Number(val);
        if (val < 0) return 0;
        if (val > 10) return 10;
        return val;
    }
    const user = {
        Budget: Number(document.getElementById("budget").value),
        Acne_Severity: cap(document.getElementById("acne").value),
        Dryness_Severity: cap(document.getElementById("dryness").value),
        Pigmentation_Severity: cap(document.getElementById("pigmentation").value),
        Aging_Severity: cap(document.getElementById("aging").value),
        Sensitivity_Severity: cap(document.getElementById("sensitivity").value)
    }

    const response = await fetch("http://127.0.0.1:5000/recommend_tfidf", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(user)
    })

    const data = await response.json();
    const resultsDiv = document.getElementById("results")
    resultsDiv.innerHTML = "";

    data.forEach(product=>{
        resultsDiv.innerHTML += `
        <div>
        <h3>${product.name}</h3>
        <p>Type: ${product.type}</p>
        <p>Price: ${product.price}</p>
        <p>Active Ingredients: ${product.active_ingredients.join(", ")}</p>
        <a href="${product.url}" target="_blank">View Product</a>
        </div>
        <hr>
        `
    })
}