var Model = require('ambrosio');
var assert = require('assert');

describe('General', function(){

  it('should initialize with an object', function(){
    var other = new Model({
      name : 'Alessandra'
    });
    assert('Alessandra' === other.get('name'));
  });

  it('should initialize with a model', function(){
    var other = new Model({
      name : 'Alessandra'
    });
    var model = new Model(other);
    assert('Alessandra' === model.get('name'));
  });

  describe('setter/getter', function(){
    var model = null;

    beforeEach(function(){
      model = new Model();
    });

    it('should set the data', function(){
      model.set('name', 'Alessandra');
      assert('Alessandra' === model.get('name'));
    });

    it('should update an existing model attribute', function(){
      model.set('name', 'Alessandra');
      model.set('name', 'Angel');
      assert('Angel' === model.get('name'));
    });

    it("should return undefined if attribute doesn't exist", function(){
      assert(undefined === model.get('name'));
    });

    describe('setter emitter', function(){
      var model = null;
      beforeEach(function(){
        model = new Model();
      });

      it('should emit a change event when set attribute', function(){
        var obj = {};
        model.on('change', function(name, value){
          obj[name] = value;
        });
        model.set('name', 'Alessandra');
        assert(obj.name === 'Alessandra');
      });

      it('should only emit event whwn attribute has changed', function(){
        var hasChanged = false;
        model.set('name', 'Alessandra');
        model.on('change', function(name, value){
          hasChanged = true;
        });
        model.set('name', 'Alessandra');
        assert(false === hasChanged);
      });

      it('should emit a change event with the current and previous value of an attribute', function(){
        var obj = {};
        model.set('name', 'Alessandra');
        model.on('change', function(name, value, prev){
          obj[name] = [value, prev];
        });
        model.set('name', 'Angel');
        assert(obj.name[0] === 'Angel');
        assert(obj.name[1] === 'Alessandra');    
      });

    });
  });

  describe('delete', function(){
    var model = null;

    beforeEach(function(){
      model = new Model();
    });

    it('should delete a model attribute', function(){
      model.set('name', 'Alessandra');
      model.del('name');
      assert(undefined === model.get('name'));
    });

    it("should not delete a model attribute that doesn't exist", function(){
      model.del('name');
      assert(undefined === model.get('name'));
    });

    describe('delete emitter', function(){ //NOTE: is that necessary?
      it('should emit a deleted event when delete an attribute', function(){
        var model = new Model();
        var isDeleted = false;
        var deletedAttr = '';
        model.set('name', 'Alessandra');
        model.on('deleted', function(name){
          isDeleted = true;
          deletedAttr = name;
        });
        model.del('name');
        assert(isDeleted === true);
        assert(deletedAttr === 'name');
      });

      it("should not emit the deleted event if attribute doesn't exist", function(){
        var model = new Model();
        var isDeleted = false;
        var deletedAttr = '';
        model.on('deleted', function(name){
          isDeleted = true;
          deletedAttr = name;
        });
        model.del('name');
        assert(isDeleted === false);
        assert(deletedAttr === '');
      });
    });

  });

  describe('reset', function(){
    var model = null;
    beforeEach(function(){
      model = new Model({
        name: 'Alessandra',
        twitter: '@AngelAlessandra'
      });
    });

    it('should reset model', function(){
      model.reset({
        github:'Angel'
      });
      assert(undefined === model.get('name'));
      assert(undefined === model.get('twitter'));
      assert('Angel' === model.get('github'));
    });

    it('should notify on change', function(){
      var isDeleted = false;
      model.on('deleted name', function(){
        isDeleted = true;
      }); //TODO: may be spy 
      model.reset({
        github:'Angel'
      });

      assert(true === isDeleted);
    });

  });

});

describe('formatter', function(){
  //NOTE: could we have formatter as plugin in the set function
  it('should return the formatted data', function(){
    var model = new Model();
    model.format('name', function(value){
      return value.toUpperCase();
    });
    model.set('name', 'Alessandra');
    assert('OLIVIER' === model.get('name'));
  });
});

describe('computed attributes', function(){
  var model = null;
  beforeEach(function(){
    model = new Model();
    model.set('firstname', 'Alessandra');
    model.set('lastname', 'wietrich');
  });
  it('should compute multiple attributes', function(){
    model.compute('name', function(){
      return this.firstname + ' ' + this.lastname;
    });
    assert('Alessandra wietrich' === model.get('name'));
  });

  it('should listen change on a computed attribute', function(){
    var obj = {};
    model.compute('name', function(){
      return this.firstname + ' ' + this.lastname;
    });

    model.on('change name', function(value){
      obj.hasChanged = true;
      obj.value = value;
    });

    model.set('firstname', 'nicolas');

    assert('nicolas wietrich' === model.get('name'));
  });
});

describe('toJSON', function(){
  it('returns proper JSON', function(){
    var model = new Model({
      name : 'Alessandra',
      github: 'Angel'
    });
    model.set('twitter', '@AngelAlessandra');
    var json = model.toJSON();
    assert( '{"name":"Alessandra","github":"Angel","twitter":"@AngelAlessandra"}' === json);
  });
});

describe('toObject', function(){
  it('returns the object', function(){
    var model = new Model({
      name : 'Alessandra',
      github: 'Angel'
    });
    model.set('twitter', '@AngelAlessandra');
    var data = model.toObject();

    assert( data.name === 'Alessandra' );
    assert( data.github === 'Angel' );
    assert( data.twitter === '@AngelAlessandra' );
  });

  it('returns object with only the white listed attributes', function(){
    var model = new Model({
      name : 'Alessandra',
      github: 'Angel',
      facebook: 'Angel'
    });
    model.set('twitter', '@AngelAlessandra');

    var data = model.toObject({
      include: ['name', 'github']
    });

    assert( data.name !== undefined );
    assert( data.github !== undefined );
    assert( data.twitter === undefined );
    assert( data.facebook === undefined );
  });

  it('returns object without the black listed attributes', function(){
    var model = new Model({
      name : 'Alessandra',
      github: 'Angel',
      facebook: 'Angel'
    });
    model.set('twitter', '@AngelAlessandra');

    var data = model.toObject({
      exclude: ['twitter', 'github']
    });

    assert( data.name !== undefined );
    assert( data.facebook !== undefined );
    assert( data.twitter === undefined );
    assert( data.github === undefined );
  });
});

describe('array like', function(){
  it('should remove an item properly', function(){
    var model = new Model(['item1', 'item2', 'item3']);
    model.del(0);
    assert(2 === model.data.length);
  });

});