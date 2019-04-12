import Vue from 'vue'
import { mergeData } from 'vue-functional-data-merge'

export const props = {
  id: {
    type: String,
    default: null
  },
  tag: {
    type: String,
    default: 'h6'
  }
}

// @vue/component
export default Vue.extend({
  name: 'BDropdownHeader',
  functional: true,
  props,
  render(h, { props, data, children }) {
    return h('li', [
      h(
        props.tag,
        mergeData(data, {
          staticClass: 'dropdown-header',
          attrs: { id: props.id || null },
          ref: 'header'
        }),
        children
      )
    ])
  }
})
