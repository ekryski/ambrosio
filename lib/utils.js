/**
 * Universal Module Shim
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(this, function () {
  return {

    /**
     * Mixin a given set of properties
     * @param {object} obj - The object to add the mixed in properties
     * @param {object} properties - The properties to mix in
     * @return {object} obj
     */
    mixin: function(obj, properties) {
      properties = properties || {};

      for (var key in properties) {
        obj[key] = properties[key];
      }

      return obj;
    },

    /**
     * Clone object.
     * @param  {object} obj
     * @return {object} obj
     * @api public
     */
    clone: function(obj) {
      if (obj instanceof Array) {
        return obj.slice(0);
      }

      if(typeof obj === 'object') {
        var copy = {};
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            copy[key] = clone(obj[key]);
          }
        }
        return copy;
      }

      return obj;
    },

    /**
     * Clone object.
     * @param  {object} obj
     * @return {object} obj
     * @api public
     */
    pluck: function(){
      // TODO
    },

    omit: function(){
      // TODO
    },

    findWhere: function(){
      // TODO
    }
  };
}));