// Función para cambiar entre pestañas
function openTab(tabName) {
    // Obtener todos los contenidos y botones
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    // Remover clase active de todos
    contents.forEach(content => content.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));
    
    // Agregar clase active al tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Guardar la pestaña activa en localStorage
    localStorage.setItem('activeTab', tabName);
}

// Cargar la última pestaña visitada al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        // Remover active de todos
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.classList.remove('active');
        });
        
        // Activar la pestaña guardada
        const tabContent = document.getElementById(savedTab);
        const tabButton = Array.from(document.querySelectorAll('.tab-btn'))
            .find(btn => btn.textContent.includes(getTabIcon(savedTab)));
        
        if (tabContent && tabButton) {
            tabContent.classList.add('active');
            tabButton.classList.add('active');
        }
    }
    
    // Cargar productos guardados
    loadProducts();
    
    // Cargar estadísticas guardadas
    loadStats();
});

// Función auxiliar para obtener el ícono de la pestaña
function getTabIcon(tabName) {
    const icons = {
        'inicio': '🏠',
        'publicar': '📤',
        'marketplace': '🛒',
        'estadisticas': '📊',
        'educacion': '📚'
    };
    return icons[tabName] || '';
}

// Manejar el envío del formulario
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('category').value;
    const condition = document.getElementById('condition').value;
    const offerType = document.getElementById('offerType').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    
    // Crear objeto de producto
    const product = {
        id: Date.now(),
        name: productName,
        category: category,
        condition: condition,
        offerType: offerType,
        description: description,
        location: location || 'Sin ubicación especificada',
        date: new Date().toLocaleDateString('es-ES')
    };
    
    // Guardar producto en localStorage
    saveProduct(product);
    
    // Agregar producto al marketplace
    addProductToMarketplace(product);
    
    // Actualizar estadísticas
    updateStats();
    
    // Mostrar mensaje de éxito
    const successMsg = document.getElementById('successMsg');
    successMsg.style.display = 'block';
    
    // Resetear formulario
    this.reset();
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 5000);
    
    // Scroll suave al inicio del formulario
    document.getElementById('publicar').scrollIntoView({ behavior: 'smooth' });
});

// Función para guardar producto en localStorage
function saveProduct(product) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.unshift(product); // Agregar al inicio
    localStorage.setItem('products', JSON.stringify(products));
}

// Función para cargar productos desde localStorage
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.forEach(product => {
        addProductToMarketplace(product, false); // false para no guardar de nuevo
    });
}

// Función para agregar producto al marketplace
function addProductToMarketplace(product, save = true) {
    const productList = document.getElementById('productList');
    const newProduct = document.createElement('div');
    newProduct.className = 'product-item';
    newProduct.setAttribute('data-id', product.id);
    
    // Emojis por categoría
    const categoryEmoji = {
        'muebles': '🪑',
        'electronica': '💻',
        'ropa': '👕',
        'libros': '📚',
        'hogar': '🏠',
        'juguetes': '🎮',
        'otros': '📦'
    };
    
    // Determinar clase de estado
    const statusClass = product.offerType === 'donacion' ? 'status-disponible' : 
                       product.offerType === 'intercambio' ? 'status-intercambio' : 'status-disponible';
    
    // Determinar texto de estado
    const statusText = product.offerType === 'donacion' ? 'Donación' : 
                      product.offerType === 'intercambio' ? 'Intercambio' : 'Venta';
    
    newProduct.innerHTML = `
        <div class="product-info">
            <h4>${categoryEmoji[product.category] || '📦'} ${product.name}</h4>
            <p>Estado: ${product.condition} - ${product.location}</p>
        </div>
        <span class="product-status ${statusClass}">${statusText}</span>
    `;
    
    // Insertar al inicio de la lista
    productList.insertBefore(newProduct, productList.firstChild);
}

// Función para actualizar estadísticas
function updateStats() {
    // Obtener estadísticas actuales
    let stats = JSON.parse(localStorage.getItem('stats')) || {
        productsSaved: 847,
        wasteReduced: 2.3,
        co2Saved: 5420,
        activeUsers: 1234
    };
    
    // Incrementar productos guardados
    stats.productsSaved += 1;
    
    // Estimar reducción de residuos (promedio 2.7 kg por producto)
    stats.wasteReduced = parseFloat((stats.wasteReduced + 0.0027).toFixed(2));
    
    // Estimar CO2 reducido (promedio 6.4 kg por producto)
    stats.co2Saved += 6;
    
    // Guardar estadísticas
    localStorage.setItem('stats', JSON.stringify(stats));
    
    // Actualizar visualización
    document.getElementById('productsSaved').textContent = stats.productsSaved;
    document.getElementById('wasteReduced').textContent = stats.wasteReduced;
    document.getElementById('co2Saved').textContent = stats.co2Saved.toLocaleString();
    document.getElementById('activeUsers').textContent = stats.activeUsers;
}

// Función para cargar estadísticas guardadas
function loadStats() {
    const stats = JSON.parse(localStorage.getItem('stats'));
    
    if (stats) {
        document.getElementById('productsSaved').textContent = stats.productsSaved;
        document.getElementById('wasteReduced').textContent = stats.wasteReduced;
        document.getElementById('co2Saved').textContent = stats.co2Saved.toLocaleString();
        document.getElementById('activeUsers').textContent = stats.activeUsers;
    }
}

// Simulación de incremento de usuarios activos
setInterval(() => {
    const usersElement = document.getElementById('activeUsers');
    const currentUsers = parseInt(usersElement.textContent.replace(',', ''));
    
    // 30% de probabilidad de incrementar
    if (Math.random() > 0.7) {
        const newCount = currentUsers + 1;
        usersElement.textContent = newCount.toLocaleString();
        
        // Actualizar en localStorage
        let stats = JSON.parse(localStorage.getItem('stats')) || {
            productsSaved: 847,
            wasteReduced: 2.3,
            co2Saved: 5420,
            activeUsers: 1234
        };
        stats.activeUsers = newCount;
        localStorage.setItem('stats', JSON.stringify(stats));
    }
}, 15000); // Cada 15 segundos

// Animación de entrada para las cards
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'all 0.5s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

// Observar todas las cards
document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// Función para limpiar datos (útil para desarrollo/testing)
function clearAllData() {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos?')) {
        localStorage.removeItem('products');
        localStorage.removeItem('stats');
        localStorage.removeItem('activeTab');
        location.reload();
    }
}

// Para acceder a la función de limpieza desde la consola del navegador:
// Escribe: clearAllData() en la consola

console.log('🌱 Plataforma de Economía Circular cargada correctamente');
console.log('💡 Tip: Usa clearAllData() en la consola para resetear todos los datos');