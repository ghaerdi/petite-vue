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
  constructor({ el, data }) {
    this.$el = document.querySelector(el);
    this.$data = data;
  }
}
```

## Rendering

Here begins to be interesting.

```js
const regex = {
  // regex to find mostachoes.
  mostach: /\{\{((?:.|\r?\n)+?)\}\}/,
};

function renderVue(vue) {
  const { $data, $el } = vue;
  const { innerHTML } = $el;

  vue.$el.innerHTML = innerHTML.replace(
    // make the regex global
    new RegExp(regex.mostach, "g"),
    // Get the value of the property and replace it.
    (_, val) => $data[val.trim()]
  );
}
```

This function read the `{{ msg }}` in the html file inside of the `#app` element and replace it to the value of `data.msg` defined in our instance. If you open your html file you should see a `Hello` instead of `{{ msg }}`.

Before open the html file don't forget to call the function inside the constructor.

## Make data reactive

Now, you may want update the data and show it in the web page, guess what, that going to be our next step.

For that I created those next functions.
```js
function walkDataProps(vue, cb) {
  for (const key in vue.$data) {
    // mix $data to vue and define reactive for those vue props
    defineReactive(vue, key);
    // define reactive for $data props
    defineReactive(vue, key, cb);
  }
}

function defineReactive(obj, key, cb) {
  let value = obj.$data[key];

  Object.defineProperty(cb ? obj.$data : obj, key, {
    configurable: true,
    get() {
      return value;
    },
    set(newValue) {
      if (value === newValue) return;
      value = newValue;

      if (cb) {
        obj[key] = value;
        cb();
      } else {
        obj.$data[key] = value;
      }
    },
  });
}
```
The `defineReactive` function change the SET behavior of a specific property in `this.$data`, if you don't pass a `cb` function or `cb` is a falsy value then `defineReactive` mix that specific property from `this.$data` to `this` and is going to change the SET behavior of those new proprerties.
It's important create a copy of the `obj`'s value or you going to fall on a recursion.

The `walkDataProps` function will pass each property in `this.$data` to `defineReactive`. Calling `defineProperty` twice, one with `cb` and the other without `cb`, allow us to read and update a state from `this` or `this.$data` and the updated data is syncronized in both ways.

```js
class Vue {
  constructor({ data }) {
    walkDataProps(this, () => console.log("updated"));
  }
}
```
For test it yourself just update the `this.$data.msg` or `this.msg` field after calling the function and take a look to your console, should print `updated`.

It works! (I hope the same for you), but the page doesn't update to show the new value, this is the last thing that we going to see in this post.

## Re-render

We already have a render function, you may figure out how we can render again the html: just passing the `renderVue` function as callback in `walkDataProps` instead of the `console.log`.

Sounds easy but actually is not that easy. Witch moustaches should replace if they're already replaced after the first render? For solve that problem, all what we need to do is save a copy of the original `innerHTML` you can do it in different ways, I prefer edit the `renderVue` function and take advantage of closures.

```js
const regex = {
  mostach: /\{\{((?:.|\r?\n)+?)\}\}/,
};

function renderVue(vue) {
  const originalTemplate = vue.$el.cloneNode(true);

  return () => {
    const { $data } = vue;

    vue.$el.innerHTML = originalTemplate.innerHTML.replace(
      new RegExp(regex.mostach, "g"),
      (_, val) => $data[val.trim()]
    );
  };
}
```

Pass the returned function of `renderVue` to `walkDataProps`.

## Conclusion

We are done! After that you can update the data and the webpage going to render the new value. Now you have your own Vue, is not much but you can impress your friends with that (if you have).

Oh yes, here is my `vue.js` file:
```js
class Vue {
  constructor({ el, data }) {
    this.$el = document.querySelector(el);
    this.$data = data;

    const render = renderVue(this);
    walkDataProps(this, render);
    render();
  }
}

const regex = {
  mostach: /\{\{((?:.|\r?\n)+?)\}\}/,
};

function renderVue(vue) {
  const originalTemplate = vue.$el.cloneNode(true);

  return () => {
    const { $data } = vue;

    vue.$el.innerHTML = originalTemplate.innerHTML.replace(
      new RegExp(regex.mostach, "g"),
      (_, val) => $data[val.trim()]
    );
  };
}

function walkDataProps(vue, cb) {
  for (const key in vue.$data) {
    defineReactive(vue, key);
    defineReactive(vue, key, cb);
  }
}

function defineReactive(obj, key, cb) {
  let value = obj.$data[key];

  Object.defineProperty(cb ? obj.$data : obj, key, {
    configurable: true,
    get() {
      return value;
    },
    set(newValue) {
      if (value === newValue) return;
      value = newValue;

      if (cb) {
        obj[key] = value;
        cb();
      } else {
        obj.$data[key] = value;
      }
    },
  });
}
```

I hope you learned something new. We have some interesting features to discover about this topic.

For now, have a happy coding.

## References

- [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [callback](https://www.w3schools.com/js/js_callback.asp)
- [falsy value](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
- [ternary conditional](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)