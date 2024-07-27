document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productsGrid = document.getElementById('products-grid');
    let allProducts = [];

    // Fetch products from the server
    function fetchProducts() {
        fetch('http://localhost:3000/api/products')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                displayProducts('all');
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    productsGrid.addEventListener('click', function(e) {
        if (e.target.closest('.wishlist-btn')) {
            const productId = e.target.closest('.wishlist-btn').getAttribute('data-id');
            toggleWishlist(productId);
        } else if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.getAttribute('data-id');
            const product = allProducts.find(p => p._id === productId);
            addToCart(product);
        }
    });

    // Display products based on category
    function displayProducts(category) {
        productsGrid.innerHTML = '';
        const filteredProducts = category === 'all' 
            ? allProducts 
            : allProducts.filter(product => product.category === category);
    
        filteredProducts.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-actions">
                    <button class="wishlist-btn" data-id="${product._id}">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <span class="price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
                </div>
            `;
            productsGrid.appendChild(productElement);
        });

        updateWishlistButtonStates();
    }

    // Category button click event
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            displayProducts(this.dataset.category);
        });
    });

    // Add to cart functionality
    productsGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.getAttribute('data-id');
            const product = allProducts.find(p => p._id === productId);
            addToCart(product);
        }
    });

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    }

    function toggleWishlist(productId) {
        const wishlistBtn = document.querySelector(`.wishlist-btn[data-id="${productId}"]`);
        const product = allProducts.find(p => p._id === productId);
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        const existingIndex = wishlist.findIndex(item => item._id === productId);
        
        if (existingIndex > -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
            notificationSystem.show(`${product.name} removed from wishlist`, 'error');
        } else {
            // Add to wishlist
            wishlist.push(product);
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
            notificationSystem.show(`${product.name} added to wishlist`, 'success');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    function updateWishlistButtonStates() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        wishlistButtons.forEach(button => {
            const productId = button.getAttribute('data-id');
            if (wishlist.some(item => item._id === productId)) {
                button.classList.add('active');
                button.innerHTML = '<i class="fa-solid fa-heart"></i>';
            } else {
                button.classList.remove('active');
                button.innerHTML = '<i class="fa-regular fa-heart"></i>';
            }
        });
    }

    // Initial fetch of products
    fetchProducts();
});