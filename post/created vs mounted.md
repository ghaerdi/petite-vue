# Code your own vue: created vs mounted

In the last post of code your own vue we have seen how to define reactive states and render every time a state is updated.

When I started using vue I was confused about the differences between mounted and created, if you don't know either then it is a good opportunity to show what is the difference between both hooks.

In this post we are going to see:
- Vue's lifecycle
- Created hook
- Mounted hook
- Implementation of both methods

## Vue's lifecycle

Before explaining the differences between methods, we need to know that each component or vue instance has a lifecycle.

A lifecycle in vue can be defined in different steps that initialize some functionalities, from create to mount and from mount to destroy. In the official vue's documentation we can find the next diagram about the lifecycle.

![vuejs's diagram about his lifecycles](https://vuejs.org/images/lifecycle.png)

### Lifecycle Hooks

Are methods defined by the coder that are called at certain moment in the lifecycle.

These are the lifecycle hooks:
- beforeCreate
- created
- beforeMount
- mounted
- beforeUpdated
- updated
- beforeDestroy
- destroyed

## Created

In the diagram we can see that the created hook is called after the initialization of reactivity and the render function isn't called yet.

In the constructor I added a comment of where should be called the `created` method.
```js
class Vue {
  constructor({ el, data }) {
    this.$el = document.querySelector(el);
    this.$data = data;

    // created

    const render = renderVue(this);
    walkDataProps(this, render);
    render();
  }
}
```

Under that comment I added this next line:
```js
// created
created?.bind(this)();
```

The method can be `undefined` so I'm using optional chaining (`?.`) to avoid errors, and I uses `bind` for pass the lost reference of `Vue`.

But `config.created` should have access to the states and before to declare the `render` function. So I called the `walkDataProps` whitout passing the `render` function before to the call of `config.created`, and after the call of that hook I called `walkDataProps` again but passing `render` in this time:

```js
walkDataProps(this);

// created
created?.bind(this)();

const render = renderVue(this);
walkDataProps(this, render);
render();
```

### Why created should be called before of the declaration of render?

When you want append a html element through `created` like:

```html
<div>{{ msg }}</div>
```

Then the `render` function should read that new element an replaced it to our defined state:

```html
<div>Hello</div>
```

In Vue if you append that element after the render using `mounted` the append element going to not be replaced.

In practical terms that is the main different from created and mounted.

## Mounted

The mounted hook is called after the first rendering.
In vue you can call `this.$mount()` to run it when you need, I implemented that method too. This is how looks my constructor after calling all those hooks.

```js
class Vue {
  constructor({ el, data, beforeCreate, created, mounted, methods }) {
    this.$el = document.querySelector(el);
    this.$data = data;

    walkDataProps(this);

    // created
    created?.bind(this)();

    const render = renderVue(this);
    walkDataProps(this, render);
    render();

    // mounted
    if (mounted) {
      this.$mount = mounted;
      this.$mount();
    }
  }
}
```

As I explained before, appending a element with this hook is going to not be rendered, the `renderVue` implementation doesn't keep the appended element.

In the original Vue their implementation handle the appended element to keep in the page but will not be replaced to a state in a re-render.

so looks like in vue with the following code:

```html
<body>
  <div id="app">
    <h1>{{ msg }}</h1>
  </div>
</body>

<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>

<script>
  const vm = new Vue({
    el: "#app",
    data: {
      msg: "Hello",
    },
    created() {
      addElement("app", "created: {{ msg }}");
    },
    mounted() {
      addElement("app", "mounted: {{ msg }}");

      // update a state for re-rendering
      this.msg += " world";
    },
  });

  function addElement(id, text) {
    const el = document.getElementById(id);
    const div = document.createElement("DIV");
    div.innerHTML = text;
    el.appendChild(div);
  }
</script>
```

Result:
![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6ulsz17ylgk1dlv2jrix.png)


The same code but using our vue:
![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/feotuj2cmivjmo6i4ub7.png)

`mounted: {{ msg }}` dissapears after the re-render.

## Conclusion

Now we know what is the differences of both hooks, vue have more lifecycle hooks that we can see in a future post but I think those hooks are enough for now, and after understanding this article is easy to implement others hooks.

Thats all for this post, have a happy coding.

## References

- [Lifecycle Diagram](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
- [Lifecycle hooks](https://vuejs.org/v2/api/#beforeCreate)
- [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Function.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)