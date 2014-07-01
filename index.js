/**
 * Universal Module Shim
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['emitter'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('emitter'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.Emitter);
  }
}(this, function (Emitter) {

  try {
    var storage = window.localStorage;
  } catch(e) {
    var storage = null;
  }

  /**
   * Ambrosio constructor
   * @api public
   */

  function Ambrosio(data) {
    if (data instanceof Ambrosio) return data;
    this.data = data || {};
    this.formatters = {};
  }

  /**
   * Get model attribute.
   * @param {string} name
   * @return {anything}
   * @api public
   */

  Ambrosio.prototype.get = function(name) {
    var formatter = this.formatters[name];
    var value = this.data[name];
    if(formatter) {
      value = formatter[0].call(formatter[1], value);
    }
    return value;
  };

  /**
   * Set model attribute.
   * @param {string} name
   * @param {anything} value
   * @api public
   */

  Ambrosio.prototype.set = function(name, value, original) { //add object options
    var prev = original !== undefined ? original[name] : this.data[name];
    if (prev !== value) {
      this.data[name] = value;
      this.emit('change', name, value, prev);
      this.emit('change ' + name, value, prev);
      this.emit('change:' + name, value, prev);
    }
  };

  /**
   * Get model attribute.
   * @param {string} name
   * @return {anything}
   * @api private
   */

  Ambrosio.prototype.has = function(name) {
    //NOTE: I don't know if it should be public
    return this.data.hasOwnProperty(name);
  };


  /**
   * Delete model attribute.
   * @param {string} name
   * @return {anything}
   * @api public
   */

  Ambrosio.prototype.remove = function(name) {
    //TODO:refactor this is ugly
    if(this.has(name)){
      if(this.data instanceof Array){
        this.data.splice(name, 1);
      } else {
        delete this.data[name]; //NOTE: do we need to return something?
      }
      this.emit('removed', name);
      this.emit('removed ' + name);
    }
  };


  /**
   * Set format middleware.
   * Call formatter everytime a getter is called.
   * A formatter should always return a value.
   * @param {string} name
   * @param {Function} callback
   * @param {Object} scope
   * @return this
   * @api public
   */

  Ambrosio.prototype.format = function(name, callback, scope) {
    this.formatters[name] = [callback,scope];
    return this;
  };


  /**
   * Compute model attributes
   * @param  {string} name
   * @return {Function} callback                
   * @api public
   */

  Ambrosio.prototype.compute = function(name, callback) {
    // NOTE: I want something clean instead of passing the computed 
    // attribute in the function
    var str = callback.tostring();
    var attrs = str.match(/this.[a-zA-Z0-9]*/g);

    this.set(name, callback.call(this.data)); //TODO: refactor (may be use replace)
    
    for (var l = attrs.length; l--;) {
      this.on('change ' + attrs[l].slice(5), function(){
        this.set(name, callback.call(this.data));
      });
    }
  };


  /**
   * Reset model
   * @param  {Object} data 
   * @api public
   */

  Ambrosio.prototype.reset = function(data) {
    var originalData = _.cloneDeep(this.data);
    // We just assign the new data to the model because
    // it is faster than deleting each key, value in a loop.
    this.data = data;

    // Loop through the original keys and emit removed events for 
    // keys that are undefined in our new data.
    for (var key in originalData) {
      if(typeof data[key] === 'undefined'){
        this.emit('removed', key);
        this.emit('removed ' + key);
        this.emit('removed:' + key);
      }
    }

    this.emit('reset');
    //set new attributes
    _.each(data, function(val, key){
      this.set(val, key, originalData);
    }, this);
  };

  /**
   * Synchronize with local storage or backend.
   * 
   * @param  {String} name 
   * @param  {Boolean} bool save in localstore
   * @return {this}
   * @api public
   */

  Store.prototype.save = function(name, bool) {
    //TODO: should we do a clear for .local()?
    if(!bool) {
      storage.setItem(name, this.toJSON());
    } else {
      this.reset(JSON.parse(storage.getItem(name)));
    }
    return this;
  };


  /**
   * stringify model
   * @return {string} json
   * @api public
   */

  Ambrosio.prototype.toJSON = function(options) {
    return JSON.stringify(this.toObject(options));
  };

  /**
   * Convenience method for returning the object
   * @return {Object} data
   * @api public
   */

  Ambrosio.prototype.toObject = function(options) {
    options = options || {};

    var data = this.data;

    if (options.include) {
      data = _.pick(data, options.include);
    }
    else if (options.exclude) {
      data = _.omit(data, options.exclude);
    }

    return data;
  };

  /**
   * Mixin a given set of properties
   * @param obj The object to add the mixed in properties
   * @param properties The properties to mix in
   */
  var mixin = function(obj, properties) {
    properties = properties || {};

    for (var key in properties) {
      obj[key] = properties[key];
    }

    return obj;
  };

  var extend = mixin;

  mixin(Ambrosio.prototype, Emitter.prototype);
    
  return Ambrosio;
}));