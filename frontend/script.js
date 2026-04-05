// async function getRecommendations() {
//     function cap(val) {
//         val = Number(val);
//         if (val < 0) return 0;
//         if (val > 10) return 10;
//         return val;
//     }

//     const user = {
//         Budget: Number(document.getElementById("budget").value),
//         Acne_Severity: cap(document.getElementById("acne").value),
//         Dryness_Severity: cap(document.getElementById("dryness").value),
//         Pigmentation_Severity: cap(document.getElementById("pigmentation").value),
//         Aging_Severity: cap(document.getElementById("aging").value),
//         Sensitivity_Severity: cap(document.getElementById("sensitivity").value)
//     }

//     const response = await fetch("http://127.0.0.1:5000/recommend_tfidf", {
//         method:"POST",
//         headers:{"Content-Type":"application/json"},
//         body:JSON.stringify(user)
//     })

//     const data = await response.json();
//     const resultsDiv = document.getElementById("results")
//     resultsDiv.innerHTML = "";

//     data.forEach(product=>{
//         resultsDiv.innerHTML += `
//         <div class="product-card">
//             <div class="product-image"></div>
//             <div class="product-info">
//                 <h3>${product.name}</h3>
//                 <p><strong>Type:</strong> ${product.type}</p>
//                 <p><strong>Price:</strong> $${product.price}</p>
//                 <p><strong>Ingredients:</strong> ${product.active_ingredients.join(", ")}</p>
//                 <a href="${product.url}" target="_blank">View Product 🔗</a>
//             </div>
//         </div>
//         `;
//     })
// }

async function getRecommendations() {
    function cap(val) {
        val = Number(val);
        if (val < 0) return 0;
        if (val > 10) return 10;
        return val;
    }

    // Get budget level directly from select dropdown
    const budgetLevel = document.getElementById("budget").value;
    
    const user = {
        Budget_Level: budgetLevel,
        Acne_Severity: cap(document.getElementById("acne").value),
        Dryness_Severity: cap(document.getElementById("dryness").value),
        Pigmentation_Severity: cap(document.getElementById("pigmentation").value),
        Aging_Severity: cap(document.getElementById("aging").value),
        Sensitivity_Severity: cap(document.getElementById("sensitivity").value)
    };

    const typeImages = {
        "Bath Oil": "https://apothecary19.com/cdn/shop/files/Apothecary-19---Self-Care-Ritual---Bath-Oil_a0459660-bad9-4821-a655-2182bf1e0f59.jpg?v=1687007780&width=1100",
        "Serum": "https://thumbs.dreamstime.com/b/face-serum-generic-bottle-turquoise-textured-background-isolated-white-face-serum-generic-bottle-textured-background-211057997.jpg",
        "Cream": "https://thumbs.dreamstime.com/b/cosmetic-cream-facial-skin-care-treatment-21378268.jpg",
        "Cleanser": "https://thecosmeticscenter.com/cdn/shop/products/vitamin-c-cleanser-vit100_390_1_800x.jpg?v=1572941344",
        "Toner": "https://thumbs.dreamstime.com/b/mock-up-bottle-essence-toner-no-label-trendy-natural-light-flower-pink-backdrop-face-skin-care-cosmetics-266958372.jpg",
        "Mask": "https://m.media-amazon.com/images/I/61o1-UtacxL._AC_UF1000,1000_QL80_.jpg",
        "Moisturizer": "https://www.wholesalesuppliesplus.com/cdn/shop/files/4068-moisturizing-lotion-with-evening-primrose-thumbnail.jpg?v=1770042183&width=300",
        "Sunscreen": "https://pariserderm.com/wp-content/uploads/2018/05/Generic-Sunscreen.jpg",
        "Other": "https://centreforpureskin.com/themes/user/site/default/asset/img/blog/10.23_Blog_2_.0.jpg"
    };

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Loading recommendations...</p>";

    try {
        const response = await fetch("http://127.0.0.1:5000/recommend_tfidf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        resultsDiv.innerHTML = "";

        if (data.length === 0) {
            resultsDiv.innerHTML = "<p>No products found matching your criteria.</p>";
            return;
        }

        data.forEach((product, index) => {
            const imageUrl = typeImages[product.type] || typeImages["Other"];
            resultsDiv.innerHTML += `
            <div class="product-card">
                <div class="product-image" style="background-image: url('${imageUrl}');"></div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>Type:</strong> ${product.type}</p>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>Active Ingredients:</strong> ${product.active_ingredients.join(", ")}</p>
                    <a href="${product.url}" target="_blank">View Product 🔗</a>
                </div>
            </div>
            `;
        });
    } catch (error) {
        resultsDiv.innerHTML = `
            <p style="color: red; font-weight: bold;">❌ Error: ${error.message}</p>
            <p>Make sure the backend server is running:</p>
            <code>cd backend && python server.py</code>
        `;
        console.error("Error fetching recommendations:", error);
    }
}