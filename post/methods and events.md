# Code your own vue: methods and events

Hi everyone, It's been a while since the last chapter of 'Code your own vue', in the last chapter we see how to do our own lifecycle hooks, today we going to see how to code methods and events.
If you have been following atleast the first chapter you can use methods and events in this way

```html
<div id="app">
	<h1>{{ msg }}</h1>
	<button onclick="hi()">Click me</button>
</div>
```

```js
const vm = new Vue({
	el: "#app",
	data: {
		msg: "Hello",
	},
});

// toggle vm.msg between 'Hello' and "World"
const hi = () => vm.msg = vm.msg === "Hello" ? "World" : "Hello";
```

But today we going to programm this in the vue way:

```html
<div id="app">
	<h1>{{ msg }}</h1>
	<button v-on:click="hi">Click me</button>
</div>

```

```js
const vm = new Vue({
	el: "#app",
	data: {
		msg: "Hello",
	},
	methods: {
		hi() {
			this.msg = this.msg === "Hello" ? "World" : "Hello";
		},
	},
});
```

### What are methods and events in vue?

The concept of methods in vue has no diferrences with methods on javascript, basically is a sugar syntax. Same with the events.

### Implementing methods

First we can define a function that will read the methods and mix all those methods with our vue instance. Like this:

```js
function walkMethods(vue, methods) {
  for (const key in methods) {
    vue[key] = methods[key];
  }
}
```

Then call the function in the constructor before the created lifecycle hook.

```js
class Vue {
  constructor({ methods }) {
    // Before Create
    walkMethods(this, methods);

    // Create

    // Mount
```

And now you should be able to call `this.[method]` in the `vm` or `vm.[method]` outside of vue.

### Implementing events

Implementing events is more dificult. Javascript Dom cannot get attributes with specials characters like `@click` or `v-on:click`. So we need to handle that, for that I decided read the `innerHTML` and add `vue-event` as attribute when a `@[event]` or `v-on:[event]` is found in a element. Other thing to consider is editing the `innerHTML`, if we add a event and edit the `innerHTML` the element will lose all events, for this reason we need to edit the `innerHTML` before adding any event.

```js
const regex = {
  vueOn: /(@|v-on:)\w+="([0-z.?]+)\(?\)?"/,
};

function addAttributes(el) {
  el.innerHTML = el.innerHTML.replace(
    new RegExp(regex.vueOn, "g"),
    (match) => `vue-event ${match}`
  );

  return el;
}
```

After that we need a function that read all element with the `vue-event` attribute, add the event listener and remove all those attributes.

```js
function addEvents(vue) {
  vue.$el.querySelectorAll("[vue-event]").forEach((el) => {
		// extract name attr and method of v-on:[event]=[method] or @[event]=[method]
    const { name, value: method } = el.attributes[1];
		// get event from v-on:[event] or @[event]
    const event = /@/.test(name) ? name.slice(1) : name.split(":")[1];

    el.addEventListener(event, vue[method].bind(vue.$data));

    clearElement(el, ["vue-event",`v-on:${event}`, `@${event}`])
  });
}

function clearElement(el, attributes) {
  attributes.forEach(attr => el.removeAttribute(attr));
}
```

And finally, we need to use those functions on our render function.

```js
const regex = {
  mostach: /\{\{((?:.|\r?\n)+?)\}\}/,
};

function renderVue(vue) {
  const originalTemplate = addAttributes(vue.$el.cloneNode(true));

  return () => {
    const { $data } = vue;

    vue.$el.innerHTML = originalTemplate.innerHTML.replace(
      new RegExp(regex.mostach, "g"),
      (_, val) => $data[val.trim()]
    );

    addEvents(vue);
  };
}
```

Example of the rendering:
```html
<!-- Original --->
<button v-on:click="foo">I'm a button<button>

<!-- After addAttributes --->
<button v-on:click="foo" vue-event>I'm a button<button>

<!-- After rendering --->
<button>I'm a button<button>
```

### Conclusion

And we are finally done, adding methods is really easy but handling the events can be a headache.