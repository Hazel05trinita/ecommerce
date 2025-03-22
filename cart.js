document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart in localStorage if it doesn't exist
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Find all "Buy Now" buttons and add click event listeners
    const buyButtons = document.querySelectorAll('button, a');
    buyButtons.forEach(button => {
        if (button.textContent.trim() === 'Buy Now') {
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default action (like navigating to a new page)
                
                // Get product information from the closest product container
                const productContainer = this.closest('.product-card, .product-item, article, section');
                
                // Get product details
                const productName = productContainer.querySelector('h2, h3')?.textContent || 'Product';
                const productPrice = productContainer.querySelector('.price')?.textContent || '$99.99';
                const productImage = productContainer.querySelector('img')?.src || '';
                const productId = productContainer.id || 'product_' + Math.random().toString(36).substr(2, 9);
                
                // Create product object
                const product = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                };
                
                // Get current cart
                const cart = JSON.parse(localStorage.getItem('cart'));
                
                // Check if product already exists in cart
                const existingProductIndex = cart.findIndex(item => item.id === productId);
                
                if (existingProductIndex > -1) {
                    // Increment quantity if product already in cart
                    cart[existingProductIndex].quantity += 1;
                } else {
                    // Add new product to cart
                    cart.push(product);
                }
                
                // Save updated cart
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Show confirmation message
                alert(productName + ' added to cart!');
                
                // Update cart count if you have a cart icon with a counter
                updateCartCount();
            });
        }
    });
    
    // Function to update cart count display
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart count element if it exists
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }
    
    // Update cart count on page load
    updateCartCount();
});
