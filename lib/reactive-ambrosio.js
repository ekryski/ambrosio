/**
 * Universal Module Shim
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ambrosio'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('ambrosio'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.Ambrosio);
  }
}(this, function (Emitter) {

  /**
   * AmbrosioAdapter constructor
   * For details see https://github.com/component/reactive#model-adapters
   * @api public
   */

  function AmbrosioAdapter(model) {
    if (!(model instanceof AmbrosioAdapter)) return new AmbrosioAdapter(model);
    this.model = model;
  }

  /**
   * Get store attribute.
   * @param {String} name
   * @return {Anything}
   * @api public
   */

  AmbrosioAdapter.prototype.get = function(name) {
    return this.model.get(name);
  };

  /**
   * Set store attribute.
   * @param {String} name
   * @param {Anything} value
   * @api public
   */

  AmbrosioAdapter.prototype.set = function(name, value) { //add object options
    this.model.set(name, value);
  };

  /**
   * Subscribe to a property change.
   * @param {string} name - property name
   * @param {function} callback - the callback
   * @api public
   */

  AmbrosioAdapter.prototype.subscribe = function(name, callback) {
    this.model.on('change:' + name, callback);
  };

  /**
   * Unsubscribe to a property change.
   * @param {string} name - property name
   * @param {function} callback - the callback
   * @api public
   */
  
  AmbrosioAdapter.prototype.unsubscribe = function(name, callback) {
    this.model.off('change:' + name, callback);
  };

  AmbrosioAdapter.prototype.unsubscribeAll = function() {
    this.model.off();
  };
    
  return AmbrosioAdapter;
}));