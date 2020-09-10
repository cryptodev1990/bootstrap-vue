import Vue from '../../utils/vue'
import { BvEvent } from '../../utils/bv-event.class'
import { getComponentConfig } from '../../utils/config'
import { attemptFocus, isVisible } from '../../utils/dom'
import { isUndefinedOrNull } from '../../utils/inspect'
import { mathCeil, mathMax } from '../../utils/math'
import { toInteger } from '../../utils/number'
import paginationMixin from '../../mixins/pagination'

// --- Constants ---

const NAME = 'BPagination'

const DEFAULT_PER_PAGE = 20
const DEFAULT_TOTAL_ROWS = 0

const props = {
  size: {
    type: String,
    default: () => getComponentConfig(NAME, 'size')
  },
  perPage: {
    type: [Number, String],
    default: DEFAULT_PER_PAGE
  },
  totalRows: {
    type: [Number, String],
    default: DEFAULT_TOTAL_ROWS
  },
  ariaControls: {
    type: String
    // default: null
  }
}

// --- Helper functions ---

// Sanitize the provided per page number (converting to a number)
const sanitizePerPage = val => mathMax(toInteger(val) || DEFAULT_PER_PAGE, 1)

// Sanitize the provided total rows number (converting to a number)
const sanitizeTotalRows = val => mathMax(toInteger(val) || DEFAULT_TOTAL_ROWS, 0)

// The render function is brought in via the `paginationMixin`
// @vue/component
export const BPagination = /*#__PURE__*/ Vue.extend({
  name: NAME,
  mixins: [paginationMixin],
  props,
  computed: {
    numberOfPages() {
      const result = mathCeil(sanitizeTotalRows(this.totalRows) / sanitizePerPage(this.perPage))
      return result < 1 ? 1 : result
    },
    pageSizeNumberOfPages() {
      // Used for watching changes to `perPage` and `numberOfPages`
      return {
        perPage: sanitizePerPage(this.perPage),
        totalRows: sanitizeTotalRows(this.totalRows),
        numberOfPages: this.numberOfPages
      }
    }
  },
  watch: {
    pageSizeNumberOfPages(newVal, oldVal) {
      if (!isUndefinedOrNull(oldVal)) {
        if (newVal.perPage !== oldVal.perPage && newVal.totalRows === oldVal.totalRows) {
          // If the page size changes, reset to page 1
          this.currentPage = 1
        } else if (
          newVal.numberOfPages !== oldVal.numberOfPages &&
          this.currentPage > newVal.numberOfPages
        ) {
          // If `numberOfPages` changes and is less than
          // the `currentPage` number, reset to page 1
          this.currentPage = 1
        }
      }
      this.localNumberOfPages = newVal.numberOfPages
    }
  },
  created() {
    // Set the initial page count
    this.localNumberOfPages = this.numberOfPages
    // Set the initial page value
    const currentPage = toInteger(this.value, 0)
    if (currentPage > 0) {
      this.currentPage = currentPage
    } else {
      this.$nextTick(() => {
        // If this value parses to `NaN` or a value less than `1`
        // trigger an initial emit of `null` if no page specified
        this.currentPage = 0
      })
    }
  },
  mounted() {
    // Set the initial page count
    this.localNumberOfPages = this.numberOfPages
  },
  methods: {
    // These methods are used by the render function
    onClick(evt, pageNumber) {
      // Dont do anything if clicking the current active page
      if (pageNumber === this.currentPage) {
        return
      }

      const { target } = evt

      // Emit a user-cancelable `page-click` event
      const clickEvt = new BvEvent('page-click', {
        cancelable: true,
        vueTarget: this,
        target
      })
      this.$emit(clickEvt.type, clickEvt, pageNumber)
      if (clickEvt.defaultPrevented) {
        return
      }

      console.log(evt, pageNumber)

      // Update the `v-model`
      this.currentPage = pageNumber
      // Emit event triggered by user interaction
      this.$emit('change', this.currentPage)

      // Keep the current button focused if possible
      this.$nextTick(() => {
        if (isVisible(target) && this.$el.contains(target)) {
          attemptFocus(target)
        } else {
          this.focusCurrent()
        }
      })
    },
    makePage(pageNum) {
      return pageNum
    },
    /* istanbul ignore next */
    linkProps() {
      // No props, since we render a plain button
      /* istanbul ignore next */
      return {}
    }
  }
})
