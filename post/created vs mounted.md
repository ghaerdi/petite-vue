This is a continuation of [code your own vue](https://dev.to/ghaerdi/make-your-own-vue-rendering-and-states-jb6), in that post we started this topic and saw how to define reactive states and render everytime a state is updated. I recomend you read that post.

In this post we going to see:
- Vue lifecycle
- Created hook
- Mounted hook
- Implementation on our vue

we going to implement both methods in our vue.

### Vue's Lifecycle

Before explaning the differences of both methods, we need to know that each component has a lifecycle and this lifecycle can be defined in different steps that initialize a functionallities of the components. In the official vue's documentation we can found the next diagram that show all lifecycle's stages.

![vuejs's diagram about his lifecycles](https://vuejs.org/images/lifecycle.png)

### Created

In the diagram we can see that the created hook is called after the initialization of reactivity and the render function isn't called yet.
```js
class Vue {
  constructor(config) {
    // Before Create

    this.$el = document.querySelector(config.el);
    this.$data = config.data;

    const render = renderVue(this);

    walkDataProps(this, render);

    // Created

    // Before Mount

    render();

    // Mounted
  }
}
```
*Note:* I did some changes since the last post. `walkDataProps`'s function define the reactivity of our states in `this.$data` and `this` but the implementatios is almost the same of `defineReactivity`'s function from the last post.

### Mounted

### Conclusion

### References

- [Lifecycle Diagram](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
- [Lifecycle hooks](https://vuejs.org/v2/api/#beforeCreate)