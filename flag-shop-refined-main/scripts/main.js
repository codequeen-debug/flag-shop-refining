(function () {
  var CART_KEY = "flag-shop-cart";
  var countEl = document.getElementById("cart-count");
  var overlay = document.getElementById("cart-overlay");
  var drawer = document.getElementById("cart-drawer");
  var cartItemsEl = document.getElementById("cart-items");
  var cartEmptyEl = document.getElementById("cart-empty");
  var cartTotalEl = document.getElementById("cart-total");

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCount();
    renderCart();
  }

  function updateCount() {
    var items = getCart();
    var total = items.reduce(function (sum, item) {
      return sum + (item.qty || 1);
    }, 0);
    if (countEl) {
      countEl.textContent = total;
      countEl.classList.toggle("cart-count--visible", total > 0);
    }
  }

  function addToCart(name, price) {
    var items = getCart();
    var found = items.find(function (item) {
      return item.name === name;
    });
    if (found) {
      found.qty = (found.qty || 1) + 1;
    } else {
      items.push({ name: name, price: parseFloat(price) || 0, qty: 1 });
    }
    saveCart(items);
  }

  function removeFromCart(index) {
    var items = getCart();
    items.splice(index, 1);
    saveCart(items);
  }

  function openCart() {
    if (overlay) overlay.classList.add("is-open");
    if (drawer) {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
    }
    if (overlay) overlay.setAttribute("aria-hidden", "false");
    renderCart();
  }

  function closeCart() {
    if (overlay) overlay.classList.remove("is-open");
    if (drawer) {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (overlay) overlay.setAttribute("aria-hidden", "true");
  }

  function renderCart() {
    var items = getCart();
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = "";
    items.forEach(function (item, index) {
      var qty = item.qty || 1;
      var subtotal = (item.price * qty).toFixed(2);
      var row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<div class="cart-item-info">' +
        '<span class="cart-item-name">' + escapeHtml(item.name) + "</span>" +
        '<div class="cart-item-details">' + qty + " × $" + Number(item.price).toFixed(2) + " = $" + subtotal + "</div>" +
        "</div>" +
        '<button type="button" class="cart-item-remove" data-cart-index="' + index + '" aria-label="Remove from cart">Remove</button>';
      cartItemsEl.appendChild(row);
    });
    cartItemsEl.querySelectorAll(".cart-item-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-cart-index"), 10);
        if (!isNaN(idx)) removeFromCart(idx);
      });
    });
    var totalQty = items.reduce(function (s, item) { return s + (item.qty || 1); }, 0);
    var totalSum = items.reduce(function (s, item) {
      return s + (item.price || 0) * (item.qty || 1);
    }, 0);
    if (cartEmptyEl) cartEmptyEl.style.display = totalQty === 0 ? "block" : "none";
    if (cartTotalEl) cartTotalEl.textContent = "$" + totalSum.toFixed(2);
    var footer = drawer && drawer.querySelector(".cart-drawer-footer");
    if (footer) footer.style.display = totalQty === 0 ? "none" : "block";
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  document.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = this.getAttribute("data-flag-name") || "Flag";
      var price = this.getAttribute("data-price") || "0";
      addToCart(name, price);
      this.textContent = "Added!";
      var self = this;
      setTimeout(function () {
        self.textContent = "Add to Cart";
      }, 1500);
    });
  });

  document.querySelectorAll(".buy-now").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = this.getAttribute("data-flag-name") || "Flag";
      var price = this.getAttribute("data-price") || "0";
      addToCart(name, price);
      openCart();
    });
  });

  var cartTrigger = document.getElementById("cart-trigger");
  if (cartTrigger) cartTrigger.addEventListener("click", openCart);
  if (overlay) overlay.addEventListener("click", closeCart);
  var cartClose = document.getElementById("cart-close");
  if (cartClose) cartClose.addEventListener("click", closeCart);

  var checkoutBtn = document.getElementById("cart-checkout");
  if (checkoutBtn) checkoutBtn.addEventListener("click", function () {
    closeCart();
    alert("Checkout is not implemented yet. Your cart has been saved.");
  });

  updateCount();
  renderCart();
})();

(function () {
  var btn = document.getElementById("newsletter-submit");
  var input = document.getElementById("newsletter-email");
  var overlay = document.getElementById("newsletter-popup-overlay");
  var popupText = document.getElementById("newsletter-popup-text");
  var popupClose = document.getElementById("newsletter-popup-close");

  function isValidEmail(value) {
    var at = value.indexOf("@");
    if (at < 1) return false;
    var dot = value.lastIndexOf(".");
    if (dot <= at + 1 || dot === value.length - 1) return false;
    return true;
  }

  function showPopup(message, isError) {
    if (popupText) popupText.textContent = message;
    if (overlay) {
      overlay.classList.add("newsletter-popup--visible");
      overlay.setAttribute("aria-hidden", "false");
      if (isError) overlay.classList.add("newsletter-popup--error");
      else overlay.classList.remove("newsletter-popup--error");
    }
  }

  function hidePopup() {
    if (overlay) {
      overlay.classList.remove("newsletter-popup--visible");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  if (btn && input && overlay && popupText) {
    btn.addEventListener("click", function () {
      var email = (input.value || "").trim();
      if (!email) {
        showPopup("Please enter your email.", true);
        console.log("Newsletter: Subscribe clicked but no email entered.");
        return;
      }
      if (!isValidEmail(email)) {
        showPopup("Please enter a valid email address (e.g. name@example.com).", true);
        console.log("Newsletter: Invalid email format: " + email);
        return;
      }
      showPopup("Thanks for subscribing!", false);
      input.value = "";
      console.log("Newsletter: Subscribed with email: " + email);
    });
  }
  if (popupClose) popupClose.addEventListener("click", hidePopup);
  if (overlay) overlay.addEventListener("click", function (e) {
    if (e.target === overlay) hidePopup();
  });
})();
