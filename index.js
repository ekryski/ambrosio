/**
 * Universal Module Shim
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['emitter', 'lodash', 'jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('emitter'), require('lodash'), require('jquery'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.Emitter, root.Lodash, root.jQuery);
  }
}(this, function (Emitter, _, $) {

  try {
    var storage = window.localStorage;
  } catch(e) {
    var storage = null;
  }

  /**
   * Ambrosio constructor
   * @api public
   */

  function Ambrosio(data, options) {
    if (data instanceof Ambrosio) return data;
    this.data = data || {};
    this.options = _.defaults({}, options, {
      local: 'ambrosio',
      host: window.location.origin,
      url: '/',
      autosave: false
    });
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

      if (this.options.autosave) {
        this.update();
      }
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
    var str = callback.toString();
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
    
    for (var key in data) {
      this.set(data[key], key, originalData);
    }
  };

  /**
   * Fetch data to local storage or backend and population model.
   *
   * @param  {string} id - optional callback (optional)
   * @return {this}
   * @api public
   */
  
  Ambrosio.prototype.fetch = function(id, options) {

    //TODO (EK): Make GET request to REST endpoint
    if (typeof id !== 'string') {
      options = id;
      id = null;
    }

    if (this.local) {
      this.data = JSON.parse(storage.getItem(this.local));
    }

    if (this.url) {
      var url = this.options.host + this.options.url;
      var self = this;

      $.ajax({
        data: options,
        dataType: 'json',
        url: id ? (url + '/' + id) : url
      })
      .done(function(data){
        console.log('DATA', arguments);
          
        self.reset(data);
      })
      .fail(function(error){
        console.log('ERROR', arguments);
      });
    }
  };

  /**
   * Persist data to local storage or backend.
   *
   * @param  {function} callback - callback (optional)
   * @return {this}
   * @api public
   */
  
  Ambrosio.prototype.create = function(callback) {

    if (this.local) {
      storage.setItem(this.local, this.toJSON());
    }

    //TODO (EK): Make POST request to REST endpoint

    return this;
  };

  /**
   * Update data in local storage or backend.
   *
   * @param  {string} id - optional callback (optional)
   * @param  {function} callback - optional callback
   * @return {this}
   * @api public
   */
  Ambrosio.prototype.update = function(id, callback) {

    if (this.local) {
      storage.setItem(this.local, this.toJSON());
    }

    //TODO (EK): Make PUT/PATCH request to REST endpoint

    return this;
  };

  /**
   * Update data in local storage or backend.
   *
   * @param  {string} id - optional callback (optional)
   * @param  {function} callback - optional callback
   * @return {this}
   * @api public
   */
  Ambrosio.prototype.destroy = function(id, callback) {

    if (this.local) {
      storage.setItem(this.local, this.toJSON());
    }

    //TODO (EK): Make DELETE request to REST endpoint

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

  _.mixin(Ambrosio.prototype, Emitter.prototype);
    
  return Ambrosio;
}));