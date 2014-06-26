/*
  TODO:
    - Remove events option and keep at defaults (may speed up handler creation)
    - Consistent use of elements instead of triggers
    - Store element reference in triggers and use throughout?
    - Should callbacks be called before or after elements are added/removed/renumbered etc.
      - Currently they are called before adding/renumbering -> collision of rm with check
    - bind triggers to input elements (others make no sense)?
  FIX:
    - Press key (element gets replicated) and then backspace (input is empty) does not trigger rm event
    - With max option set and max replicated elements, after removing one, a new one should be added if necessary
  FIXED:
    - add max option
    - renamed check to keep
    - renumber ALL ids in tpl!!
    - Use check to decide if elements should be added (!check([new_element]))?
    - what if template has more than 1 elements? Then dynform.children() does not work!
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
                if ($(opts.tpl).children().length > 1)
                    opts.tpl = '<div>' + opts.children + '</div>'

                if (opts.callback.add)
                    opts.callback.add = opts.callback.add.bind(this);
                if (opts.callback.rm)
                    opts.callback.rm = opts.callback.rm.bind(this);
                if (opts.callback.renumber)
                    opts.callback.renumber = opts.callback.renumber.bind(this);
                if (opts.keep)
                    opts.keep = opts.keep.bind(this);

                opts.allids = [];
                $('[id]', opts.tpl).each(function(i, e) {
                    opts.allids.push($(e).attr('id'));
                });
                opts.allfors = [];
                $('label[for]', opts.tpl).each(function(i, e) {
                    opts.allfors.push($(e).attr('for'));
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

            if (opts.max && $(dynform).children().length >= opts.max)
                return;

            if (!this.dynformElement || !$(this.dynformElement).next().length) {
                // if (this.dynformElement) {
                //     if (!opts.keep($(opts.trigger, this.dynformElement), this.dynformElement)) {
                //         return;
                //     }
                // }

                var new_elem = $.dynform.maketpl(dynform, opts);

                var do_add = true;
                if (opts.callback.add)
                    do_add = opts.callback.add(new_elem);

                if (do_add) {
                    $(dynform).append(new_elem);
                    $.dynform.renumber(dynform, opts);
                    $.dynform.setup_handlers(dynform, opts);
                }
            }
        },

        rm_inputs: function(e) {
            var dynform = this.dynform || this;
            var opts = dynform.dynformOpts;

            var rm = [];
            $(dynform).children().not(':last').each(function(i, el) {
                if (!opts.keep($(opts.trigger, el), el)) {
                    rm.push(el);
                }
            });

            if (rm.length > 0 && opts.callback.rm)
                rm = opts.callback.rm(rm) || rm;

            if (rm.length > 0) {
                $.each(rm, function(i, el) {
                    $(el).remove();
                })
                $.dynform.renumber(dynform, opts);
                $.dynform.setup_handlers(dynform, opts);
            }
        },

        maketpl: function(dynform, opts) {
            var no = $(dynform).children().length + 1;
            var new_tpl = $(opts.tpl.replace(/{#}/g, no));
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

        renumber: function(dynform, opts) {
            $(dynform).children().each(function(i, e) {
                var no = i + 1;

                $('[id]', e).each(function(j, el) {
                    $(el).attr('id', opts.allids[j] + no);
                });
                $('label[for]', e).each(function(j, label) {
                    $(label).attr('for', opts.allfors[j] + no);
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
        events: {
            add: ['change', 'keypress'],
            rm: ['change']
        },
        callback: {
            //  add: function(new_element){ return true },
            //  rm: function(removed_elements){ return removed_elements },
            //  renumber: function(no, element){}
        },
        keep: function(triggers, element) {
            var keep = true;
            $(triggers).each(function(i, input) {
                keep = keep & ($(input).val().trim().length > 0);
            });
            return keep;
        }
    };
}(jQuery));