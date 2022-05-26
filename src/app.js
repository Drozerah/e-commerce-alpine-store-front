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
  isInit: false, // this._init once

  updateStore(event, product){
    if (event === 'increment') {
      // update quantity
      product.quantity++
      // update cart_total
      this.cart_total++
    } else if (event === 'decrement') {
      // update quantity
      product.quantity--
      // update cart_total
      this.cart_total--
    }
    // update counter
    this.counter[product.id] = product.quantity
    // update cart_amount
    this.cart_amount = this.getCartAmount()
  },

  saveProduct(product){
    // add product to products list
    this.products.push(product)
  },

  createProduct(root){
    // create product Object
    const product = {
      id: root.dataset.id,
      name: root.dataset.name,
      weight: root.dataset.weight,
      price: root.dataset.price,
      quantity: 0
    }
    return product
  },

  add(root) {
    // ref product id
    const id = root.dataset.id
    // get product
    let product = this.getProductById(id)

    if (!product) {
      // create product
      product = this.createProduct(root)
      // save product
      this.saveProduct(product)
      // update store
      this.updateStore('increment', product)
    } else if (product.quantity < 10) {
      // update store
      this.updateStore('increment', product)
    }
  },

  remove(root) {
    // ref product id
    const id = root.dataset.id
    // get product
    const product = this.getProductById(id)
    if (product) {
      if (product.quantity > 1) {
        this.updateStore('decrement', product)
      } else {
        // remove product
        this.products = this.products.filter((product) => product.id !== id)
        this.updateStore('decrement', product)
      }
    }
  },

  getProductById(id){
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
    this.products.map(product => counter[product.id] = product.quantity)
    return counter
  },

  _init(){
    if (!this.isInit) {
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
