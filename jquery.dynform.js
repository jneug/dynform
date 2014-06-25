/*
  TODO:
    - Remove events option and keep at defaults (may speed up handler creation)
    - Consistent use of elements instead of triggers
    - Store element reference in triggers and use throughout?
    - Should callbacks be called before or after elements are added/removed/renumbered etc.
      - Currently they are called before adding/renumbering -> collision of rm with check
    - Use check to decide if elements should be added (!check([new_element]))? Or new callnack?
    - Add max optio?
    - bind triggers to input elements (others make no sense)?
  FIX:
    - Press key (element gets replicated) and then backspace (input is empty) does not trigger rm event
*/

(function($) {
    $.dynform = {
        name: 'dynform - dynamic forms plugin for jQuery',
        version: 0.1,
        author: 'Jonas Neugebauer <jonas.neugebauer@uni-paderborn.de>',

        build: function(options) {
            return this.each(function() {
                if (this.dynformInit)
                    return;

                var opts = $.extend({}, $.fn.dynform.defaults, options);
                opts.tpl = opts.tpl || $(this).html();
                if (opts.callback.add)
                    opts.callback.add = opts.callback.add.bind(this);
                if (opts.callback.rm)
                    opts.callback.rm = opts.callback.rm.bind(this);
                if (opts.callback.renumber)
                    opts.callback.renumber = opts.callback.renumber.bind(this);
                if (opts.check)
                    opts.check = opts.check.bind(this);

                opts.inputids = [];
                $('input', opts.tpl).each(function(i, e) {
                    e = $(e);
                    if (e.attr('id'))
                        opts.inputids.push(e.attr('id'));
                });
                opts.labelids = [];
                $('label', opts.tpl).each(function(i, e) {
                    e = $(e);
                    if (e.attr('for'))
                        opts.labelids.push(e.attr('for'));
                });

                this.dynformOpts = opts;
                this.dynformInit = true;

                $(this).empty();
                $.dynform.add_input.bind(this)();
            });
        },

        add_input: function(e) {
            var dynform = this.dynform || this;
            var opts = dynform.dynformOpts;

            if (!this.dynformElement || !$(this.dynformElement).next().length) {
                var new_elem = $.dynform.maketpl(dynform, opts);

                var do_add = true;
                if (opts.callback.add)
                    do_add = opts.callback.add(new_elem);

                if (do_add) {
                    $(dynform).append(new_elem);
                    $.dynform.renumber_ids(dynform, opts);
                    $.dynform.setup_handlers(dynform, opts);
                }
            }
        },

        rm_inputs: function(e) {
            var dynform = this.dynform || this;
            var opts = dynform.dynformOpts;

            var rm = [];
            $(dynform).children().not(':last').each(function(i, el) {
                if (opts.check($(opts.trigger, el), el)) {
                    rm.push(el);
                }
            });

            if (rm.length > 0 && opts.callback.rm)
                rm = opts.callback.rm(rm) || rm;

            if (rm.length > 0) {
                $.each(rm, function(i, el) {
                    $(el).remove();
                })
                $.dynform.renumber_ids(dynform, opts);
                $.dynform.setup_handlers(dynform, opts);
            }
        },

        maketpl: function(dynform, opts) {
            var no = $(dynform).children().length + 1;
            var new_tpl = $(opts.tpl.replace(opts.number_tpl, no));
            $(opts.trigger, new_tpl).each(function(i, e) {
                e.dynform = dynform;
                e.dynformElement = new_tpl;
            });
            return new_tpl;
        },

        setup_handlers: function(dynform, opts) {
            var triggers = $(opts.trigger, dynform).off('.dynform');

            $(dynform).children().not(':last').each(function(i, el) {
                triggers = $(opts.trigger, el);

                $.each(opts.events.rm, function(j, ev) {
                    triggers.on(ev + '.dynform', $.dynform.rm_inputs);
                });
            });
            $(dynform).children().last().each(function(i, el) {
                triggers = $(opts.trigger, el);

                $.each(opts.events.add, function(j, ev) {
                    triggers.on(ev + '.dynform', $.dynform.add_input);
                });
            });
        },

        renumber_ids: function(dynform, opts) {
            $(dynform).children().each(function(i, e) {
                var no = i + 1;
                $('input', e).each(function(j, input) {
                    input = $(input);
                    if (input.attr('id'))
                        input.attr('id', opts.inputids[j] + no);
                });
                $('label', e).each(function(j, label) {
                    label = $(label);
                    if (label.attr('for'))
                        label.attr('for', opts.labelids[j] + no);
                });

                if (opts.callback.renumber)
                    opts.callback.renumber(no, e);
            });
        }
    };

    $.fn.dynform = $.dynform.build;

    $.fn.dynform.defaults = {
        //tpl: '',
        trigger: '.dynform-trigger',
        number_tpl: /{#}/g,
        events: {
            add: ['change', 'keypress'],
            rm: ['change']
        },
        callback: {
            //  add: function(new_element){ return true },
            //  rm: function(removed_elements){ return removed_elements },
            //  renumber: function(no, element){}
        },
        check: function(triggers, element) {
            var remove = true;
            $(triggers).each(function(i, input) {
                remove = remove & ($(input).val().trim().length <= 0);
            });
            return remove;
        }
    };
}(jQuery));