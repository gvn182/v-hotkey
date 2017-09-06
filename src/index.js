import keyCode from './keycode'

const getKeyMap = keymap => Object.keys(keymap).map(input => {
  const result = {}
  input.split('+').forEach(keyName => {
    switch (keyName.toLowerCase()) {
      case 'ctrl':
      case 'alt':
      case 'shift':
      case 'meta':
        result[keyName] = true
        break
      default:
        result.keyCode = keyCode(keyName)
    }
  })
  result.callback = keymap[input]
  return result
})

export default {
  install (Vue) {
    Vue.directive('hotkey', {
      bind (el, binding, vnode, oldVnode) {
        el._keymap = getKeyMap(binding.value)

        el._keymapHasKeyUp = el._keymap.some(hotkey => hotkey.callback.keyup)

        el._keyHandler = e => {
          for (const hotkey of el._keymap) {
            const callback = hotkey.keyCode === e.keyCode &&
              !!hotkey.ctrl === e.ctrlKey &&
              !!hotkey.alt === e.altKey &&
              !!hotkey.shift === e.shiftKey &&
              !!hotkey.meta === e.metaKey &&
              (e.type === 'keydown'
                ? (hotkey.callback.keydown || hotkey.callback)
                : (hotkey.callback.keyup)
              )
            if (callback) {
              callback(e)
            }
          }
        }
        document.addEventListener('keydown', el._keyHandler)
        if (el._keymapHasKeyUp) {
          document.addEventListener('keyup', el._keyHandler)
        }
      },
      unbind (el, binding, vnode, oldVnode) {
        document.removeEventListener('keydown', el._keyHandler)
        if (el._keymapHasKeyUp) {
          document.removeEventListener('keyup', el._keyHandler)
        }
      }
    })
  }
}
