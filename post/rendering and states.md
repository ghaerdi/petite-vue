# Code your own vue: rendering and states

Hi everyone. Almost a year ago I started using vuejs and I like how simple it is to use this framework so I decided to code my own vuejs.

### In this post we going to see:
- Render
- States
- Re-render when a state is updated

## Setup

The setup is simple to do, just create a new project with a html file and a js file. This is a part of my `index.html`:
```html
<body>
	<div id="app">
		{{ msg }}
	</div>
</body>

<script src="vue.js"></script>
<script>
	new Vue({
		el: "#app",
		data: {
			msg: "Hello"
		}
	})
</script>
```

That's enough for now, you can close the file. I coded my vue on the `vue.js` file, I recommend you do the same.

## Mount vue on the html element

Create the Vue class, add the constructor that will receive the config and pass the information to the class. Like this:
```js
class Vue {
  constructor(config) {
    this.el = document.querySelector(config.el);
    this.data = config.data;
  }
}
```

## Rendering

Here begins to be interesting.

```js
function renderVue(Vue) {
  const { data, el } = Vue;
  const { innerHTML } = el;

  Vue.el.innerHTML = innerHTML.replace(
    // Regex to find mustachoes.
    /\{\{((?:.|\r?\n)+?)\}\}/g,
    // Get the value of the property and replace it.
    (_, val) => data[val.trim()]
  );
}
```

This function read the `{{ msg }}` in the html file inside of the `#app` element and replace it to the value of `data.msg` defined in our instance. If you open your html file you should see a `Hello` instead of `{{ msg }}`.

Before opening the html file don't forget to call the function inside the constructor.

## Make data reactive

Now, you may want update the data and show it in the web page, guess what, that going to be our next step.

For that I created a function.
```js
function defineReactive(obj) {
	for (const key in obj) {
		let value = obj[key];
		Object.defineProperty(obj, key, {
			get() {
				return value;
			},
			set(newValue) {
				if (value === newValue) return;
				value = newValue;
				console.log(key, "updated");
			}
		})
	}
}
```
This function redefine all properties of `this.data` and change the SET behavior of each property.
It is important create a copy of the `obj`'s value or you going to fall on a recursion.
For now the function output `updated` when you change the value of a field. Call the function inside the constructor.
```js
class Vue {
  constructor(config) {
    // ...
    this.data = config.data;
    defineReactive(this.data);
  }
  //...
}
```
For test it yourself just update the `this.data.msg` field after calling the function and take a look to your console.

It works! (I hope the same for you), but the page doesn't update to show the new value, this is the last thing that we going to see in this post.

## Re-render

We already have a render function, you may figure out how we can render again the html: just calling the `renderVue` function instead of the `console.log`.

Sounds easy but actually is not that easy. Witch moustaches should replace if they're already replaced after the first render? For solve that problem, all what we need to do is save a copy of the original `innerHTML` you can do it in different ways, I prefer edit the `renderVue` function and take advantage of closures.

```js
function renderVue(Vue) {
	const originalInnerHTML = Vue.el.innerHTML;

	return () => {
		const { data } = Vue;

		Vue.el.innerHTML = originalInnerHTML.replace(
			/\{\{((?:.|\r?\n)+?)\}\}/g,
			(_, val) => data[val.trim()]
		);
	}
}
```

We are almost done. We need edit `defineReactive`, this function have a second parameter that receive a callback replacing the `console.log` that I wrote before.

To finish I declared a new variable with the return of `renderVue` and pass the new variable to `defineProperty`.

## Conclusion

We are done! After that you can update the data and the webpage going to render the new value. Now you have your own Vue, is not much but you can impress your friends with that (if you have).

Oh yes, here is my `vue.js` file:
```js
class Vue {
  constructor(config) {
    this.el = document.querySelector(config.el);
	this.data = config.data;

	const render = renderVue(this);

	render();
	defineReactive(this.data, render);
  }
}

function renderVue(Vue) {
	const originalInnerHTML = Vue.el.innerHTML;

	return () => {
		const { data } = Vue;

		Vue.el.innerHTML = originalInnerHTML.replace(
			/\{\{((?:.|\r?\n)+?)\}\}/g,
			(_, val) => data[val.trim()]
		);
	}
}

function defineReactive(obj, cb) {
	for (const key in obj) {
		let value = obj[key];
		Object.defineProperty(obj, key, {
			get() {
				return value;
			},
			set(newValue) {
				if (value === newValue) return;
				value = newValue;
				cb();
			}
		})
	}
}
```

I hope you learned something new. We have some interesting features to discover about this topic.

For now, have a happy coding.

## References

- [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [callback](https://www.w3schools.com/js/js_callback.asp)