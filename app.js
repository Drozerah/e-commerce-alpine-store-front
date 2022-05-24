import Alpine from 'alpinejs'
console.log('JS is loaded') // !DEBUG

/**
 * make sure to define your x-data function before you call Alpine.start(): 
 */
function myData() {
  return {
    paragraph: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil, possimus.'
  }
}
// attach myData to the window Object
window.myData = myData

window.Alpine = Alpine
Alpine.start()