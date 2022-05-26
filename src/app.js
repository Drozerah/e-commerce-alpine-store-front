import persist from '@alpinejs/persist'
import Alpine from 'alpinejs'
import money from "alpinejs-money"
import tash from "alpinejs-tash"
console.log('JS is loaded') // !DEBUG


Alpine.plugin(persist)

Alpine.store('_', {

  storageName: 'cart', // set storage key name
  products: Alpine.$persist([]).as('cart'),
  counter: {},
  cart_total: 0,
  cart_amount: 0,
  isInit: false,

  createProduct(root){
    const product = {
      id: root.dataset.id,
      name: root.dataset.name,
      weight: root.dataset.weight,
      price: root.dataset.price,
      quantity: 0
    }
    return product
  },

  add(id) {
    // get product
    const product = this.getProductById(id)
    if (product.quantity < 10) {
      // update quantity
      product.quantity++
      // update counter
      this.counter[id] = product.quantity
      // update cart_total
      this.cart_total++
      // update cart_amount
      this.cart_amount = this.getCartAmount()
    }
  },

  remove(id) {
    // get product
    const product = this.getProductById(id)
    if (product.quantity > 0) {
      // update quantity
      product.quantity--
      // update counter
      this.counter[id] = product.quantity
      // update cart_total
      this.cart_total--
      // update cart_amount
      this.cart_amount = this.getCartAmount()
    }
  },

  getProductById(id){
    // get single product from filtered products Array
    const isProduct = this.products.filter((product) => product.id === id)
    return isProduct[0]
  },

  getCartTotal () {
    const initialValue = 0
    const totalQuantity = this.products.reduce((acc, cur) => acc + cur.quantity, initialValue)
    return totalQuantity
  },

  getCartAmount () {
    const initialValue = 0
    const amount = this.products.reduce((acc, cur) => acc + (cur.price * cur.quantity), initialValue)
    return amount
  },

  setCartCounter () {
    const counter = {}
    this.products.map(product => {
      counter[product.id] = product.quantity
    })
    return counter
  },

  _init(root){
    
    if (!this.getProductById(root.dataset.id)) {
      // create product
      const product = {
        id: root.dataset.id,
        name: root.dataset.name,
        weight: root.dataset.weight,
        price: root.dataset.price,
        quantity: 0
      }
      // update products Array
      this.products.push(product)
      // update counter
      this.counter[root.dataset.id] = product.quantity
    }

    if (!this.isInit) {
      // update cart total 
      this.cart_total = this.getCartTotal()
      this.cart_amount = this.getCartAmount()
      this.counter = this.setCartCounter()
      this.isInit = true
    }

  }
})

window.Alpine = Alpine
Alpine.plugin(money)
Alpine.plugin(tash)
Alpine.start()
