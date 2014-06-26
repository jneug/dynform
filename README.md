dynform
=======

A simple jQuery plugin to dynamically replicate form fields.

dynform will replicate a set of elements usually in a form based on simple rules.
The most common usecase would be to replicate an input field when the user
starts typing to allow for multiple inputs. For example to allow a user to enter
multiple phone numbers. First only one input would be visible, but as soon as
the user entered the first number, a second input apears.

The plugin can be used multiple times per form and page.

```html
<form>
	<input id="notDynamic">
	<div id="dynamic_components">
		<input id="willReplicate">
	</div>
</form>

<script>
$('#dynamic_components').dynform();
</script>
```

## Example

See [example.html].

## Options

dynform can be initialised with various options:

* **tpl** - *String*

	A html template to replicate. If none is given, the content of the dynform
	element is used.
* **trigger** - *String*

	A selector to use for identifying replication triggers (inputs) inside the replication template. Defaults to `.dynform-trigger`.
* **max** - *Number*

	Maximum number of elements to replicate.
* **events** - *Object*

	The object has two keys: `add` and `rm` that both have an array of *Strings* as value. Each string should be a valid event that can be passed
	to [on](http://api.jquery.com/on/). These events will be bound to the triggers and invoke the addition and removal of replicated elements.

	Default:

		{
			events: {
				add: ['change', 'keypress'],
				rm: ['change']
			}
		}
* **callback** - *Object*

	Can have three keys with callback functions as values: `add`, `rm` and `renumber`.
 * **add** - *Function*

 		add: function(new_element) { return true; }

 	The `add` callback is invoked every time a new element is about to be added,
 	but before the element is actually appended. The callback will receive the
 	new element as an argument. It may veto the addition by returning false.
 * **rm** - *Function*

 		rm: function(removed_elements){ return removed_elements; }

 	The `rm` callback is invoked when replicated elements are about to get removed from the dynform. It will receive all elements the will get removed as an array. It may veto the removal by removing elements from and returning the truncated array.
 * **renumber** - *Function*

		renumber: function(no, element){}

	The `renumber` callback is called once for every element when the element ids are renumbered. It will receive the number of the element and the element itself as arguments. This callback is useful for also renumbering labels and other custom text inside the form.
* **keep** - *Function*

		keep: function(triggers, element) { return boolean; }

	The `keep` function is used to decide if an element should be removed from the dynform or not. By default the plugin will check every trigger of the element for its value and if they all are empty the element is removed. For more complex behavior (e.g. checking inputs that are not triggers themselves) you can provide your own logic here.

## Notes

* dynform element will be emptied
* dynform elements should be wrapped in a div