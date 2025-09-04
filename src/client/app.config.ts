export default defineAppConfig({
  ui: {
    primary: 'sky',
    
    gray: 'cool',

    button: {
      font: 'font-semibold',
      default: {
        loadingIcon: 'i-bx-loader-alt'
      },
      rounded: 'rounded-2xl',
      color: {
        gray: {
          solid: 'ring-0'
        }
      }
    },

    buttonGroup: {
      rounded: 'rounded-2xl',
    },

    avatar: {
      rounded: 'rounded-2xl'
    },

    card: {
      background: 'bg-gray-1000',
      divide: 'divide-gray-100 dark:divide-gray-900',
      ring: 'ring-0',
      base: 'relative',
      rounded: 'rounded-2xl',
    },

    input: {
      default: {
        color: 'gray',
        size: 'lg',
        loadingIcon: 'i-bx-loader-alt'
      },
      rounded: 'rounded-2xl',
      color: { gray: { outline: 'dark:ring-gray-800 bg-gray' }} 
    },

    alert:{
      variant: {
        soft: 'bg-{color}-500 bg-opacity-10'
      },
      rounded: 'rounded-2xl',
    },

    badge: {
      base: 'relative',
      variant: {
        soft: 'bg-{color}-500 bg-opacity-10'
      },
      rounded: 'rounded-2xl',
    },

    modal: {
      container: 'items-center sm:items-center',
      overlay: {
        background: 'dark:bg-black/80 backdrop-blur'
      },
      rounded: 'rounded-2xl',
    },

    slideover: {
      overlay: {
        background: 'dark:bg-black/80 backdrop-blur'
      },
      background: 'bg-gray-1000'
    },

    notifications: {
      position: 'right-0 top-0 bottom-auto',
      container: 'px-2 sm:px-2 py-2 sm:py-2',
    },
    
    notification: {
      background: 'dark:bg-black/50 backdrop-blur',
      title: 'text-xs font-semibold',
      rounded: 'rounded-2xl',
      ring: 'ring-0',
      gap: 'gap-2',
      progress: {
        base: 'h-0.5'
      }
    },

    formGroup: {
      wrapper: 'mb-4',
      container: 'mt-2'
    },

    table: {
      divide: 'divide-gray-100 dark:divide-gray-900',
      tbody: 'divide-gray-100 dark:divide-gray-900',
      th: {
        base: 'whitespace-nowrap'
      },
      default: {
        emptyState: {
          label: 'Danh sách trống'
        }
      }
    },

    pagination: {
      wrapper: 'flex items-center gap-1',
      rounded: '!rounded-full min-w-[32px] justify-center',
      default: {
        size: 'xs'
      }
    },

    popover: {
      rounded: 'rounded-2xl',
    },

    select: {
      default: {
        loadingIcon: 'i-bx-loader-alt',
        color: 'gray',
      },
      rounded: 'rounded-2xl',
      color: {
        gray: {
          outline: 'dark:ring-gray-800 bg-gray'
        }
      }
    },

    selectMenu: {
      base: 'HideScroll',
      rounded: 'rounded-2xl',
      padding: 'p-1',
      shadow: 'shadow-xl',
      background: 'bg-gray-1000',
      ring: 'dark:ring-gray-800',
      option: {
        rounded: 'rounded-2xl',
        padding: 'px-3 py-2',
        active: 'bg-gray',
        selected: ''
      },
      input: 'rounded-2xl bg-gray-1000 border-b-0'
    },

    textarea: {
      default: {
        color: 'gray',
      },
      rounded: 'rounded-2xl',
      color: {
        gray: {
          outline: 'dark:ring-gray-800 bg-gray'
        }
      }
    },

    tabs: {
      list: {
        rounded: 'rounded-2xl',
        background: 'bg-gray-1000',
        marker: {
          rounded: 'rounded-xl',
          background: 'color-blue-light bg-anim-light'
        },
        tab: {
          rounded: 'rounded-xl',
        }
      }
    },

    chip: {
      base: 'dark:text-white z-[1] font-semibold ring-0',
      background: 'dark:bg-{color}-600',
      size: {
        '2xl': 'text-[12px] p-2'
      },
      position: {
        'top-right': 'top-0 right-1'
      },
      default: {
        size: '2xl',
      }
    },

    verticalNavigation: {
      rounded: 'rounded-2xl',
      base: 'before:rounded-2xl',
      badge: {
        base: 'rounded-2xl',
      }
    },

    skeleton: {
      background: 'bg-gray',
      rounded: 'rounded-2xl'
    },

    dropdown: {
      padding: 'p-0',
      shadow: 'shadow-xl',
      rounded: 'rounded-2xl',
      ring: 'ring-0 dark:ring-1',
      item: {
        rounded: 'rounded-none',
        padding: 'px-2 py-2'
      }
    }
  }
})