dynform
=======

A simple jQuery plugin to dynamically replicate form fields.

dynform will replicate a set of elements usually in a form based on simple rules.
The most common usecase would be to replicate an input field when the user
starts typing to allow for multiple inputs. For example to allow a user to enter
multiple phone numbers. First only one input would be visible, but as soon as
the user entered the first number, a second input apears.

The plugin can be used multiple times per form and page.

```
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