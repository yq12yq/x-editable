/**
Attaches stand-alone container with editable-form to HTML element. Element is used only for positioning, value is not stored anywhere.<br>
This method applied internally in <code>$().editable()</code>. You should subscribe on it's events (save / cancel) to get profit of it.<br>
Final realization can be different: bootstrap-popover, jqueryui-tooltip, poshytip, inline-div. It depends on which js file you include.<br>
Applied as jQuery method.

@class editableContainer
@uses editableform
**/
(function ($) {

    var EditableContainer = function (element, options) {
        this.init(element, options);
    };

    //methods
    EditableContainer.prototype = {
        containerName: null, //tbd in child class
        innerCss: null, //tbd in child class
        init: function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.editableContainer.defaults, $.fn.editableform.utils.getConfigData(this.$element), options);         
            this.options.trigger = 'manual';
            this.initContainer();

            //bind 'destroyed' listener to destroy container when element is removed from dom
            this.$element.on('destroyed', $.proxy(function(){
                this.destroy();
            }, this));             
        },

        initContainer: function(){
            this.call(this.options);
        },

        initForm: function() {
            this.$form = $('<div>')
            .editableform(this.options)
            .on({
                save: $.proxy(this.save, this),
                cancel: $.proxy(this.cancel, this),
                show: $.proxy(this.setPosition, this),
                rendering: $.proxy(this.setPosition, this)
            });
            return this.$form;
        },        

        /**
        Returns jquery object of container
        @method tip()
        **/         
        tip: function() {
            return this.container().$tip;
        },

        container: function() {
            return this.$element.data(this.containerName); 
        },

        call: function() {
            this.$element[this.containerName].apply(this.$element, arguments); 
        },

        /**
        Shows container with form
        @method show()
        **/          
        show: function () {
            this.call('show');                
            this.tip().addClass('editable-container');

            this.initForm();
            this.tip().find(this.innerCss).empty().append(this.$form);      
            this.$form.editableform('render');            
        },

        /**
        Hides container with form
        @method hide()
        **/         
        hide: function() {
            this.call('hide'); 
        },

        /**
        Updates the position of container when content changed.
        @method setPosition()
        **/       
        setPosition: function() {
            //tbd in child class
        },

        cancel: function() {
            if(this.options.autohide) {
                this.hide();
            }
            /**        
            Fired when form was cancelled by user
            
            @event cancel 
            @param {Object} event event object
            **/             
            this.$element.triggerHandler('cancel');
        },

        save: function(e, params) {
            if(this.options.autohide) {
                this.hide();
            }
            /**        
            Fired when new value was submitted
            
            @event save 
            @param {Object} event event object
            @param {Object} params additional params
                @param {mixed} params.newValue submitted value
                @param {Object} params.response ajax response
            **/             
            this.$element.triggerHandler('save', params);
        },

        /**
        Sets new option
        
        @method option(key, value)
        @param {string} key 
        @param {mixed} value 
        **/         
        option: function(key, value) {
            this.options[key] = value;
            this.call('option', key, value); 
        },

        /**
        Destroys the container instance
        @method destroy()
        **/        
        destroy: function() {
            this.call('destroy');
        } 

    };

    //jQuery plugin definition
    $.fn.editableContainer = function (option) {
        var args = arguments;
        return this.each(function () {
            var $this = $(this),
            dataKey = 'editableContainer', 
            data = $this.data(dataKey), 
            options = typeof option === 'object' && option;

            if (!data) {
                $this.data(dataKey, (data = new EditableContainer(this, options)));
            }

            if (typeof option === 'string') { //call method 
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }            
        });
    };     

    //store constructor
    $.fn.editableContainer.Constructor = EditableContainer;

    //defaults - must be redefined!
    $.fn.editableContainer.defaults = {
        /**
        Initial value of form input

        @property value 
        @type mixed
        @default null
        @private
        **/        
        value: null,
        /**
        Placement of container relative to element. Can be <code>top|right|bottom|left</code>. Not used for inline container.

        @property placement 
        @type string
        @default 'top'
        **/        
        placement: 'top',
        /**
        Wether to hide container on save/cancel.

        @property autohide 
        @type boolean
        @default true
        @private 
        **/        
        autohide: true
    };

    /* 
    * workaround to have 'destroyed' event to destroy popover when element is destroyed
    * see http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom
    */
    jQuery.event.special.destroyed = {
        remove: function(o) {
            if (o.handler) {
                o.handler();
            }
        }
    };    

}(window.jQuery));